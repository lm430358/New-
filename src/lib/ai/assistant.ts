import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, MODEL } from "@/lib/ai/client";
import { ACCURACY_RULES, buildBusinessContext } from "@/lib/ai/context";
import { prisma } from "@/lib/prisma";
import { getActiveBusinessProfile } from "@/lib/business";
import { calculateProfit } from "@/lib/profit";
import { computeSourcingScore, matchPreferences } from "@/lib/sourcingScore";
import { VENDOR_REFERENCE_LIST } from "@/lib/vendorSeed";
import { draftVendorMessage, type ContactPurpose } from "@/lib/ai/generators/vendorContact";
import { safeJsonParse } from "@/lib/utils";

type ToolDef = Anthropic.Tool;

const TOOLS: ToolDef[] = [
  {
    name: "list_vendors",
    description:
      "Search the user's saved Vendor database (real vendors they've researched/entered), optionally filtered. Also can include the app's static reference list of well-known national suppliers when includeReferenceList is true. Never returns invented vendors.",
    input_schema: {
      type: "object",
      properties: {
        vendorType: { type: "string", description: "Optional vendor type filter, e.g. wholesale_distributor, salvage_recycled, heavy_duty" },
        wholesaleOnly: { type: "boolean", description: "Only vendors with verified wholesale status" },
        city: { type: "string" },
        state: { type: "string" },
        favoriteOnly: { type: "boolean" },
        query: { type: "string", description: "Free-text match against vendor name/notes" },
        includeReferenceList: { type: "boolean", description: "Also include the static reference list of well-known national suppliers" },
      },
    },
  },
  {
    name: "get_vendor_detail",
    description: "Get full detail for one saved vendor by id, including its logged price checks and sourcing score.",
    input_schema: {
      type: "object",
      properties: { vendorId: { type: "string" } },
      required: ["vendorId"],
    },
  },
  {
    name: "compute_profit",
    description: "Deterministically calculate total cost, gross profit, gross margin %, and markup % for a resale scenario.",
    input_schema: {
      type: "object",
      properties: {
        purchaseCost: { type: "number" },
        shipping: { type: "number" },
        otherCosts: { type: "number" },
        sellingPrice: { type: "number" },
      },
      required: ["purchaseCost", "shipping", "otherCosts", "sellingPrice"],
    },
  },
  {
    name: "lookup_cross_reference",
    description: "Look up saved cross-references for a part number in the user's cross-reference database. Never invents a match.",
    input_schema: {
      type: "object",
      properties: { partNumber: { type: "string" } },
      required: ["partNumber"],
    },
  },
  {
    name: "list_inventory",
    description: "List the user's inventory items, optionally only ones at/below their reorder level (low stock).",
    input_schema: {
      type: "object",
      properties: { lowStockOnly: { type: "boolean" } },
    },
  },
  {
    name: "draft_vendor_contact_message",
    description:
      "Draft (never send) a professional inquiry message to a saved vendor about wholesale pricing, availability, or general terms. Saved as a draft the user must review before sending themselves.",
    input_schema: {
      type: "object",
      properties: {
        vendorId: { type: "string" },
        purpose: { type: "string", enum: ["wholesale_inquiry", "availability", "general"] },
        extraContext: { type: "string" },
      },
      required: ["vendorId", "purpose"],
    },
  },
  {
    name: "create_purchase_order_draft",
    description: "Create a draft purchase order with line items for a vendor. Status starts as 'draft' — nothing is sent to the vendor.",
    input_schema: {
      type: "object",
      properties: {
        vendorId: { type: "string" },
        poNumber: { type: "string" },
        lineItems: {
          type: "array",
          items: {
            type: "object",
            properties: {
              partNumber: { type: "string" },
              description: { type: "string" },
              quantity: { type: "number" },
              unitPrice: { type: "number" },
            },
            required: ["description", "quantity", "unitPrice"],
          },
        },
        shippingCost: { type: "number" },
        taxRate: { type: "number" },
        notes: { type: "string" },
      },
      required: ["poNumber", "lineItems"],
    },
  },
];

