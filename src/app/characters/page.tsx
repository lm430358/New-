"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Users, Copy, Trash2, ImageOff } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { CharacterDTO } from "@/lib/characters/serialize";

export default function CharactersPage() {
  const [characters, setCharacters] = useState<CharacterDTO[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    fetch("/api/characters")
      .then((r) => r.json())
      .then((data) => setCharacters(data.characters ?? []));
  };

  useEffect(load, []);

  async function handleDuplicate(id: string) {
    setBusyId(id);
    await fetch(`/api/characters/${id}/duplicate`, { method: "POST" });
    setBusyId(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this character? This cannot be undone.")) return;
    setBusyId(id);
    await fetch(`/api/characters/${id}`, { method: "DELETE" });
    setBusyId(null);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Character Library</h2>
          <p className="text-sm text-slate-500 mt-1">
            Every saved character, remembered in full — appearance, personality, voice, and relationships.
          </p>
        </div>
        <Link href="/characters/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Character
          </Button>
        </Link>
      </div>

      {characters === null && <p className="text-sm text-slate-400">Loading…</p>}

      {characters !== null && characters.length === 0 && (
        <Card>
          <CardBody className="text-center py-16">
            <Users className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">No characters yet.</p>
            <Link href="/characters/new">
              <Button>
                <Plus className="h-4 w-4" />
                Create your first character
              </Button>
            </Link>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters?.map((c) => (
          <Card key={c.id} className="overflow-hidden flex flex-col">
            <Link href={`/characters/${c.id}`} className="block">
              <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
                {c.primaryReferenceImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.primaryReferenceImageUrl} alt={c.name} className="h-full w-full object-cover" />
                ) : (
                  <ImageOff className="h-8 w-8 text-slate-300" />
                )}
              </div>
            </Link>
            <CardBody className="flex-1 flex flex-col">
              <div className="flex items-center justify-between gap-2 mb-1">
                <Link href={`/characters/${c.id}`} className="font-semibold text-slate-900 hover:text-violet-700 truncate">
                  {c.name}
                </Link>
                <Badge className="shrink-0 capitalize">{c.style.replace("_", " ")}</Badge>
              </div>
              <p className="text-xs text-slate-500 mb-2">
                {[c.age, c.gender, c.occupation].filter(Boolean).join(" · ") || "No details yet"}
              </p>
              <p className="text-sm text-slate-600 line-clamp-2 flex-1">{c.personalitySummary}</p>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busyId === c.id}
                  onClick={() => handleDuplicate(c.id)}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Duplicate
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busyId === c.id}
                  onClick={() => handleDelete(c.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
