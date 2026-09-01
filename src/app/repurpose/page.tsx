"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea, Label, FieldGroup } from "@/components/ui/Field";
import { ContentResultCard } from "@/components/ContentResultCard";
import {
  socialPostToText,
  carouselToText,
  videoScriptToText,
  emailToText,
  blogPostToText,
  hookSetToText,
} from "@/lib/format";
import type { RepurposeOutput } from "@/lib/ai/schemas";
import { Recycle } from "lucide-react";

export default function RepurposePage() {
  const [sourceContent, setSourceContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<RepurposeOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOutput(null);
    try {
      const res = await fetch("/api/generate/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceContent }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.formErrors?.[0] ?? json.error ?? "Something went wrong");
      setOutput(json.output);
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
          <CardTitle>Turn One Piece of Content Into 20 Pieces</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Paste a blog post, transcript, article, notes, or existing post — get it repurposed across every format.
          </p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleGenerate}>
            <FieldGroup>
              <Label>Source content</Label>
              <Textarea
                required
                className="min-h-48"
                value={sourceContent}
                onChange={(e) => setSourceContent(e.target.value)}
                placeholder="Paste your blog post, video transcript, podcast transcript, article, or notes here..."
              />
            </FieldGroup>
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <Button type="submit" loading={loading}>
              <Recycle className="h-4 w-4" /> Repurpose This
            </Button>
            {loading && (
              <p className="text-xs text-slate-400 mt-2">
                Generating Facebook, LinkedIn, 3 Instagram captions, 5 TikTok ideas, 5 short-form scripts, an email, a blog
                post, a carousel, and 10 hooks…
              </p>
            )}
          </form>
        </CardBody>
      </Card>

      {output && (
        <div className="space-y-4">
          <Card>
            <CardBody>
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">Source summary:</span> {output.sourceSummary}
              </p>
            </CardBody>
          </Card>

          <ContentResultCard
            title="Facebook post"
            platform="facebook"
            copyText={socialPostToText(output.facebookPost)}
            imagePrompt={output.facebookPost.imagePrompt}
            contentType="social_post"
            sourceTool="repurpose"
            rawBody={output.facebookPost}
          />
          <ContentResultCard
            title="LinkedIn post"
            platform="linkedin"
            copyText={socialPostToText(output.linkedinPost)}
            imagePrompt={output.linkedinPost.imagePrompt}
            contentType="social_post"
            sourceTool="repurpose"
            rawBody={output.linkedinPost}
          />
          {output.instagramCaptions.map((cap, i) => (
            <ContentResultCard
              key={i}
              title={`Instagram caption ${i + 1}`}
              platform="instagram"
              copyText={socialPostToText(cap)}
              imagePrompt={cap.imagePrompt}
              contentType="social_post"
              sourceTool="repurpose"
              rawBody={cap}
            />
          ))}
          <Card>
            <CardHeader>
              <CardTitle>5 TikTok ideas</CardTitle>
            </CardHeader>
            <CardBody>
              <ol className="space-y-2 text-sm list-decimal list-inside">
                {output.tiktokIdeas.map((idea, i) => (
                  <li key={i}>
                    <span className="font-medium">{idea.concept}</span> — <span className="text-slate-500">{idea.hook}</span>
                  </li>
                ))}
              </ol>
            </CardBody>
          </Card>
          {output.shortFormScripts.map((script, i) => (
            <ContentResultCard
              key={i}
              title={`Short-form script ${i + 1}`}
              copyText={videoScriptToText(script)}
              imagePrompt={script.imagePrompt}
              contentType="video_script"
              sourceTool="repurpose"
              rawBody={script}
            />
          ))}
          <ContentResultCard
            title="Email"
            platform="email"
            copyText={emailToText(output.email)}
            contentType="email"
            sourceTool="repurpose"
            rawBody={output.email}
          />
          <ContentResultCard
            title="Blog post"
            platform="blog"
            copyText={blogPostToText(output.blogPost)}
            imagePrompt={output.blogPost.imagePrompt}
            contentType="blog_post"
            sourceTool="repurpose"
            rawBody={output.blogPost}
          />
          <ContentResultCard
            title="Carousel"
            copyText={carouselToText(output.carousel)}
            imagePrompt={output.carousel.imagePrompt}
            contentType="carousel"
            sourceTool="repurpose"
            rawBody={output.carousel}
          />
          <ContentResultCard
            title="10 hooks"
            copyText={hookSetToText(output.hooks)}
            contentType="idea"
            sourceTool="repurpose"
            rawBody={output.hooks}
          />
        </div>
      )}
    </div>
  );
}
