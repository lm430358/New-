import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { PurchaseOrder, PurchaseOrderLineItem, Vendor, BusinessProfile } from "@prisma/client";

type POWithRelations = PurchaseOrder & {
  lineItems: PurchaseOrderLineItem[];
  vendor: Vendor | null;
  businessProfile?: BusinessProfile | null;
};

export function computePoTotals(po: POWithRelations) {
  const subtotal = po.lineItems.reduce((sum, li) => sum + li.quantity * li.unitPrice, 0);
  const tax = subtotal * (po.taxRate / 100);
  const total = subtotal + tax + po.shippingCost;
  return { subtotal, tax, total };
}

export async function generatePurchaseOrderPdf(po: POWithRelations): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]); // Letter
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const margin = 50;
  let y = 792 - margin;
  const { subtotal, tax, total } = computePoTotals(po);

  function text(str: string, x: number, size = 10, f = font, color = rgb(0.08, 0.09, 0.12)) {
    page.drawText(str, { x, y, size, font: f, color });
  }

  text("PURCHASE ORDER", margin, 20, bold);
  y -= 28;
  text(`PO #: ${po.poNumber}`, margin, 11, bold);
  text(`Date: ${po.date.toISOString().slice(0, 10)}`, 400, 11);
  y -= 16;
  text(`Status: ${po.status}`, margin, 10);
  y -= 24;

  if (po.businessProfile) {
    text("From:", margin, 10, bold);
    y -= 14;
    text(po.businessProfile.businessName, margin, 10);
    y -= 12;
    if (po.businessProfile.city || po.businessProfile.state) {
      text([po.businessProfile.city, po.businessProfile.state].filter(Boolean).join(", "), margin, 10);
      y -= 12;
    }
    y -= 8;
  }

  text("Vendor:", margin, 10, bold);
  y -= 14;
  text(po.vendor?.name ?? "(no vendor selected)", margin, 10);
  y -= 12;
  if (po.vendor?.website) {
    text(po.vendor.website, margin, 10);
    y -= 12;
  }
  y -= 16;

  // Table header
  const cols = { part: margin, desc: margin + 90, qty: 380, unit: 430, total: 500 };
  text("Part #", cols.part, 9, bold);
  text("Description", cols.desc, 9, bold);
  text("Qty", cols.qty, 9, bold);
  text("Unit Price", cols.unit, 9, bold);
  text("Line Total", cols.total, 9, bold);
  y -= 6;
  page.drawLine({ start: { x: margin, y }, end: { x: 562, y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
  y -= 14;

  for (const li of po.lineItems) {
    if (y < 100) {
      y = 792 - margin;
      doc.addPage([612, 792]);
    }
    const lineTotal = li.quantity * li.unitPrice;
    text(li.partNumber ?? "—", cols.part, 9);
    text(li.description.slice(0, 45), cols.desc, 9);
    text(String(li.quantity), cols.qty, 9);
    text(`$${li.unitPrice.toFixed(2)}`, cols.unit, 9);
    text(`$${lineTotal.toFixed(2)}`, cols.total, 9);
    y -= 16;
  }

  y -= 10;
  page.drawLine({ start: { x: 380, y }, end: { x: 562, y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
  y -= 16;
  text("Subtotal:", 430, 10);
  text(`$${subtotal.toFixed(2)}`, 500, 10);
  y -= 14;
  text(`Tax (${po.taxRate}%):`, 430, 10);
  text(`$${tax.toFixed(2)}`, 500, 10);
  y -= 14;
  text("Shipping:", 430, 10);
  text(`$${po.shippingCost.toFixed(2)}`, 500, 10);
  y -= 16;
  text("Total:", 430, 12, bold);
  text(`$${total.toFixed(2)}`, 500, 12, bold);

  if (po.notes) {
    y -= 30;
    text("Notes:", margin, 10, bold);
    y -= 14;
    text(po.notes.slice(0, 500), margin, 9);
  }

  return doc.save();
}
