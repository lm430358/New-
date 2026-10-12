"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { ContentResultCard } from "@/components/ContentResultCard";
import { Send, MessageCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AssistantToolOutput } from "@/lib/ai/assistant";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolOutputs?: AssistantToolOutput[];
}

const SUGGESTIONS = [
  "I need content for my business this week.",
  "Give me 5 better hooks for our last promo.",
  "Make a week of posts about our new spring cleaning package.",
  "Turn this into an email: [paste content]",
];

const STORAGE_KEY = "assistant-conversation-id";

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      setConversationId(stored);
      fetch(`/api/assistant/${stored}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((json) => {
          if (json?.conversation) {
            setMessages(
              json.conversation.messages.map((m: { id: string; role: string; content: string }) => ({
                id: m.id,
                role: m.role,
                content: m.content,
              }))
            );
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { id: `local-${Date.now()}`, role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: conversationId ?? undefined, message: text }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      if (json.conversationId && json.conversationId !== conversationId) {
        setConversationId(json.conversationId);
        localStorage.setItem(STORAGE_KEY, json.conversationId);
      }
      setMessages((prev) => [
        ...prev,
        { id: `assistant-${Date.now()}`, role: "assistant", content: json.reply, toolOutputs: json.toolOutputs },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: `error-${Date.now()}`, role: "assistant", content: `Sorry — ${(err as Error).message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleNewConversation() {
    setConversationId(null);
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <div className="max-w-3xl flex flex-col h-[calc(100vh-140px)]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-500">
          Knows your business profile, brand voice, and content pillars — ask for anything.
        </p>
        <Button size="sm" variant="outline" onClick={handleNewConversation}>
          <Plus className="h-3.5 w-3.5" /> New conversation
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <Card>
            <CardBody>
              <div className="flex items-center gap-2 text-slate-500 mb-3">
                <MessageCircle className="h-4 w-4" /> Try asking:
              </div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs text-left rounded-lg border border-slate-200 px-3 py-2 hover:border-violet-300 hover:bg-violet-50 text-slate-600"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {messages.map((m) => (
          <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[85%] space-y-3", m.role === "user" ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
                  m.role === "user" ? "bg-violet-600 text-white" : "bg-white border border-slate-200 text-slate-800"
                )}
              >
                {m.content}
              </div>
              {m.toolOutputs?.map((output, i) => (
                <ContentResultCard
                  key={i}
                  title={output.title}
                  platform={output.platform}
                  copyText={output.text}
                  contentType={output.contentType}
                  sourceTool="assistant"
                  rawBody={output.content}
                />
              ))}
            </div>
          </div>
        ))}
        {loading && <p className="text-sm text-slate-400">Thinking…</p>}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 border-t border-slate-200 pt-3"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder="Ask for content, ideas, or edits…"
          className="min-h-12"
        />
        <Button type="submit" loading={loading} disabled={!input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
