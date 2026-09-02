// Phase 5 — the base outreach template library. These are the human-written
// starting points; the AI personalization endpoint (see
// src/lib/ai/generators.ts -> generateOutreachMessage) fills in the
// {{placeholders}} with genuine, lead-specific details before anything is
// approved for sending.

export interface OutreachTemplate {
  id: string;
  channel: "email" | "instagram_dm" | "facebook" | "sms";
  stage: string;
  label: string;
  subject?: string;
  body: string;
}

export const OUTREACH_TEMPLATES: OutreachTemplate[] = [
  {
    id: "cold-email",
    channel: "email",
    stage: "initial",
    label: "Cold Email",
    subject: "Quick thing I noticed about {{business_name}}",
    body:
      "Hi {{owner_name}},\n\n" +
      "I came across {{business_name}} while looking at {{industry}} businesses in {{city}} and " +
      "noticed {{observation}}.\n\n" +
      "That's usually a quiet leak — customers who almost book but don't. I put together a quick " +
      "note on what I'd fix first if it were mine. Want me to send it over, no charge?\n\n" +
      "{{sender_name}}\n{{brand_name}}",
  },
  {
    id: "ig-dm",
    channel: "instagram_dm",
    stage: "initial",
    label: "Instagram DM",
    body:
      "Hey! Love what you're doing with {{business_name}} 🙌 Noticed {{observation}} though — " +
      "quick fix that's probably costing you bookings. Want me to send a 1-min note on it, free?",
  },
  {
    id: "fb-message",
    channel: "facebook",
    stage: "initial",
    label: "Facebook Message",
    body:
      "Hi {{owner_name}}, I help {{industry}} businesses get more booked customers. Checked out " +
      "{{business_name}}'s page and noticed {{observation}} — happy to send a quick note on what I'd " +
      "fix first, no strings attached. Interested?",
  },
  {
    id: "sms",
    channel: "sms",
    stage: "initial",
    label: "SMS",
    body:
      "Hi {{owner_name}}, this is {{sender_name}} — I help {{industry}} businesses get more bookings. " +
      "Noticed {{observation}} on {{business_name}}'s page. Want a free 1-min note on the fix?",
  },
  {
    id: "followup-1",
    channel: "email",
    stage: "followup_1",
    label: "Follow-up #1",
    subject: "Following up — {{business_name}}",
    body:
      "Hi {{owner_name}}, following up in case my last note got buried. The fix I mentioned for " +
      "{{observation}} usually takes under 20 minutes and starts paying off within the week. Still " +
      "want me to send it over?",
  },
  {
    id: "followup-2",
    channel: "email",
    stage: "followup_2",
    label: "Follow-up #2",
    subject: "One more try — worth a look?",
    body:
      "Hey {{owner_name}}, I'll keep this short — is getting more booked jobs from your online " +
      "presence something worth 10 minutes of your time this week, or is now just not the right time?",
  },
  {
    id: "followup-3",
    channel: "email",
    stage: "followup_3",
    label: "Follow-up #3 (final)",
    subject: "Closing the loop",
    body:
      "No worries if now isn't the time, {{owner_name}} — I'll leave this here. If you ever want a " +
      "second set of eyes on why a customer might not book with {{business_name}}, just reply and " +
      "I'll send it over.",
  },
  {
    id: "interested-response",
    channel: "email",
    stage: "interested_response",
    label: "Interested-Lead Response",
    subject: "Great — here's the easiest next step",
    body:
      "Awesome, glad it's useful! Easiest next step is a free 20-minute call where I walk you through " +
      "the findings live and we figure out what's worth fixing first. Here's my calendar: {{booking_link}}",
  },
  {
    id: "appointment-confirm",
    channel: "email",
    stage: "appointment_confirm",
    label: "Appointment Confirmation",
    subject: "You're booked — {{appointment_time}}",
    body:
      "Confirmed for {{appointment_time}}. I'll walk through what I found on {{business_name}}'s " +
      "online presence and the 3-5 fixes I'd prioritize. Bring any login you'd want to update live " +
      "(Google Business Profile is the most useful). Need to reschedule? Just reply.",
  },
  {
    id: "no-show",
    channel: "email",
    stage: "no_show",
    label: "No-Show Follow-up",
    subject: "Missed you — want to grab another time?",
    body:
      "Hey {{owner_name}}, no worries if something came up — want to grab another time for that " +
      "20-minute walkthrough? {{booking_link}}",
  },
  {
    id: "sales-followup",
    channel: "email",
    stage: "sales_followup",
    label: "Sales Follow-up",
    subject: "Any questions on what we covered?",
    body:
      "Wanted to check in after our call — any questions on the {{offer_recommended}} we talked " +
      "through? Happy to hop on a quick call if easier than email.",
  },
  {
    id: "reactivation",
    channel: "email",
    stage: "reactivation",
    label: "Old-Lead Reactivation",
    subject: "Still thinking about this? Things have moved on",
    body:
      "Hi {{owner_name}}, it's been a while since we last talked about {{business_name}}'s online " +
      "presence — figured I'd check back in. A lot changes in a few months; want an updated look at " +
      "what's working and what isn't?",
  },
];

export function templatesFor(channel: OutreachTemplate["channel"]) {
  return OUTREACH_TEMPLATES.filter((t) => t.channel === channel);
}
