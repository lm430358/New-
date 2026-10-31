import { AgentChat } from "@/components/AgentChat";

export default function MarcusPage() {
  return (
    <AgentChat
      agent="marcus"
      sourceTool="marcus"
      intro="Marcus is your marketing agent. Give him a goal and he'll build the strategy, then make the campaign, posts, and emails for it."
      placeholder="Tell Marcus your marketing goal…"
      suggestions={[
        "Hi Marcus, I need more bookings next month. What should we do?",
        "Plan a 2-week launch campaign for our new service.",
        "It's a slow season. Give me a promo strategy and the content for it.",
        "What should we post this week, and why?",
      ]}
    />
  );
}
