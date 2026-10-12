"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldGroup, Select } from "@/components/ui/Field";
import { ContentResultCard } from "@/components/ContentResultCard";
import { LEAD_MAGNET_FORMATS } from "@/lib/types";
import { leadMagnetToText, socialPostToText } from "@/lib/format";
import type { LeadMagnetContent, QualityReport } from "@/lib/ai/schemas";
import { BookOpenCheck } from "lucide-react";

interface Result {
  content: LeadMagnetContent;
  text: string;
  quality: QualityReport;
}

export default function LeadMagnetPage() {
  const [format, setFormat] = useState<string>(LEAD_MAGNET_FORMATS[1].id);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/generate/lead-magnet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, topic }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.formErrors?.[0] ?? json.error ?? "Something went wrong");
      setResult(json);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Build Me a Lead Magnet</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Title, outline, full drafted content, CTA, and promotional posts to drive downloads.
          </p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleGenerate}>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <FieldGroup>
                <Label>Format</Label>
                <Select value={format} onChange={(e) => setFormat(e.target.value)}>
                  {LEAD_MAGNET_FORMATS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </Select>
              </FieldGroup>
              <FieldGroup>
                <Label>Topic</Label>
                <Input required value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="What's it about?" />
              </FieldGroup>
            </div>
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <Button type="submit" loading={loading}>
              <BookOpenCheck className="h-4 w-4" /> Build Lead Magnet
            </Button>
          </form>
        </CardBody>
      </Card>

      {result && (
        <div className="space-y-4">
          <ContentResultCard
            title={result.content.title}
            badges={[LEAD_MAGNET_FORMATS.find((f) => f.id === format)?.label ?? format]}
            copyText={leadMagnetToText(result.content)}
            contentType="lead_magnet"
            sourceTool="lead-magnet"
            rawBody={result.content}
            initialScore={result.quality}
          >
            <div className="space-y-2 text-sm">
              <p className="text-slate-500">{result.content.subtitle}</p>
              <div>
                <p className="font-semibold text-slate-800">Outline</p>
                <ol className="list-decimal list-inside text-slate-600">
                  {result.content.outline.map((o, i) => (
                    <li key={i}>{o}</li>
                  ))}
                </ol>
              </div>
              <div className="prose-content text-slate-700 border-t border-slate-100 pt-3">{result.content.content}</div>
              <p className="text-violet-600">CTA: {result.content.cta}</p>
            </div>
          </ContentResultCard>

          {result.content.promotionalPosts.map((post, i) => (
            <ContentResultCard
              key={i}
              title={`Promotional post ${i + 1}`}
              platform={post.platform}
              copyText={socialPostToText(post)}
              imagePrompt={post.imagePrompt}
              contentType="social_post"
              sourceTool="lead-magnet"
              rawBody={post}
            />
          ))}
        </div>
      )}
    </div>
  );
}
