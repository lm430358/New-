"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { ContentIdeas } from "@/lib/ai/schemas";
import { Lightbulb } from "lucide-react";

export default function IdeasPage() {
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<ContentIdeas | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate/ideas", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      setIdeas(json.ideas);
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
          <CardTitle>I Don&apos;t Know What to Post</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Fresh ideas pulled from your business, audience, goals, and content pillars — never the same idea twice.
          </p>
        </CardHeader>
        <CardBody>
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          <Button onClick={handleGenerate} loading={loading}>
            <Lightbulb className="h-4 w-4" /> Give Me Ideas
          </Button>
        </CardBody>
      </Card>

      {ideas && (
        <div className="grid sm:grid-cols-2 gap-3">
          {ideas.ideas.map((idea, i) => (
            <Card key={i}>
              <CardBody>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <Badge className="bg-violet-50 text-violet-700">{idea.category}</Badge>
                  <Badge>{idea.pillar}</Badge>
                </div>
                <p className="text-sm font-medium text-slate-800">{idea.idea}</p>
                <p className="text-xs text-slate-500 mt-1">Hook angle: {idea.hookAngle}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
