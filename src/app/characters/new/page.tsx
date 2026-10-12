"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Textarea, Select, Label, FieldGroup } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const STYLES = [
  { id: "realistic", label: "Photorealistic human" },
  { id: "semi_realistic", label: "Semi-realistic / stylized human" },
  { id: "cartoon", label: "Cartoon" },
  { id: "anime", label: "Anime" },
  { id: "3d_animated", label: "3D animated (Pixar-style)" },
  { id: "other", label: "Other / custom style" },
];

export default function NewCharacterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [style, setStyle] = useState("realistic");
  const [species, setSpecies] = useState("human");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/characters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name || undefined, style, species, description }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error?.formErrors?.join(", ") || data.error || "Something went wrong.");
      return;
    }
    router.push(`/characters/${data.character.id}`);
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-semibold text-slate-900 mb-1">Create a New Character</h2>
      <p className="text-sm text-slate-500 mb-6">
        Describe who they are. The AI will turn this into a complete, reusable character profile — face,
        body, personality, voice, and backstory — plus an initial reference image that locks their
        appearance for every future generation.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Character Details</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Label hint="optional — we'll suggest one if left blank">Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Marcus" />
            </FieldGroup>

            <div className="grid grid-cols-2 gap-4">
              <FieldGroup>
                <Label>Art style</Label>
                <Select value={style} onChange={(e) => setStyle(e.target.value)}>
                  {STYLES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              </FieldGroup>
              <FieldGroup>
                <Label hint="optional">Species / type</Label>
                <Input value={species} onChange={(e) => setSpecies(e.target.value)} placeholder="human, animal, robot..." />
              </FieldGroup>
            </div>

            <FieldGroup>
              <Label hint="the more specific, the more consistent future generations will be">
                Description
              </Label>
              <Textarea
                required
                minLength={10}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-40"
                placeholder="e.g. Marcus is a 45-year-old mechanic — stocky build, buzzed grey hair, a thick salt-and-pepper beard, warm brown eyes, a small scar above his left eyebrow. Gruff on the outside but soft-hearted, dry sense of humor, fiercely loyal to his regulars. Usually in a faded blue work shirt with his name stitched on the pocket."
              />
            </FieldGroup>

            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

            <Button type="submit" loading={loading} className="w-full">
              <Sparkles className="h-4 w-4" />
              {loading ? "Building character…" : "Create Character"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
