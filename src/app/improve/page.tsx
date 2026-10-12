"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea, Label, FieldGroup } from "@/components/ui/Field";
import { ContentResultCard } from "@/components/ContentResultCard";
import { CONTENT_IMPROVER_ACTIONS } from "@/lib/types";
import type { ImprovedContent, QualityReport } from "@/lib/ai/schemas";

interface Result {
  content: ImprovedContent;
  text: string;
  quality: QualityReport;
}

export default function ImprovePage() {
  const [content, setContent] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(action: string) {
    if (!content.trim()) {
      setError("Paste some content first");
      return;
    }
    setLoadingAction(action);
    setLastAction(action);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/generate/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, action }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      setResult(json);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingAction(null);
    }
  }

  const actionLabel = CONTENT_IMPROVER_ACTIONS.find((a) => a.id === lastAction)?.label;

  return (
    <div className="max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Improver</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Paste existing content, pick a transformation. Meaning and facts are preserved — nothing is invented.
          </p>
        </CardHeader>
        <CardBody>
          <FieldGroup>
            <Label>Your content</Label>
            <Textarea
              className="min-h-40"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste a post, email, script, or any content you want to improve..."
            />
          </FieldGroup>
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          <div className="flex flex-wrap gap-2">
            {CONTENT_IMPROVER_ACTIONS.map((action) => (
              <Button
                key={action.id}
                type="button"
                variant="outline"
                size="sm"
                loading={loadingAction === action.id}
                disabled={loadingAction !== null && loadingAction !== action.id}
                onClick={() => handleAction(action.id)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </CardBody>
      </Card>

      {result && (
        <ContentResultCard
          title={actionLabel ?? "Improved content"}
          copyText={result.content.improved}
          contentType="improved_content"
          sourceTool="improve"
          rawBody={result.content}
          initialScore={result.quality}
        >
          <div className="space-y-3 text-sm">
            <p className="prose-content text-slate-700">{result.content.improved}</p>
            {result.content.changesSummary.length > 0 && (
              <div className="border-t border-slate-100 pt-3">
                <p className="font-semibold text-slate-800 mb-1">What changed</p>
                <ul className="list-disc list-inside text-slate-600">
                  {result.content.changesSummary.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ContentResultCard>
      )}
    </div>
  );
}
