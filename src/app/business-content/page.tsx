"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldGroup } from "@/components/ui/Field";
import { ContentResultCard } from "@/components/ContentResultCard";
import { websiteCopyToText, blogPostToText, emailToText } from "@/lib/format";
import type { WebsiteCopyBundle, BlogPost, EmailContent, QualityReport } from "@/lib/ai/schemas";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

type Tab = "website" | "blog" | "email";

export default function BusinessContentPage() {
  const [tab, setTab] = useState<Tab>("website");

  return (
    <div className="max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Content</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Website copy, FAQs, blog posts, and newsletters/emails.</p>
        </CardHeader>
        <CardBody>
          <div className="flex gap-1 border-b border-slate-100 mb-4">
            {(
              [
                ["website", "Website Copy & FAQs"],
                ["blog", "Blog Post"],
                ["email", "Newsletter / Email"],
              ] as [Tab, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                  tab === id ? "border-violet-600 text-violet-700" : "border-transparent text-slate-500 hover:text-slate-800"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {tab === "website" && <WebsiteCopyTool />}
          {tab === "blog" && <BlogTool />}
          {tab === "email" && <EmailTool />}
        </CardBody>
      </Card>
    </div>
  );
}

function WebsiteCopyTool() {
  const [focus, setFocus] = useState("");
  const [loading, setLoading] = useState(false);
  const [copy, setCopy] = useState<WebsiteCopyBundle | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setCopy(null);
    try {
      const res = await fetch("/api/generate/website-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ focus: focus || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      setCopy(json.copy);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <FieldGroup>
        <Label hint="optional">Focus area</Label>
        <Input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="e.g. homepage for our new spring service line" />
      </FieldGroup>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button onClick={handleGenerate} loading={loading}>
        <Globe className="h-4 w-4" /> Generate Website Copy
      </Button>

      {copy && (
        <ContentResultCard
          title="Website copy & FAQs"
          copyText={websiteCopyToText(copy)}
          contentType="website_copy"
          sourceTool="business-content"
          rawBody={copy}
        >
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-slate-800">Hero</p>
              <p className="text-slate-700">{copy.homepageHero.headline}</p>
              <p className="text-slate-500">{copy.homepageHero.subheadline}</p>
              <p className="text-violet-600 text-xs mt-1">CTA: {copy.homepageHero.cta}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-800">About</p>
              <p className="text-slate-600">{copy.aboutSection}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-800">Services</p>
              {copy.serviceDescriptions.map((s, i) => (
                <p key={i} className="text-slate-600">
                  <span className="font-medium">{s.name}:</span> {s.description}
                </p>
              ))}
            </div>
            <div>
              <p className="font-semibold text-slate-800">FAQs</p>
              {copy.faqs.map((f, i) => (
                <div key={i} className="mt-1">
                  <p className="font-medium text-slate-700">{f.question}</p>
                  <p className="text-slate-500">{f.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </ContentResultCard>
      )}
    </div>
  );
}

function BlogTool() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ content: BlogPost; text: string; quality: QualityReport } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!topic.trim()) return setError("Enter a topic first");
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/generate/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      setResult(json);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <FieldGroup>
        <Label>Blog topic</Label>
        <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="What should the post be about?" />
      </FieldGroup>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button onClick={handleGenerate} loading={loading}>
        Generate Blog Post
      </Button>
      {result && (
        <ContentResultCard
          title={result.content.title}
          platform="blog"
          copyText={blogPostToText(result.content)}
          imagePrompt={result.content.imagePrompt}
          contentType="blog_post"
          sourceTool="business-content"
          rawBody={result.content}
          initialScore={result.quality}
        >
          <div className="prose-content text-sm text-slate-700">{result.content.body}</div>
        </ContentResultCard>
      )}
    </div>
  );
}

function EmailTool() {
  const [topic, setTopic] = useState("");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ content: EmailContent; text: string; quality: QualityReport } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!topic.trim()) return setError("Enter a topic first");
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/generate/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, purpose: purpose || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      setResult(json);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <FieldGroup>
        <Label>Topic</Label>
        <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. monthly newsletter, new service announcement" />
      </FieldGroup>
      <FieldGroup>
        <Label hint="optional">Purpose</Label>
        <Input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. re-engage past customers" />
      </FieldGroup>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button onClick={handleGenerate} loading={loading}>
        Generate Email
      </Button>
      {result && (
        <ContentResultCard
          title={`Email: ${topic}`}
          platform="email"
          copyText={emailToText(result.content)}
          contentType="email"
          sourceTool="business-content"
          rawBody={result.content}
          initialScore={result.quality}
        >
          <div className="space-y-2 text-sm">
            <p className="text-slate-500">Subject options: {result.content.subjectLines.join(" | ")}</p>
            <p className="prose-content text-slate-700">{result.content.body}</p>
            <p className="text-violet-600">CTA: {result.content.cta}</p>
          </div>
        </ContentResultCard>
      )}
    </div>
  );
}
