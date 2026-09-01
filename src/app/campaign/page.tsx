"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldGroup, Select, Textarea } from "@/components/ui/Field";
import { ContentResultCard } from "@/components/ContentResultCard";
import { CONTENT_GOALS } from "@/lib/types";
import { socialPostToText, videoScriptToText, emailToText } from "@/lib/format";
import type { CampaignContent } from "@/lib/ai/schemas";
import { Megaphone } from "lucide-react";

export default function CampaignPage() {
  const [productOrService, setProductOrService] = useState("");
  const [targetCustomer, setTargetCustomer] = useState("");
  const [offer, setOffer] = useState("");
  const [price, setPrice] = useState("");
  const [goal, setGoal] = useState<string>(CONTENT_GOALS[2]);
  const [lengthDays, setLengthDays] = useState(14);
  const [loading, setLoading] = useState(false);
  const [campaign, setCampaign] = useState<CampaignContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCampaign(null);
    try {
      const res = await fetch("/api/generate/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productOrService, targetCustomer, offer, price: price || undefined, goal, lengthDays }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.formErrors?.[0] ?? json.error ?? "Something went wrong");
      setCampaign(json.campaign);
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
          <CardTitle>Build My Campaign</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            A complete campaign around a product, service, promotion, launch, or event.
          </p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleGenerate}>
            <FieldGroup>
              <Label>Product / service</Label>
              <Input required value={productOrService} onChange={(e) => setProductOrService(e.target.value)} />
            </FieldGroup>
            <FieldGroup>
              <Label>Target customer</Label>
              <Textarea required value={targetCustomer} onChange={(e) => setTargetCustomer(e.target.value)} />
            </FieldGroup>
            <FieldGroup>
              <Label>Offer</Label>
              <Textarea
                required
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
                placeholder="e.g. 20% off first booking, launch bundle, limited-time event..."
              />
            </FieldGroup>
            <div className="grid sm:grid-cols-3 gap-x-4">
              <FieldGroup>
                <Label hint="optional">Price</Label>
                <Input value={price} onChange={(e) => setPrice(e.target.value)} />
              </FieldGroup>
              <FieldGroup>
                <Label>Campaign goal</Label>
                <Select value={goal} onChange={(e) => setGoal(e.target.value)}>
                  {CONTENT_GOALS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </Select>
              </FieldGroup>
              <FieldGroup>
                <Label>Campaign length</Label>
                <Select value={lengthDays} onChange={(e) => setLengthDays(Number(e.target.value))}>
                  {[3, 7, 14, 30].map((d) => (
                    <option key={d} value={d}>
                      {d} days
                    </option>
                  ))}
                </Select>
              </FieldGroup>
            </div>
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <Button type="submit" loading={loading}>
              <Megaphone className="h-4 w-4" /> Build Campaign
            </Button>
          </form>
        </CardBody>
      </Card>

      {campaign && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{campaign.title}</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3 text-sm">
              <p className="text-slate-700">{campaign.strategySummary}</p>
              <div>
                <p className="font-semibold text-slate-800 mb-1">Key messages</p>
                <ul className="list-disc list-inside text-slate-600">
                  {campaign.keyMessages.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-slate-800 mb-1">Headlines</p>
                  <ul className="list-disc list-inside text-slate-600">
                    {campaign.headlines.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-slate-800 mb-1">CTAs</p>
                  <ul className="list-disc list-inside text-slate-600">
                    {campaign.ctas.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div>
                <p className="font-semibold text-slate-800 mb-1">Ad copy variants</p>
                <div className="space-y-2">
                  {campaign.adCopyVariants.map((a, i) => (
                    <div key={i} className="border border-slate-100 rounded-lg p-2.5">
                      <p className="font-medium text-slate-800">{a.headline}</p>
                      <p className="text-slate-600">{a.primaryText}</p>
                      <p className="text-slate-400 text-xs mt-1">{a.description} — CTA: {a.cta}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-semibold text-slate-800 mb-1">Follow-up content</p>
                <ul className="list-disc list-inside text-slate-600">
                  {campaign.followUpContent.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            </CardBody>
          </Card>

          {campaign.socialPosts.map((post, i) => (
            <ContentResultCard
              key={i}
              title={`${post.platform} campaign post`}
              platform={post.platform}
              copyText={socialPostToText(post)}
              imagePrompt={post.imagePrompt}
              contentType="campaign_asset"
              sourceTool="campaign"
              rawBody={post}
            />
          ))}
          {campaign.videoScripts.map((script, i) => (
            <ContentResultCard
              key={i}
              title="Campaign video script"
              copyText={videoScriptToText(script)}
              imagePrompt={script.imagePrompt}
              contentType="campaign_asset"
              sourceTool="campaign"
              rawBody={script}
            />
          ))}
          {campaign.emails.map((email, i) => (
            <ContentResultCard
              key={i}
              title="Campaign email"
              platform="email"
              copyText={emailToText(email)}
              contentType="campaign_asset"
              sourceTool="campaign"
              rawBody={email}
            />
          ))}
        </div>
      )}
    </div>
  );
}
