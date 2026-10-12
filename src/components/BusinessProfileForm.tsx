"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, FieldGroup, Select } from "@/components/ui/Field";
import { BRAND_VOICES, CONTENT_GOALS, PLATFORMS } from "@/lib/types";
import { Plus, Trash2, Sparkles, CheckCircle2 } from "lucide-react";

interface ProfileData {
  id?: string;
  businessName: string;
  industry: string;
  productsServices: string;
  targetAudience: string;
  brandVoice: string;
  customVoiceName: string;
  customVoiceNotes: string;
  voiceSamples: string[];
  location: string;
  website: string;
  socialAccounts: Record<string, string>;
  brandDescription: string;
  usp: string;
  pricingInfo: string;
  currentPromotions: string;
  goals: string[];
  competitors: string[];
  preferredPlatforms: string[];
}

const EMPTY: ProfileData = {
  businessName: "",
  industry: "",
  productsServices: "",
  targetAudience: "",
  brandVoice: "conversational",
  customVoiceName: "",
  customVoiceNotes: "",
  voiceSamples: [],
  location: "",
  website: "",
  socialAccounts: {},
  brandDescription: "",
  usp: "",
  pricingInfo: "",
  currentPromotions: "",
  goals: [],
  competitors: [],
  preferredPlatforms: [],
};

