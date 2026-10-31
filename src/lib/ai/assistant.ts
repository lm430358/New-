import Anthropic from "@anthropic-ai/sdk";
import { anthropic, MODEL } from "./client";
import { buildSystemPrompt } from "./context";
import type { BusinessContext } from "@/lib/types";
import { prisma } from "@/lib/prisma";
import { getActiveBusinessProfile } from "@/lib/business";
import {
  generateSocialPost,
  generateVideoScript,
  generateEmail,
  generateBlogPost,
  generateHooks,
  improveContent,
} from "./generators";
import { generateRepurposeOutput } from "./generators/repurpose";
import { generateCalendar } from "./generators/calendar";
import { generateCampaign } from "./generators/campaign";
import { generateContentIdeas } from "./generators/ideas";
import {
  socialPostToText,
  videoScriptToText,
  emailToText,
  blogPostToText,
  hookSetToText,
} from "@/lib/format";

export interface AssistantToolOutput {
  title: string;
  contentType: string;
  platform?: string;
  content: unknown;
  text: string;
}

export type AgentId = "assistant" | "marcus";

export const AGENT_IDS: AgentId[] = ["assistant", "marcus"];

const baseTools: Anthropic.Tool[] = [
  {
    name: "generate_social_post",
    description: "Write one social media post for a specific platform, adapted to that platform's style.",
    input_schema: {
      type: "object",
      properties: {
        platform: { type: "string", description: "facebook, instagram, tiktok, linkedin, or youtube" },
        topic: { type: "string", description: "What the post should be about" },
        goal: { type: "string", description: "Optional goal: Awareness, Engagement, Leads, Sales, Education, Trust, Community, Promotion" },
      },
      required: ["platform", "topic"],
    },
  },
  {
    name: "generate_video_script",
    description: "Write a short-form video script (hook, sections, on-screen text, b-roll, camera direction, CTA, caption, hashtags).",
    input_schema: {
      type: "object",
      properties: {
        topic: { type: "string" },
        platform: { type: "string", description: "e.g. TikTok, Reels, YouTube Shorts" },
        lengthLabel: { type: "string", description: "e.g. '30 seconds', '60 seconds'" },
      },
      required: ["topic", "lengthLabel"],
    },
  },
  {
    name: "generate_email",
    description: "Write a marketing email with subject line options, body, and CTA.",
    input_schema: {
      type: "object",
      properties: {
        topic: { type: "string" },
        purpose: { type: "string" },
      },
      required: ["topic"],
    },
  },
  {
    name: "generate_blog_post",
    description: "Write a full blog post with headings, body, and CTA.",
    input_schema: {
      type: "object",
      properties: { topic: { type: "string" } },
      required: ["topic"],
    },
  },
  {
    name: "generate_hooks",
    description: "Write 10 varied short-form video hooks for a topic.",
    input_schema: {
      type: "object",
      properties: { topic: { type: "string" } },
      required: ["topic"],
    },
  },
  {
    name: "improve_content",
    description:
      "Rewrite content the user pasted. action must be one of: better, engaging, shorter, professional, persuasive, emotional, viral, hooks, cta, brand_voice.",
    input_schema: {
      type: "object",
      properties: {
        content: { type: "string" },
        action: { type: "string" },
      },
      required: ["content", "action"],
    },
  },
  {
    name: "repurpose_content",
    description: "Turn one pasted piece of content (transcript, article, post) into many formats: FB/LinkedIn posts, 3 IG captions, 5 TikTok ideas, 5 short scripts, email, blog post, carousel, 10 hooks. Expensive — only use when the user pastes real source content to repurpose.",
    input_schema: {
      type: "object",
      properties: { sourceContent: { type: "string" } },
      required: ["sourceContent"],
    },
  },
  {
    name: "generate_content_calendar",
    description: "Generate a content calendar for the next N days (max 30 from this tool — for longer calendars direct the user to the Content Calendar page).",
    input_schema: {
      type: "object",
      properties: {
        days: { type: "number", description: "Number of days, max 30" },
      },
      required: ["days"],
    },
  },
];

// Extra tools only Marcus (the marketing agent) gets — strategy-level work.
const marketingTools: Anthropic.Tool[] = [
  {
    name: "plan_marketing_campaign",
    description:
      "Build a full marketing campaign: strategy summary, key messages, headlines, CTAs, ad copy variants, plus social posts, a video script, and an email. Expensive — use when the user wants a campaign or launch plan for a specific offer.",
    input_schema: {
      type: "object",
      properties: {
        productOrService: { type: "string" },
        targetCustomer: { type: "string" },
        offer: { type: "string", description: "The specific offer or promotion being marketed" },
        price: { type: "string" },
        goal: { type: "string", description: "e.g. Leads, Sales, Awareness, Bookings" },
        lengthDays: { type: "number", description: "Campaign length in days (1-90)" },
      },
      required: ["productOrService", "targetCustomer", "offer", "goal", "lengthDays"],
    },
  },
  {
    name: "generate_content_ideas",
    description: "Generate 10+ concrete content ideas across categories, tied to the business's content pillars.",
    input_schema: {
      type: "object",
      properties: {
        recentTopics: { type: "array", items: { type: "string" }, description: "Topics already covered, to avoid repeating" },
      },
    },
  },
];

