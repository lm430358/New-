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
} from "@/lib/format";
import type { EverythingPackage } from "@/lib/ai/schemas";
import { Sparkles } from "lucide-react";

export default function EverythingPage() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [pkg, setPkg] = useState<EverythingPackage | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPkg(null);
    try {
      const res = await fetch("/api/generate/everything", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.formErrors?.[0] ?? json.error ?? "Something went wrong");
      setPkg(json.package);
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
          <CardTitle>One Idea → Everything</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Enter one idea. Click Create Everything and get a Facebook post, Instagram caption + carousel, TikTok/Reels/YouTube
            Shorts scripts, a LinkedIn post, an email, a blog post, a quote graphic line, and a unifying CTA — all built for
            your business.
          </p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleGenerate}>
            <FieldGroup>
              <Label>Your idea</Label>
              <Textarea
                required
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="e.g. 5 mistakes people make when starting a cleaning business"
              />
            </FieldGroup>
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <Button type="submit" size="lg" loading={loading}>
              <Sparkles className="h-4 w-4" /> Create Everything
            </Button>
            {loading && (
              <p className="text-xs text-slate-400 mt-2">
                Generating 9 pieces of content in parallel — this can take up to a minute.
              </p>
            )}
          </form>
        </CardBody>
      </Card>

      {pkg && (
        <div className="space-y-4">
          <ContentResultCard
            title="Facebook post"
            platform="facebook"
            copyText={socialPostToText(pkg.facebookPost)}
            imagePrompt={pkg.facebookPost.imagePrompt}
            contentType="social_post"
            sourceTool="everything"
            rawBody={pkg.facebookPost}
          />
          <ContentResultCard
            title="Instagram caption"
            platform="instagram"
            copyText={socialPostToText(pkg.instagramCaption)}
            imagePrompt={pkg.instagramCaption.imagePrompt}
            contentType="social_post"
            sourceTool="everything"
            rawBody={pkg.instagramCaption}
          />
          <ContentResultCard
            title="Instagram carousel outline"
            platform="instagram"
            copyText={carouselToText(pkg.instagramCarousel)}
            imagePrompt={pkg.instagramCarousel.imagePrompt}
            contentType="carousel"
            sourceTool="everything"
            rawBody={pkg.instagramCarousel}
          />
          <ContentResultCard
            title="TikTok script"
            platform="tiktok"
            copyText={videoScriptToText(pkg.tiktokScript)}
            imagePrompt={pkg.tiktokScript.imagePrompt}
            contentType="video_script"
            sourceTool="everything"
            rawBody={pkg.tiktokScript}
          />
          <ContentResultCard
            title="Reels script"
            platform="instagram"
            copyText={videoScriptToText(pkg.reelsScript)}
            imagePrompt={pkg.reelsScript.imagePrompt}
            contentType="video_script"
            sourceTool="everything"
            rawBody={pkg.reelsScript}
          />
          <ContentResultCard
            title="YouTube Short script"
            platform="youtube"
            copyText={videoScriptToText(pkg.youtubeShortScript)}
            imagePrompt={pkg.youtubeShortScript.imagePrompt}
            contentType="video_script"
            sourceTool="everything"
            rawBody={pkg.youtubeShortScript}
          />
          <ContentResultCard
            title="LinkedIn post"
            platform="linkedin"
            copyText={socialPostToText(pkg.linkedinPost)}
            imagePrompt={pkg.linkedinPost.imagePrompt}
            contentType="social_post"
            sourceTool="everything"
            rawBody={pkg.linkedinPost}
          />
          <ContentResultCard
            title="Email"
            platform="email"
            copyText={emailToText(pkg.email)}
            contentType="email"
            sourceTool="everything"
            rawBody={pkg.email}
          />
          <ContentResultCard
            title="Blog post"
            platform="blog"
            copyText={blogPostToText(pkg.blogPost)}
            imagePrompt={pkg.blogPost.imagePrompt}
            contentType="blog_post"
            sourceTool="everything"
            rawBody={pkg.blogPost}
          />
          <ContentResultCard
            title="Quote graphic + CTA"
            copyText={`"${pkg.quoteGraphicText}"\n\nCTA: ${pkg.cta}`}
            imagePrompt={pkg.imagePrompt}
            contentType="idea"
            sourceTool="everything"
            rawBody={{ quote: pkg.quoteGraphicText, cta: pkg.cta }}
          />
        </div>
      )}
    </div>
  );
}
