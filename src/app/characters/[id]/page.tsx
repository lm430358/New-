"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Save, X, Plus, Wand2, ImageOff, Shirt, Users, Trash2 } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Textarea, Select, Label, FieldGroup } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { CharacterDTO } from "@/lib/characters/serialize";

const ANGLES = [
  { id: "three_quarter", label: "Three-quarter" },
  { id: "side", label: "Side profile" },
  { id: "closeup", label: "Close-up" },
  { id: "full_body", label: "Full body" },
];

export default function CharacterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [character, setCharacter] = useState<CharacterDTO | null>(null);
  const [allCharacters, setAllCharacters] = useState<CharacterDTO[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [genAngleBusy, setGenAngleBusy] = useState(false);
  const [relType, setRelType] = useState("");
  const [relTo, setRelTo] = useState("");
  const [relDesc, setRelDesc] = useState("");
  const [outfitName, setOutfitName] = useState("");
  const [outfitDesc, setOutfitDesc] = useState("");

  const load = useCallback(() => {
    fetch(`/api/characters/${id}`)
      .then((r) => r.json())
      .then((data) => setCharacter(data.character ?? null));
  }, [id]);

  useEffect(load, [load]);
  useEffect(() => {
    fetch("/api/characters")
      .then((r) => r.json())
      .then((data) => setAllCharacters(data.characters ?? []));
  }, []);

  function startEdit() {
    if (!character) return;
    setForm({
      name: character.name,
      age: character.age ?? "",
      gender: character.gender ?? "",
      occupation: character.occupation ?? "",
      physicalDescription: character.physicalDescription,
      faceDescriptor: character.faceDescriptor ?? "",
      defaultOutfitDescription: character.defaultOutfitDescription ?? "",
      personalityTraits: character.personalityTraits.join(", "),
      personalitySummary: character.personalitySummary ?? "",
      background: character.background ?? "",
      voiceDescription: character.voiceDescription ?? "",
      negativePrompt: character.negativePrompt ?? "",
    });
    setEditing(true);
  }

  async function saveEdit() {
    setSaving(true);
    await fetch(`/api/characters/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        personalityTraits: form.personalityTraits.split(",").map((s) => s.trim()).filter(Boolean),
      }),
    });
    setSaving(false);
    setEditing(false);
    load();
  }

  async function generateAngle(angle: string) {
    setGenAngleBusy(true);
    await fetch(`/api/characters/${id}/reference-images/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ angle }),
    });
    setGenAngleBusy(false);
    load();
  }

  async function setPrimary(imageId: string) {
    await fetch(`/api/characters/${id}/reference-images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: character!.referenceImages.find((r) => r.id === imageId)!.url, isPrimary: true }),
    });
    load();
  }

  async function addRelationship(e: React.FormEvent) {
    e.preventDefault();
    if (!relTo || !relType) return;
    await fetch(`/api/characters/${id}/relationships`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toCharacterId: relTo, relationshipType: relType, description: relDesc || undefined }),
    });
    setRelType("");
    setRelTo("");
    setRelDesc("");
    load();
  }

  async function addOutfit(e: React.FormEvent) {
    e.preventDefault();
    if (!outfitName || !outfitDesc) return;
    await fetch(`/api/characters/${id}/outfits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: outfitName, description: outfitDesc }),
    });
    setOutfitName("");
    setOutfitDesc("");
    load();
  }

  async function handleDelete() {
    if (!confirm("Delete this character? This cannot be undone.")) return;
    await fetch(`/api/characters/${id}`, { method: "DELETE" });
    router.push("/characters");
  }

  if (!character) return <p className="text-sm text-slate-400">Loading…</p>;

  const otherCharacters = allCharacters.filter((c) => c.id !== character.id);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-slate-900">{character.name}</h2>
          <Badge className="capitalize">{character.style.replace("_", " ")}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/characters/${id}/generate`}>
            <Button>
              <Wand2 className="h-4 w-4" />
              Generate Scene
            </Button>
          </Link>
          {!editing ? (
            <Button variant="outline" onClick={startEdit}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEditing(false)}>
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={saveEdit} loading={saving}>
                <Save className="h-4 w-4" />
                Save
              </Button>
            </>
          )}
          <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Reference images */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Reference Images (Identity Anchor)</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-3 mb-4">
            {character.referenceImages.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <ImageOff className="h-4 w-4" /> No reference images yet.
              </div>
            )}
            {character.referenceImages.map((img) => (
              <div key={img.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.angle ?? "reference"}
                  className={`h-32 w-32 object-cover rounded-lg border-2 ${
                    img.isPrimary ? "border-violet-500" : "border-slate-200"
                  }`}
                />
                <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between gap-1">
                  <Badge className="bg-black/60 text-white text-[10px] px-1.5 py-0.5">{img.angle ?? "—"}</Badge>
                  {!img.isPrimary && (
                    <button
                      onClick={() => setPrimary(img.id)}
                      className="text-[10px] bg-white/90 rounded px-1.5 py-0.5 hover:bg-white"
                    >
                      Set primary
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {ANGLES.map((a) => (
              <Button key={a.id} variant="outline" size="sm" disabled={genAngleBusy} onClick={() => generateAngle(a.id)}>
                <Plus className="h-3.5 w-3.5" />
                {a.label}
              </Button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Character Profile</CardTitle>
        </CardHeader>
        <CardBody>
          {!editing ? (
            <dl className="space-y-4 text-sm">
              <Row label="Basics" value={[character.age, character.gender, character.occupation].filter(Boolean).join(" · ") || "—"} />
              <Row label="Physical description" value={character.physicalDescription} />
              <Row label="Face descriptor" value={character.faceDescriptor || "—"} />
              <Row label="Default outfit" value={character.defaultOutfitDescription || "—"} />
              <Row
                label="Personality traits"
                value={
                  character.personalityTraits.length
                    ? character.personalityTraits.join(", ")
                    : "—"
                }
              />
              <Row label="Personality summary" value={character.personalitySummary || "—"} />
              <Row label="Background" value={character.background || "—"} />
              <Row label="Voice" value={character.voiceDescription || "—"} />
              <Row label="Negative prompt" value={character.negativePrompt || "—"} />
            </dl>
          ) : (
            <div className="space-y-4">
              <FieldGroup>
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </FieldGroup>
              <div className="grid grid-cols-3 gap-4">
                <FieldGroup>
                  <Label>Age</Label>
                  <Input value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
                </FieldGroup>
                <FieldGroup>
                  <Label>Gender</Label>
                  <Input value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} />
                </FieldGroup>
                <FieldGroup>
                  <Label>Occupation</Label>
                  <Input value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} />
                </FieldGroup>
              </div>
              <FieldGroup>
                <Label hint="reused verbatim in every future generation">Physical description</Label>
                <Textarea
                  value={form.physicalDescription}
                  onChange={(e) => setForm({ ...form, physicalDescription: e.target.value })}
                />
              </FieldGroup>
              <FieldGroup>
                <Label>Face descriptor</Label>
                <Textarea value={form.faceDescriptor} onChange={(e) => setForm({ ...form, faceDescriptor: e.target.value })} />
              </FieldGroup>
              <FieldGroup>
                <Label>Default outfit</Label>
                <Textarea
                  value={form.defaultOutfitDescription}
                  onChange={(e) => setForm({ ...form, defaultOutfitDescription: e.target.value })}
                />
              </FieldGroup>
              <FieldGroup>
                <Label hint="comma-separated">Personality traits</Label>
                <Input value={form.personalityTraits} onChange={(e) => setForm({ ...form, personalityTraits: e.target.value })} />
              </FieldGroup>
              <FieldGroup>
                <Label>Personality summary</Label>
                <Textarea value={form.personalitySummary} onChange={(e) => setForm({ ...form, personalitySummary: e.target.value })} />
              </FieldGroup>
              <FieldGroup>
                <Label>Background</Label>
                <Textarea value={form.background} onChange={(e) => setForm({ ...form, background: e.target.value })} />
              </FieldGroup>
              <FieldGroup>
                <Label>Voice description</Label>
                <Textarea value={form.voiceDescription} onChange={(e) => setForm({ ...form, voiceDescription: e.target.value })} />
              </FieldGroup>
              <FieldGroup>
                <Label>Negative prompt</Label>
                <Textarea value={form.negativePrompt} onChange={(e) => setForm({ ...form, negativePrompt: e.target.value })} />
              </FieldGroup>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Outfits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shirt className="h-4 w-4" /> Outfits
          </CardTitle>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-2 mb-4">
            {character.outfits.length === 0 && <p className="text-sm text-slate-400">No extra outfits saved yet.</p>}
            {character.outfits.map((o) => (
              <Badge key={o.id} className="py-1.5">
                {o.name}
              </Badge>
            ))}
          </div>
          <form onSubmit={addOutfit} className="flex flex-wrap gap-2 items-end">
            <Input
              placeholder="Outfit name (e.g. Winter coat)"
              value={outfitName}
              onChange={(e) => setOutfitName(e.target.value)}
              className="w-48"
            />
            <Input
              placeholder="Description"
              value={outfitDesc}
              onChange={(e) => setOutfitDesc(e.target.value)}
              className="flex-1 min-w-48"
            />
            <Button type="submit" variant="outline" size="sm">
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Relationships */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Relationships
          </CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-2 mb-4">
            {character.relationships.length === 0 && <p className="text-sm text-slate-400">No relationships saved yet.</p>}
            {character.relationships.map((r) => (
              <div key={r.id} className="text-sm flex items-center gap-2">
                <Badge>{r.relationshipType}</Badge>
                <Link href={`/characters/${r.otherCharacter.id}`} className="text-violet-700 hover:underline">
                  {r.otherCharacter.name}
                </Link>
                {r.description && <span className="text-slate-500">— {r.description}</span>}
              </div>
            ))}
          </div>
          <form onSubmit={addRelationship} className="flex flex-wrap gap-2 items-end">
            <Select value={relTo} onChange={(e) => setRelTo(e.target.value)} className="w-48">
              <option value="">Other character…</option>
              {otherCharacters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Input
              placeholder="Relationship (e.g. mechanic to)"
              value={relType}
              onChange={(e) => setRelType(e.target.value)}
              className="w-48"
            />
            <Input
              placeholder="Description (optional)"
              value={relDesc}
              onChange={(e) => setRelDesc(e.target.value)}
              className="flex-1 min-w-48"
            />
            <Button type="submit" variant="outline" size="sm">
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-0.5">{label}</dt>
      <dd className="text-slate-700 whitespace-pre-wrap">{value}</dd>
    </div>
  );
}
