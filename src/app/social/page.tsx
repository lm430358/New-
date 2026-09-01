"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldGroup, Select } from "@/components/ui/Field";
import { ContentResultCard } from "@/components/ContentResultCard";
import { PLATFORMS, CONTENT_GOALS } from "@/lib/types";
import type { SocialPost, QualityReport } from "@/lib/ai/schemas";
import { Sparkles } from "lucide-react";

const SOCIAL_PLATFORMS = PLATFORMS.filter((p) => !["email", "blog", "general"].includes(p.id));

interface Result {
  content: SocialPost;
  text: string;
  quality: QualityReport;
}

export default function SocialContentPage() {
  const [platform, setPlatform] = useState("instagram");
  const [topic, setTopic] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/generate/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, topic, goal: goal || undefined }),
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
          <CardTitle>Create Social Media Content</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Each platform gets content adapted to how it actually performs — never a copy-paste of the same post.
          </p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleGenerate}>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <FieldGroup>
                <Label>Platform</Label>
                <Select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                  {SOCIAL_PLATFORMS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </Select>
              </FieldGroup>
              <FieldGroup>
                <Label hint="optional">Primary goal</Label>
                <Select value={goal} onChange={(e) => setGoal(e.target.value)}>
                  <option value="">Let AI decide</option>
                  {CONTENT_GOALS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </Select>
              </FieldGroup>
            </div>
            <FieldGroup>
              <Label>What&apos;s this post about?</Label>
              <Input
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. our new eco-friendly cleaning products"
              />
            </FieldGroup>
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <Button type="submit" loading={loading}>
              <Sparkles className="h-4 w-4" /> Generate Post
            </Button>
          </form>
        </CardBody>
      </Card>

      {result && (
        <ContentResultCard
          title={`${platform} post: ${topic}`}
          platform={platform}
          copyText={result.text}
          imagePrompt={result.content.imagePrompt}
          contentType="social_post"
          sourceTool="social"
          rawBody={result.content}
          initialScore={result.quality}
        >
          <div className="space-y-2 text-sm text-slate-700">
            <p className="font-medium">{result.content.hook}</p>
            <p className="prose-content">{result.content.body}</p>
            {result.content.hashtags.length > 0 && (
              <p className="text-violet-600">{result.content.hashtags.map((h) => `#${h}`).join(" ")}</p>
            )}
            <p className="text-slate-500">
              <span className="font-medium text-slate-700">CTA:</span> {result.content.cta}
            </p>
          </div>
        </ContentResultCard>
      )}
    </div>
  );
}
