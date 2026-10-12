"use client";

import { useState } from "react";
import { Copy, Check, Save, FileDown, FileText, Image as ImageIcon, ShieldCheck, ChevronDown } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, ScoreBadge } from "@/components/ui/Badge";
import { downloadFromApi } from "@/lib/download";
import type { QualityReport } from "@/lib/ai/schemas";

export interface ContentResultCardProps {
  title: string;
  platform?: string;
  badges?: string[];
  copyText: string;
  imagePrompt?: string;
  contentType: string;
  sourceTool: string;
  rawBody: unknown;
  initialScore?: QualityReport;
  children?: React.ReactNode;
}

function useCopy() {
  const [copied, setCopied] = useState(false);
  return {
    copied,
    copy: async (text: string) => {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    },
  };
}

export function ContentResultCard({
  title,
  platform,
  badges = [],
  copyText,
  imagePrompt,
  contentType,
  sourceTool,
  rawBody,
  initialScore,
  children,
}: ContentResultCardProps) {
  const { copied, copy } = useCopy();
  const imageCopy = useCopy();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [score, setScore] = useState<QualityReport | undefined>(initialScore);
  const [checkingScore, setCheckingScore] = useState(false);
  const [scoreOpen, setScoreOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: contentType,
          platform,
          title,
          body: rawBody,
          imagePrompt,
          qualityScore: score?.score,
          qualityFeedback: score,
          sourceTool,
        }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleCheckQuality() {
    setCheckingScore(true);
    setScoreOpen(true);
    try {
      const res = await fetch("/api/quality-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: copyText, platform, contentType }),
      });
      const json = await res.json();
      if (res.ok) setScore(json.report);
    } finally {
      setCheckingScore(false);
    }
  }

  async function handleExport(format: "txt" | "docx" | "pdf") {
    setExportOpen(false);
    await downloadFromApi(`/api/export/${format}`, { title, content: copyText }, `${slugify(title)}.${format}`);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 truncate">{title}</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {platform && <Badge className="capitalize">{platform}</Badge>}
            {badges.map((b) => (
              <Badge key={b}>{b}</Badge>
            ))}
            {score && <ScoreBadge score={score.score} />}
          </div>
        </div>
      </CardHeader>
      <CardBody>
        {children ?? <p className="prose-content text-sm text-slate-700">{copyText}</p>}

        {imagePrompt && (
          <div className="mt-4 rounded-lg bg-slate-50 border border-slate-100 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5" /> Image prompt
              </p>
              <button
                onClick={() => imageCopy.copy(imagePrompt)}
                className="text-xs text-violet-600 hover:text-violet-800 flex items-center gap-1"
              >
                {imageCopy.copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {imageCopy.copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-1.5">{imagePrompt}</p>
          </div>
        )}

        {scoreOpen && (
          <div className="mt-4 rounded-lg border border-slate-100 p-3">
            {checkingScore || !score ? (
              <p className="text-xs text-slate-400">Checking quality…</p>
            ) : (
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(score.breakdown).map(([k, v]) => (
                    <div key={k}>
                      <p className="text-slate-400 capitalize">{k.replace(/([A-Z])/g, " $1")}</p>
                      <p className="font-semibold text-slate-700">{v}/100</p>
                    </div>
                  ))}
                </div>
                {score.strengths.length > 0 && (
                  <div>
                    <p className="font-semibold text-emerald-700">Strengths</p>
                    <ul className="list-disc list-inside text-slate-600">
                      {score.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {score.improvements.length > 0 && (
                  <div>
                    <p className="font-semibold text-amber-700">Suggested improvements</p>
                    <ul className="list-disc list-inside text-slate-600">
                      {score.improvements.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {score.flags.length > 0 && (
                  <div>
                    <p className="font-semibold text-red-700">Flags</p>
                    <ul className="list-disc list-inside text-red-600">
                      {score.flags.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          <Button type="button" size="sm" variant="outline" onClick={() => copy(copyText)}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={handleSave} disabled={saved} loading={saving}>
            <Save className="h-3.5 w-3.5" /> {saved ? "Saved to Library" : "Save"}
          </Button>
          {!score && (
            <Button type="button" size="sm" variant="outline" onClick={handleCheckQuality} loading={checkingScore}>
              <ShieldCheck className="h-3.5 w-3.5" /> Check Quality
            </Button>
          )}
          {score && !scoreOpen && (
            <Button type="button" size="sm" variant="ghost" onClick={() => setScoreOpen(true)}>
              <ChevronDown className="h-3.5 w-3.5" /> Details
            </Button>
          )}
          <div className="relative">
            <Button type="button" size="sm" variant="ghost" onClick={() => setExportOpen((v) => !v)}>
              <FileDown className="h-3.5 w-3.5" /> Export
            </Button>
            {exportOpen && (
              <div className="absolute z-10 mt-1 bg-white border border-slate-200 rounded-lg shadow-md py-1 w-32">
                {(["txt", "docx", "pdf"] as const).map((format) => (
                  <button
                    key={format}
                    onClick={() => handleExport(format)}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <FileText className="h-3 w-3" /> .{format}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60) || "content";
}