async function runTool(name: string, input: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case "list_vendors": {
      const where: Record<string, unknown> = {};
      if (input.vendorType) where.vendorType = input.vendorType;
      if (input.wholesaleOnly) where.wholesaleStatus = "verified";
      if (input.favoriteOnly) where.favorite = true;
      if (input.city) where.city = { contains: input.city as string };
      if (input.state) where.state = { contains: input.state as string };
      if (input.query) {
        where.OR = [
          { name: { contains: input.query as string } },
          { notes: { contains: input.query as string } },
        ];
      }
      const vendors = await prisma.vendor.findMany({ where, take: 15, orderBy: { updatedAt: "desc" } });
      const result: Record<string, unknown> = {
        savedVendors: vendors.map((v) => ({
          id: v.id,
          name: v.name,
          vendorType: v.vendorType,
          wholesaleStatus: v.wholesaleStatus,
          city: v.city,
          state: v.state,
          status: v.status,
          favorite: v.favorite,
        })),
      };
      if (input.includeReferenceList) {
        result.referenceListNote =
          "These are well-known national suppliers from the app's static reference list, NOT verified by the user — pricing/terms must be checked directly.";
        result.referenceList = VENDOR_REFERENCE_LIST;
      }
      if (vendors.length === 0 && !input.includeReferenceList) {
        result.note = "No saved vendors matched. Consider calling again with includeReferenceList: true, or ask the user to add vendors.";
      }
      return result;
    }
    case "get_vendor_detail": {
      const vendor = await prisma.vendor.findUnique({
        where: { id: input.vendorId as string },
        include: { priceChecks: { orderBy: { checkedAt: "desc" }, take: 10 } },
      });
      if (!vendor) return { error: "Vendor not found." };
      const profile = await getActiveBusinessProfile();
      const preferredSuppliers = safeJsonParse<string[]>(profile?.preferredSuppliers, []);
      const preferredBrands = safeJsonParse<string[]>(profile?.preferredBrands, []);
      const vendorBrands = vendor.priceChecks.map((p) => p.brand).filter((b): b is string => !!b);
      const { matchesPreferredSupplier, matchesPreferredBrand } = matchPreferences(
        preferredSuppliers,
        preferredBrands,
        vendor.name,
        vendorBrands
      );
      const score = computeSourcingScore({
        wholesaleStatus: vendor.wholesaleStatus,
        localVerified: vendor.localVerified,
        website: vendor.website,
        phone: vendor.phone,
        returnPolicy: vendor.returnPolicy,
        warrantyInfo: vendor.warrantyInfo,
        shippingInfo: vendor.shippingInfo,
        minimumOrder: vendor.minimumOrder,
        internalRating: vendor.internalRating,
        status: vendor.status,
        verificationDate: vendor.verificationDate,
        priceCheckCount: vendor.priceChecks.length,
        matchesPreferredSupplier,
        matchesPreferredBrand,
      });
      return { vendor, sourcingScore: score };
    }
    case "compute_profit": {
      return calculateProfit({
        purchaseCost: Number(input.purchaseCost) || 0,
        shipping: Number(input.shipping) || 0,
        otherCosts: Number(input.otherCosts) || 0,
        sellingPrice: Number(input.sellingPrice) || 0,
      });
    }
    case "lookup_cross_reference": {
      const partNumber = String(input.partNumber ?? "");
      const matches = await prisma.crossReference.findMany({
        where: {
          OR: [
            { originalPartNumber: { contains: partNumber } },
            { alternatePartNumber: { contains: partNumber } },
          ],
        },
        take: 10,
      });
      return {
        matches,
        note: matches.length === 0 ? "No saved cross-references found for this part number." : undefined,
      };
    }
    case "list_inventory": {
      const items = await prisma.inventoryItem.findMany({ orderBy: { updatedAt: "desc" }, take: 50 });
      const filtered = input.lowStockOnly ? items.filter((i) => i.quantity <= i.reorderLevel) : items;
      return { items: filtered };
    }
    case "draft_vendor_contact_message": {
      const vendor = await prisma.vendor.findUnique({ where: { id: input.vendorId as string } });
      if (!vendor) return { error: "Vendor not found." };
      const profile = await getActiveBusinessProfile();
      const draft = await draftVendorMessage(
        vendor,
        (input.purpose as ContactPurpose) ?? "general",
        profile,
        input.extraContext as string | undefined
      );
      const saved = await prisma.vendorContactMessage.create({
        data: {
          vendorId: vendor.id,
          purpose: (input.purpose as string) ?? "general",
          subject: draft.subject,
          body: draft.body,
        },
      });
      return { draftId: saved.id, subject: draft.subject, body: draft.body, note: "Saved as a draft. The user must review and send it themselves." };
    }
    case "create_purchase_order_draft": {
      const profile = await getActiveBusinessProfile();
      const lineItems = (input.lineItems as Array<Record<string, unknown>>) ?? [];
      const po = await prisma.purchaseOrder.create({
        data: {
          businessProfileId: profile?.id,
          vendorId: (input.vendorId as string) || undefined,
          poNumber: String(input.poNumber ?? `PO-${Date.now()}`),
          shippingCost: Number(input.shippingCost) || 0,
          taxRate: Number(input.taxRate) || 0,
          notes: (input.notes as string) || undefined,
          lineItems: {
            create: lineItems.map((li, idx) => ({
              partNumber: (li.partNumber as string) || undefined,
              description: String(li.description ?? ""),
              quantity: Number(li.quantity) || 1,
              unitPrice: Number(li.unitPrice) || 0,
              sortOrder: idx,
            })),
          },
        },
        include: { lineItems: true },
      });
      return { purchaseOrderId: po.id, poNumber: po.poNumber, status: po.status };
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

export interface AssistantTurnResult {
  reply: string;
  toolTrace: { tool: string; input: unknown; output: unknown }[];
}

export async function runAssistantTurn(conversationHistory: { role: "user" | "assistant"; content: string }[]): Promise<AssistantTurnResult> {
  const profile = await getActiveBusinessProfile();
  const system = [
    ACCURACY_RULES,
    buildBusinessContext(profile),
    `You are the AI Command Center for this app. You can call tools to look up the user's real saved
data (vendors, prices, inventory, cross-references) and to perform actions (draft a vendor message,
create a purchase order draft, compute profit). Prefer calling a tool over guessing whenever the
question depends on data that could exist in the database. When you recommend vendors, only reference
ones returned by list_vendors (saved or reference list) — never invent one. Keep replies concise and
actionable. Replies are rendered as plain text, not markdown, so do NOT use **bold**, ## headers, or
markdown tables — use plain line breaks and "-" for list items instead.`,
  ].join("\n\n");

  const messages: Anthropic.MessageParam[] = conversationHistory.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const toolTrace: AssistantTurnResult["toolTrace"] = [];
  const MAX_TURNS = 6;

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system,
      tools: TOOLS,
      messages,
    });

    if (response.stop_reason !== "tool_use") {
      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      return { reply: text || "(no response)", toolTrace };
    }

    messages.push({ role: "assistant", content: response.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type !== "tool_use") continue;
      const input = (block.input ?? {}) as Record<string, unknown>;
      let output: unknown;
      try {
        output = await runTool(block.name, input);
      } catch (err) {
        output = { error: err instanceof Error ? err.message : "Tool execution failed." };
      }
      toolTrace.push({ tool: block.name, input, output });
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(output),
      });
    }
    messages.push({ role: "user", content: toolResults });
  }

  return { reply: "I wasn't able to finish that within the tool-call budget — try breaking the request into smaller steps.", toolTrace };
}

export function messagesToHistory(msgs: { role: string; content: string }[]) {
  return msgs.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
}
