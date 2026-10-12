"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Images } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface SceneGeneration {
  id: string;
  imageUrl: string | null;
  status: string;
  createdAt: string;
  characters: { character: { id: string; name: string } }[];
}

export default function ScenesPage() {
  const [generations, setGenerations] = useState<SceneGeneration[] | null>(null);

  useEffect(() => {
    fetch("/api/scenes")
      .then((r) => r.json())
      .then((data) => setGenerations(data.generations ?? []));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900 mb-1">Scenes Gallery</h2>
      <p className="text-sm text-slate-500 mb-6">Every generated scene, with the characters that appear in it.</p>

      {generations === null && <p className="text-sm text-slate-400">Loading…</p>}

      {generations !== null && generations.length === 0 && (
        <Card>
          <CardBody className="text-center py-16">
            <Images className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No scenes generated yet.</p>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {generations?.map((g) => (
          <Card key={g.id} className="overflow-hidden">
            <div className="aspect-square bg-slate-100 flex items-center justify-center">
              {g.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={g.imageUrl} alt="Scene" className="h-full w-full object-cover" />
              ) : (
                <Badge className="bg-red-100 text-red-700">Failed</Badge>
              )}
            </div>
            <CardBody>
              <div className="flex flex-wrap gap-1.5">
                {g.characters.map((c) => (
                  <Link key={c.character.id} href={`/characters/${c.character.id}`}>
                    <Badge>{c.character.name}</Badge>
                  </Link>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
