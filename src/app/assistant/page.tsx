import { AgentChat } from "@/components/AgentChat";

export default function AssistantPage() {
  return (
    <AgentChat
      agent="assistant"
      sourceTool="assistant"
      intro="Knows your business profile, brand voice, and content pillars — ask for anything."
      placeholder="Ask for content, ideas, or edits…"
      suggestions={[
        "I need content for my business this week.",
        "Give me 5 better hooks for our last promo.",
        "Make a week of posts about our new spring cleaning package.",
        "Turn this into an email: [paste content]",
      ]}
    />
  );
}
