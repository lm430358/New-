"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { Loader2, Send, Wrench } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  toolTrace?: { tool: string; input: unknown; output: unknown }[];
}

const SUGGESTIONS = [
  "Find me three vendors for front brake pads",
  "Find wholesale suppliers",
  "Compare my saved vendors",
  "Calculate profit on a $80 part I sell for $140",
  "Show my low-stock inventory",
  "Draft a wholesale inquiry to one of my vendors",
];

export function CommandCenter() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function ensureConversation(): Promise<string> {
    if (conversationId) return conversationId;
    const res = await fetch("/api/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    const data = await res.json();
    setConversationId(data.conversation.id);
    return data.conversation.id;
  }

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content }]);
    setLoading(true);
    const id = await ensureConversation();
    const res = await fetch(`/api/conversations/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setMessages((m) => [...m, { role: "assistant", content: data.message.content, toolTrace: data.toolTrace }]);
    } else {
      setMessages((m) => [...m, { role: "assistant", content: `Error: ${data.error ?? "something went wrong"}` }]);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-4">
        {messages.length === 0 && (
          <div className="max-w-2xl">
            <p className="text-sm text-[var(--text-muted)] mb-3">
              Ask about parts, vendors, pricing, or say what you want to do. The assistant looks up your
              real saved data — it never invents vendors, prices, or part numbers.
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs rounded-full border border-[var(--border)] px-3 py-1.5 hover:bg-[var(--surface-muted)]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`max-w-2xl ${m.role === "user" ? "ml-auto text-right" : ""}`}>
            <div
              className={`inline-block text-left rounded-lg px-4 py-2.5 text-sm whitespace-pre-wrap ${
                m.role === "user" ? "bg-[var(--brand)] text-white" : "bg-[var(--surface)] border border-[var(--border)]"
              }`}
            >
              {m.content}
            </div>
            {m.toolTrace && m.toolTrace.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {m.toolTrace.map((t, ti) => (
                  <Badge key={ti} tone="neutral" className="inline-flex items-center gap-1">
                    <Wrench size={10} /> {t.tool}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <Loader2 size={14} className="animate-spin" /> Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-[var(--border)] p-4">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask the AI Command Center…"
            className="min-h-[44px] max-h-32"
          />
          <Button type="button" onClick={() => send()} disabled={loading}>
            <Send size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