const TOOLS_BY_AGENT: Record<AgentId, Anthropic.Tool[]> = {
  assistant: baseTools,
  marcus: [...baseTools, ...marketingTools],
};

async function executeTool(name: string, input: Record<string, unknown>, ctx: BusinessContext): Promise<{
  forModel: string;
  output?: AssistantToolOutput | AssistantToolOutput[];
}> {
  switch (name) {
    case "generate_social_post": {
      const post = await generateSocialPost(ctx, {
        platform: String(input.platform),
        topic: String(input.topic),
        goal: input.goal ? String(input.goal) : undefined,
      });
      const text = socialPostToText(post);
      return {
        forModel: text,
        output: { title: `${input.platform} post`, contentType: "social_post", platform: String(input.platform), content: post, text },
      };
    }
    case "generate_video_script": {
      const script = await generateVideoScript(ctx, {
        topic: String(input.topic),
        platform: input.platform ? String(input.platform) : undefined,
        lengthLabel: String(input.lengthLabel ?? "30-60 seconds"),
      });
      const text = videoScriptToText(script);
      return {
        forModel: text,
        output: { title: "Video script", contentType: "video_script", content: script, text },
      };
    }
    case "generate_email": {
      const email = await generateEmail(ctx, { topic: String(input.topic), purpose: input.purpose ? String(input.purpose) : undefined });
      const text = emailToText(email);
      return { forModel: text, output: { title: "Email", contentType: "email", platform: "email", content: email, text } };
    }
    case "generate_blog_post": {
      const blog = await generateBlogPost(ctx, { topic: String(input.topic) });
      const text = blogPostToText(blog);
      return { forModel: text, output: { title: blog.title, contentType: "blog_post", platform: "blog", content: blog, text } };
    }
    case "generate_hooks": {
      const hooks = await generateHooks(ctx, { topic: String(input.topic) });
      const text = hookSetToText(hooks);
      return { forModel: text, output: { title: `10 hooks: ${input.topic}`, contentType: "idea", content: hooks, text } };
    }
    case "improve_content": {
      const improved = await improveContent(ctx, { content: String(input.content), action: String(input.action) });
      return {
        forModel: improved.improved,
        output: { title: "Improved content", contentType: "improved_content", content: improved, text: improved.improved },
      };
    }
    case "repurpose_content": {
      const output = await generateRepurposeOutput(ctx, String(input.sourceContent));
      const summaryForModel = `Repurposed into: Facebook post, LinkedIn post, 3 Instagram captions, 5 TikTok ideas, 5 short-form scripts, an email, a blog post, a carousel, and 10 hooks. Source summary: ${output.sourceSummary}`;
      return {
        forModel: summaryForModel,
        output: { title: "Repurposed content package", contentType: "repurpose_output", content: output, text: summaryForModel },
      };
    }
    case "generate_content_calendar": {
      const days = Math.min(Number(input.days) || 7, 30);
      const calendar = await generateCalendar(ctx, { days });
      const summaryForModel = `Generated a ${days}-day calendar titled "${calendar.title}" with ${calendar.entries.length} entries rotating across platforms and pillars.`;
      return {
        forModel: summaryForModel,
        output: { title: calendar.title, contentType: "calendar", content: calendar, text: summaryForModel },
      };
    }
    case "plan_marketing_campaign": {
      const brief = {
        productOrService: String(input.productOrService),
        targetCustomer: String(input.targetCustomer),
        offer: String(input.offer),
        price: input.price ? String(input.price) : undefined,
        goal: String(input.goal),
        lengthDays: Math.min(Math.max(Number(input.lengthDays) || 14, 1), 90),
      };
      const campaign = await generateCampaign(ctx, brief);
      const profile = await getActiveBusinessProfile();
      await prisma.campaign.create({
        data: {
          businessProfileId: profile?.id,
          title: campaign.title,
          input: JSON.stringify(brief),
          strategy: JSON.stringify(campaign),
        },
      });
      const text = [
        campaign.title,
        "",
        campaign.strategySummary,
        "",
        "Key messages:",
        ...campaign.keyMessages.map((m) => `- ${m}`),
        "",
        "Headlines:",
        ...campaign.headlines.map((h) => `- ${h}`),
        "",
        "CTAs:",
        ...campaign.ctas.map((c) => `- ${c}`),
      ].join("\n");
      return {
        forModel: `${text}\n\n(Also generated ${campaign.socialPosts.length} social posts, a video script, an email, and ${campaign.adCopyVariants.length} ad variants. Saved to Campaigns.)`,
        output: { title: campaign.title, contentType: "campaign_asset", content: campaign, text },
      };
    }
    case "generate_content_ideas": {
      const recentTopics = Array.isArray(input.recentTopics) ? input.recentTopics.map(String) : undefined;
      const ideas = await generateContentIdeas(ctx, { recentTopics });
      const text = ideas.ideas
        .map((i, n) => `${n + 1}. [${i.category} · ${i.pillar}] ${i.idea}\n   Hook: ${i.hookAngle}`)
        .join("\n");
      return { forModel: text, output: { title: "Content ideas", contentType: "idea", content: ideas, text } };
    }
    default:
      return { forModel: `Unknown tool: ${name}` };
  }
}

