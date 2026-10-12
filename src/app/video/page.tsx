"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldGroup, Select } from "@/components/ui/Field";
import { ContentResultCard } from "@/components/ContentResultCard";
import { VIDEO_LENGTHS } from "@/lib/types";
import type { VideoScript, HookSet, QualityReport } from "@/lib/ai/schemas";
import { hookSetToText } from "@/lib/format";
import { Clapperboard, ListVideo } from "lucide-react";

interface ScriptResult {
  content: VideoScript;
  text: string;
  quality: QualityReport;
}

export default function VideoScriptPage() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("TikTok / Reels / Shorts");
  const [lengthLabel, setLengthLabel] = useState<string>(VIDEO_LENGTHS[1].label);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScriptResult | null>(null);
  const [hooks, setHooks] = useState<HookSet | null>(null);
  const [hooksLoading, setHooksLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/generate/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, platform, lengthLabel }),
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

  async function handleTenHooks() {
    if (!topic) {
      setError("Enter a topic first");
      return;
    }
    setHooksLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate/hooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      setHooks(json.hooks);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setHooksLoading(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Video Script Builder</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Hook, script, on-screen text, b-roll, camera direction, CTA, caption, and hashtags for any length.
          </p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleGenerate}>
            <FieldGroup>
              <Label>Topic</Label>
              <Input required value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="What's the video about?" />
            </FieldGroup>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <FieldGroup>
                <Label>Platform / format</Label>
                <Input value={platform} onChange={(e) => setPlatform(e.target.value)} />
              </FieldGroup>
              <FieldGroup>
                <Label>Length</Label>
                <Select value={lengthLabel} onChange={(e) => setLengthLabel(e.target.value)}>
                  {VIDEO_LENGTHS.map((l) => (
                    <option key={l.id} value={l.label}>
                      {l.label}
                    </option>
                  ))}
                </Select>
              </FieldGroup>
            </div>
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" loading={loading}>
                <Clapperboard className="h-4 w-4" /> Generate Script
              </Button>
              <Button type="button" variant="outline" onClick={handleTenHooks} loading={hooksLoading}>
                <ListVideo className="h-4 w-4" /> Give Me 10 Different Hooks
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {hooks && (
        <Card>
          <CardHeader>
            <CardTitle>10 Hooks for &ldquo;{topic}&rdquo;</CardTitle>
          </CardHeader>
          <CardBody>
            <ol className="space-y-2 text-sm">
              {hooks.hooks.map((h, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-slate-400 shrink-0">{i + 1}.</span>
                  <span>
                    <span className="text-violet-600 font-medium">[{h.style}]</span> {h.text}
                  </span>
                </li>
              ))}
            </ol>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => navigator.clipboard.writeText(hookSetToText(hooks))}
            >
              Copy all hooks
            </Button>
          </CardBody>
        </Card>
      )}

      {result && (
        <ContentResultCard
          title={`${platform} script: ${topic}`}
          platform={platform}
          badges={[result.content.length]}
          copyText={result.text}
          imagePrompt={result.content.imagePrompt}
          contentType="video_script"
          sourceTool="video"
          rawBody={result.content}
          initialScore={result.quality}
        >
          <div className="space-y-3 text-sm">
            <p className="font-medium text-slate-900">HOOK: {result.content.hook}</p>
            {result.content.script.map((s, i) => (
              <div key={i} className="border-l-2 border-violet-200 pl-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">{s.section}</p>
                <p className="text-slate-700">
                  <span className="text-slate-400">Voiceover:</span> {s.voiceover}
                </p>
                <p className="text-slate-500 text-xs">On-screen: {s.onScreenText}</p>
                <p className="text-slate-500 text-xs">B-roll: {s.bRoll}</p>
                <p className="text-slate-500 text-xs">Camera: {s.cameraDirection}</p>
              </div>
            ))}
            <p className="text-slate-700">
              <span className="font-medium">CTA:</span> {result.content.cta}
            </p>
            <p className="text-slate-500">
              <span className="font-medium text-slate-700">Caption:</span> {result.content.caption}
            </p>
            {result.content.hashtags.length > 0 && (
              <p className="text-violet-600">{result.content.hashtags.map((h) => `#${h}`).join(" ")}</p>
            )}
          </div>
        </ContentResultCard>
      )}
    </div>
  );
}