export function BusinessProfileForm() {
  const router = useRouter();
  const [data, setData] = useState<ProfileData>(EMPTY);
  const [competitorsText, setCompetitorsText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pillars, setPillars] = useState<{ name: string; description: string }[]>([]);
  const [pillarsLoading, setPillarsLoading] = useState(false);
  const [socialRows, setSocialRows] = useState<[string, string][]>([["", ""]]);

  useEffect(() => {
    fetch("/api/business-profile")
      .then((r) => r.json())
      .then((res) => {
        if (res.profile) {
          const p = res.profile;
          const safeArr = (v: string | null) => {
            try {
              return v ? JSON.parse(v) : [];
            } catch {
              return [];
            }
          };
          const safeObj = (v: string | null) => {
            try {
              return v ? JSON.parse(v) : {};
            } catch {
              return {};
            }
          };
          const social = safeObj(p.socialAccounts);
          setData({
            id: p.id,
            businessName: p.businessName ?? "",
            industry: p.industry ?? "",
            productsServices: p.productsServices ?? "",
            targetAudience: p.targetAudience ?? "",
            brandVoice: p.brandVoice ?? "conversational",
            customVoiceName: p.customVoiceName ?? "",
            customVoiceNotes: p.customVoiceNotes ?? "",
            voiceSamples: safeArr(p.voiceSamples),
            location: p.location ?? "",
            website: p.website ?? "",
            socialAccounts: social,
            brandDescription: p.brandDescription ?? "",
            usp: p.usp ?? "",
            pricingInfo: p.pricingInfo ?? "",
            currentPromotions: p.currentPromotions ?? "",
            goals: safeArr(p.goals),
            competitors: safeArr(p.competitors),
            preferredPlatforms: safeArr(p.preferredPlatforms),
          });
          setCompetitorsText(safeArr(p.competitors).join(", "));
          const rows = Object.entries(social) as [string, string][];
          setSocialRows(rows.length ? rows : [["", ""]]);
          setPillars(safeArr(p.contentPillars));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function update<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setData((d) => ({ ...d, [key]: value }));
    setSaved(false);
  }

  function toggleArrayValue(key: "goals" | "preferredPlatforms", value: string) {
    setData((d) => {
      const set = new Set(d[key]);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      return { ...d, [key]: Array.from(set) };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const socialAccounts = Object.fromEntries(
      socialRows.filter(([k, v]) => k.trim() && v.trim())
    );
    const competitors = competitorsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await fetch("/api/business-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, socialAccounts, competitors }),
    });
    const json = await res.json();
    if (res.ok) {
      setData((d) => ({ ...d, id: json.profile.id }));
      setSaved(true);
      router.refresh();
    }
    setSaving(false);
  }

  async function handleGeneratePillars() {
    setPillarsLoading(true);
    try {
      const res = await fetch("/api/business-profile/pillars", { method: "POST" });
      const json = await res.json();
      if (res.ok) setPillars(json.pillars);
    } finally {
      setPillarsLoading(false);
    }
  }

  if (loading) {
    return <div className="text-slate-400 text-sm py-12 text-center">Loading your business profile…</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-16">
      <Card>
        <CardHeader>
          <CardTitle>The Basics</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Enter this once — every tool in the app will reuse it automatically.
          </p>
        </CardHeader>
        <CardBody className="grid md:grid-cols-2 gap-x-6">
          <FieldGroup>
            <Label>Business name</Label>
            <Input
              required
              value={data.businessName}
              onChange={(e) => update("businessName", e.target.value)}
              placeholder="e.g. Sparkle Clean Co."
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Industry</Label>
            <Input
              required
              value={data.industry}
              onChange={(e) => update("industry", e.target.value)}
              placeholder="e.g. Residential cleaning services"
            />
          </FieldGroup>
          <FieldGroup className="md:col-span-2">
            <Label>Products / services</Label>
            <Textarea
              required
              value={data.productsServices}
              onChange={(e) => update("productsServices", e.target.value)}
              placeholder="What do you sell or offer?"
            />
          </FieldGroup>
          <FieldGroup className="md:col-span-2">
            <Label>Target audience</Label>
            <Textarea
              required
              value={data.targetAudience}
              onChange={(e) => update("targetAudience", e.target.value)}
              placeholder="Who are your ideal customers?"
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Location</Label>
            <Input value={data.location} onChange={(e) => update("location", e.target.value)} />
          </FieldGroup>
          <FieldGroup>
            <Label>Website</Label>
            <Input value={data.website} onChange={(e) => update("website", e.target.value)} />
          </FieldGroup>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Brand Voice</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
            {BRAND_VOICES.map((voice) => (
              <button
                type="button"
                key={voice.id}
                onClick={() => update("brandVoice", voice.id)}
                className={`text-sm rounded-lg border px-3 py-2 text-left transition-colors ${
                  data.brandVoice === voice.id
                    ? "border-violet-500 bg-violet-50 text-violet-700 font-medium"
                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                }`}
              >
                {voice.label}
              </button>
            ))}
          </div>

          {data.brandVoice === "custom" && (
            <div className="border-t border-slate-100 pt-4 space-y-4">
              <FieldGroup>
                <Label>Name your voice</Label>
                <Input
                  value={data.customVoiceName}
                  onChange={(e) => update("customVoiceName", e.target.value)}
                  placeholder="e.g. 'Straight-talking coach'"
                />
              </FieldGroup>
              <FieldGroup>
                <Label>Describe the voice</Label>
                <Textarea
                  value={data.customVoiceNotes}
                  onChange={(e) => update("customVoiceNotes", e.target.value)}
                  placeholder="How should this sound? Tone, quirks, words to use or avoid..."
                />
              </FieldGroup>
              <FieldGroup>
                <Label hint="paste 1-3 examples of writing you like">Voice examples</Label>
                <div className="space-y-2">
                  {data.voiceSamples.map((sample, i) => (
                    <div key={i} className="flex gap-2">
                      <Textarea
                        value={sample}
                        onChange={(e) => {
                          const next = [...data.voiceSamples];
                          next[i] = e.target.value;
                          update("voiceSamples", next);
                        }}
                        className="min-h-16"
                      />
                      <button
                        type="button"
                        onClick={() => update("voiceSamples", data.voiceSamples.filter((_, idx) => idx !== i))}
                        className="text-slate-400 hover:text-red-600 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => update("voiceSamples", [...data.voiceSamples, ""])}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add example
                  </Button>
                </div>
              </FieldGroup>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Brand & Business Details</CardTitle>
        </CardHeader>
        <CardBody className="grid md:grid-cols-2 gap-x-6">
          <FieldGroup className="md:col-span-2">
            <Label>Brand description</Label>
            <Textarea value={data.brandDescription} onChange={(e) => update("brandDescription", e.target.value)} />
          </FieldGroup>
          <FieldGroup className="md:col-span-2">
            <Label>Unique selling proposition</Label>
            <Textarea value={data.usp} onChange={(e) => update("usp", e.target.value)} placeholder="What makes you different?" />
          </FieldGroup>
          <FieldGroup>
            <Label>Pricing information</Label>
            <Textarea value={data.pricingInfo} onChange={(e) => update("pricingInfo", e.target.value)} />
          </FieldGroup>
          <FieldGroup>
            <Label>Current promotions</Label>
            <Textarea value={data.currentPromotions} onChange={(e) => update("currentPromotions", e.target.value)} />
          </FieldGroup>
          <FieldGroup className="md:col-span-2">
            <Label hint="comma separated">Competitors</Label>
            <Input value={competitorsText} onChange={(e) => setCompetitorsText(e.target.value)} placeholder="Competitor A, Competitor B" />
          </FieldGroup>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Goals & Platforms</CardTitle>
        </CardHeader>
        <CardBody>
          <FieldGroup>
            <Label>Current goals</Label>
            <div className="flex flex-wrap gap-2">
              {CONTENT_GOALS.map((goal) => (
                <button
                  type="button"
                  key={goal}
                  onClick={() => toggleArrayValue("goals", goal)}
                  className={`text-sm rounded-full border px-3 py-1.5 transition-colors ${
                    data.goals.includes(goal)
                      ? "border-violet-500 bg-violet-50 text-violet-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </FieldGroup>
          <FieldGroup>
            <Label>Preferred content platforms</Label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((platform) => (
                <button
                  type="button"
                  key={platform.id}
                  onClick={() => toggleArrayValue("preferredPlatforms", platform.id)}
                  className={`text-sm rounded-full border px-3 py-1.5 transition-colors ${
                    data.preferredPlatforms.includes(platform.id)
                      ? "border-violet-500 bg-violet-50 text-violet-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {platform.label}
                </button>
              ))}
            </div>
          </FieldGroup>
          <FieldGroup>
            <Label>Social media accounts</Label>
            <div className="space-y-2">
              {socialRows.map(([platform, handle], i) => (
                <div key={i} className="flex gap-2">
                  <Select
                    value={platform}
                    onChange={(e) => {
                      const next: [string, string][] = [...socialRows];
                      next[i] = [e.target.value, handle];
                      setSocialRows(next);
                    }}
                    className="w-40"
                  >
                    <option value="">Platform…</option>
                    {PLATFORMS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </Select>
                  <Input
                    value={handle}
                    onChange={(e) => {
                      const next: [string, string][] = [...socialRows];
                      next[i] = [platform, e.target.value];
                      setSocialRows(next);
                    }}
                    placeholder="@handle or URL"
                  />
                  <button
                    type="button"
                    onClick={() => setSocialRows(socialRows.filter((_, idx) => idx !== i))}
                    className="text-slate-400 hover:text-red-600 shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setSocialRows([...socialRows, ["", ""]])}>
                <Plus className="h-3.5 w-3.5" /> Add account
              </Button>
            </div>
          </FieldGroup>
        </CardBody>
      </Card>

      {data.id && (
        <Card>
          <CardHeader className="flex items-center justify-between flex-row">
            <CardTitle>Content Pillars</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleGeneratePillars} loading={pillarsLoading}>
              <Sparkles className="h-3.5 w-3.5" /> {pillars.length ? "Regenerate" : "Generate"} pillars
            </Button>
          </CardHeader>
          <CardBody>
            {pillars.length ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {pillars.map((p) => (
                  <div key={p.name} className="border border-slate-100 rounded-lg p-3">
                    <p className="font-medium text-sm text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{p.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                Save your profile, then generate pillars so every tool can rotate content and avoid repetition.
              </p>
            )}
          </CardBody>
        </Card>
      )}

      <div className="flex items-center gap-3 sticky bottom-4">
        <Button type="submit" size="lg" loading={saving}>
          Save Business Profile
        </Button>
        {saved && (
          <span className="text-emerald-600 text-sm flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
    </form>
  );
}
