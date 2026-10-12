"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Wand2, Plus, X, ArrowLeft } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Textarea, Select, Label, FieldGroup } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { CharacterDTO } from "@/lib/characters/serialize";

interface SceneCharacterRow {
  characterId: string;
  outfitDescription: string;
}

export default function GenerateScenePage() {
  const { id } = useParams<{ id: string }>();
  const [allCharacters, setAllCharacters] = useState<CharacterDTO[]>([]);
  const [rows, setRows] = useState<SceneCharacterRow[]>([{ characterId: id, outfitDescription: "" }]);
  const [environment, setEnvironment] = useState("");
  const [pose, setPose] = useState("");
  const [expression, setExpression] = useState("");
  const [cameraAngle, setCameraAngle] = useState("");
  const [lighting, setLighting] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/characters")
      .then((r) => r.json())
      .then((data) => setAllCharacters(data.characters ?? []));
  }, []);

  function addRow() {
    const unused = allCharacters.find((c) => !rows.some((r) => r.characterId === c.id));
    if (unused) setRows([...rows, { characterId: unused.id, outfitDescription: "" }]);
  }

  function removeRow(index: number) {
    setRows(rows.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNote(null);
    setResultUrl(null);
    const res = await fetch("/api/generate/scene", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        characters: rows.map((r) => ({
          characterId: r.characterId,
          outfitDescription: r.outfitDescription || undefined,
        })),
        environment,
        pose: pose || undefined,
        expression: expression || undefined,
        cameraAngle: cameraAngle || undefined,
        lighting: lighting || undefined,
        additionalDetails: additionalDetails || undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Generation failed.");
      return;
    }
    setResultUrl(data.generation.imageUrl);
    setNote(data.note ?? null);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Link href={`/characters/${id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to character
      </Link>

      <h2 className="text-xl font-semibold text-slate-900">Generate a Scene</h2>

      <Card>
        <CardHeader>
          <CardTitle>Characters in this scene</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <Select
                value={row.characterId}
                onChange={(e) => {
                  const next = [...rows];
                  next[i].characterId = e.target.value;
                  setRows(next);
                }}
                className="w-48"
              >
                {allCharacters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
              <Input
                placeholder="Outfit override (optional)"
                value={row.outfitDescription}
                onChange={(e) => {
                  const next = [...rows];
                  next[i].outfitDescription = e.target.value;
                  setRows(next);
                }}
                className="flex-1"
              />
              {rows.length > 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => removeRow(i)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
          {rows.length < allCharacters.length && (
            <Button type="button" variant="outline" size="sm" onClick={addRow}>
              <Plus className="h-3.5 w-3.5" />
              Add another character
            </Button>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scene details</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Label>Environment / location</Label>
              <Textarea
                required
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                placeholder="e.g. inside a busy auto repair shop, tools and a lifted car in the background"
              />
            </FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <FieldGroup>
                <Label hint="optional">Pose / action</Label>
                <Input value={pose} onChange={(e) => setPose(e.target.value)} placeholder="leaning on a workbench" />
              </FieldGroup>
              <FieldGroup>
                <Label hint="optional">Expression</Label>
                <Input value={expression} onChange={(e) => setExpression(e.target.value)} placeholder="laughing" />
              </FieldGroup>
              <FieldGroup>
                <Label hint="optional">Camera angle</Label>
                <Input value={cameraAngle} onChange={(e) => setCameraAngle(e.target.value)} placeholder="low angle, medium shot" />
              </FieldGroup>
              <FieldGroup>
                <Label hint="optional">Lighting</Label>
                <Input value={lighting} onChange={(e) => setLighting(e.target.value)} placeholder="warm late-afternoon sunlight" />
              </FieldGroup>
            </div>
            <FieldGroup>
              <Label hint="optional">Additional details</Label>
              <Textarea value={additionalDetails} onChange={(e) => setAdditionalDetails(e.target.value)} />
            </FieldGroup>

            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

            <Button type="submit" loading={loading} className="w-full">
              <Wand2 className="h-4 w-4" />
              {loading ? "Generating…" : "Generate Scene"}
            </Button>
          </form>
        </CardBody>
      </Card>

      {note && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{note}</p>
      )}

      {resultUrl && (
        <Card>
          <CardBody>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resultUrl} alt="Generated scene" className="rounded-lg w-full" />
          </CardBody>
        </Card>
      )}
    </div>
  );
}
