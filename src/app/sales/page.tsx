"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldGroup, Select } from "@/components/ui/Field";
import { ContentResultCard } from "@/components/ContentResultCard";
import { CONTENT_GOALS } from "@/lib/types";
import type { SalesContent, QualityReport } from "@/lib/ai/schemas";
import { DollarSign } from "lucide-react";

interface Result {
  content: SalesContent;
  text: string;
  quality: QualityReport;
}

export default function SalesPage() {
  const [offerName, setOfferName] = useState("");
  const [price, setPrice] = useState("");
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
      const res = await fetch("/api/generate/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerName, price: price || undefined, goal: goal || undefined }),
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
          <CardTitle>Promotional & Sales Content</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Sales pages, product descriptions, ads, emails, and offers — persuasive, never deceptive.
          </p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleGenerate}>
            <FieldGroup>
              <Label>Offer / product / service</Label>
              <Input
                required
                value={offerName}
                onChange={(e) => setOfferName(e.target.value)}
                placeholder="e.g. Deep Clean Package, Black Friday sale, new consulting package"
              />
            </FieldGroup>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <FieldGroup>
                <Label hint="optional">Price</Label>
                <Input value={price} onChange={(e) => setPrice(e.target.value)} />
              </FieldGroup>
              <FieldGroup>
                <Label hint="optional">Goal</Label>
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
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <Button type="submit" loading={loading}>
              <DollarSign className="h-4 w-4" /> Generate Sales Content
            </Button>
          </form>
        </CardBody>
      </Card>

      {result && (
        <ContentResultCard
          title={`Sales content: ${offerName}`}
          copyText={result.text}
          contentType="sales_copy"
          sourceTool="sales"
          rawBody={result.content}
          initialScore={result.quality}
        >
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold text-slate-800">{result.content.salesPage.headline}</p>
              <p className="text-slate-500">{result.content.salesPage.subheadline}</p>
              <p className="prose-content text-slate-700 mt-2">{result.content.salesPage.body}</p>
              <p className="text-violet-600 mt-1">CTA: {result.content.salesPage.cta}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-800">Product description</p>
              <p className="text-slate-600">{result.content.productDescription}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-800">Advertisements</p>
              {result.content.advertisements.map((a, i) => (
                <div key={i} className="border border-slate-100 rounded-lg p-2.5 mt-1.5">
                  <p className="font-medium text-slate-800">{a.headline}</p>
                  <p className="text-slate-600">{a.primaryText}</p>
                  <p className="text-xs text-slate-400 mt-1">CTA: {a.cta}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="font-semibold text-slate-800">Offers</p>
              <ul className="list-disc list-inside text-slate-600">
                {result.content.offers.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-800">Follow-up messages</p>
              <ul className="list-disc list-inside text-slate-600">
                {result.content.followUpMessages.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </div>
          </div>
        </ContentResultCard>
      )}
    </div>
  );
}