const ASSISTANT_ROLE = `
You are the user's Smart Content Assistant — a conversational extension of this AI content department. You have tools to actually generate content (social posts, video scripts, emails, blog posts, hooks, calendars), improve pasted content, and repurpose pasted content.

Rules:
- When the user asks you to create, write, draft, or make content, USE THE TOOLS rather than writing the content directly in your reply — the tools produce properly structured, quality-checked content the UI can display and save.
- When the user asks a question, wants strategy advice, or wants to chat, just reply normally in text.
- After calling tools, write a short, friendly reply summarizing what you made — don't repeat the full content back in your text reply, it will be shown separately.
- If the user says something like "make a week of posts about X", call generate_social_post multiple times (varying platform/angle) or generate_content_calendar for 7 days — use your judgment.
- If the user references "this" or "that", assume they mean the most recent content discussed in the conversation.
`.trim();

const MARCUS_ROLE = `
You are Marcus, the business's dedicated marketing agent — a senior marketing strategist who has run growth for small and local businesses. You think in terms of offers, audiences, positioning, funnels, and measurable results, and then you get the work made.

How you work:
- Lead with strategy. When the user brings a goal ("more bookings", "launch our new package", "slow month"), briefly diagnose it: who the target customer is, what the offer should be, which channels fit, and what success looks like. Ask at most one or two clarifying questions, and only when the answer would change the plan.
- Then execute with your tools. Use plan_marketing_campaign for launches, promotions, or anything that needs a coordinated multi-channel push. Use generate_content_ideas when the user needs direction on what to post. Use the content tools (social posts, video scripts, emails, blogs, hooks, calendars) for individual assets.
- Don't write finished content directly in your reply. The tools produce structured, quality-checked content that the UI shows and saves.
- After using tools, give a short, confident summary: what you made, why it fits the goal, and one or two concrete next steps (when to post, what to test, what to measure).
- Be direct and specific to this business. No generic marketing filler. If an idea won't work for this business, say so and suggest something better.
- Introduce yourself as Marcus only if asked or at the start of a conversation. Don't keep repeating it.
`.trim();

const ROLE_BY_AGENT: Record<AgentId, string> = {
  assistant: ASSISTANT_ROLE,
  marcus: MARCUS_ROLE,
};

export async function runAssistantTurn(
  ctx: BusinessContext,
  history: Anthropic.MessageParam[],
  userMessage: string,
  agent: AgentId = "assistant"
): Promise<{ reply: string; toolOutputs: AssistantToolOutput[] }> {
  const system = buildSystemPrompt(ctx, ROLE_BY_AGENT[agent]);
  const tools = TOOLS_BY_AGENT[agent];
  const messages: Anthropic.MessageParam[] = [...history, { role: "user", content: userMessage }];
  const toolOutputs: AssistantToolOutput[] = [];

  for (let iteration = 0; iteration < 6; iteration++) {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system,
      tools,
      messages,
      output_config: { effort: "medium" },
    });

    if (response.stop_reason === "refusal") {
      return { reply: "I'm not able to help with that request.", toolOutputs };
    }

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason !== "tool_use") {
      const text = response.content.find((b): b is Anthropic.TextBlock => b.type === "text")?.text ?? "";
      return { reply: text || "Done!", toolOutputs };
    }

    const toolUseBlocks = response.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of toolUseBlocks) {
      try {
        const { forModel, output } = await executeTool(block.name, block.input as Record<string, unknown>, ctx);
        if (output) {
          if (Array.isArray(output)) toolOutputs.push(...output);
          else toolOutputs.push(output);
        }
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: forModel });
      } catch (err) {
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: `Error: ${(err as Error).message}`,
          is_error: true,
        });
      }
    }

    messages.push({ role: "user", content: toolResults });
  }

  return { reply: "I generated several pieces of content — see below.", toolOutputs };
}
