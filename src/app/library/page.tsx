"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { Badge, ScoreBadge } from "@/components/ui/Badge";
import { flattenLibraryBody } from "@/lib/format";
import { downloadFromApi } from "@/lib/download";
import { copyToClipboard, formatDate, slugify } from "@/lib/utils";
import {
  Star,
  Pencil,
  Copy as CopyIcon,
  Trash2,
  FileDown,
  Check,
  X,
  Search,
} from "lucide-react";

interface LibraryItem {
  id: string;
  type: string;
  platform: string | null;
  title: string;
  body: string;
  imagePrompt: string | null;
  qualityScore: number | null;
  favorite: boolean;
  pillar: string | null;
  sourceTool: string | null;
  createdAt: string;
}

const TYPE_OPTIONS = [
  "social_post",
  "video_script",
  "carousel",
  "email",
  "blog_post",
  "website_copy",
  "sales_copy",
  "lead_magnet",
  "campaign_asset",
  "calendar",
  "repurpose_output",
  "improved_content",
  "idea",
];

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (favoriteOnly) params.set("favorite", "true");
    if (search) params.set("q", search);
    fetch(`/api/library?${params.toString()}`)
      .then(async (r) => {
        if (!r.ok) throw new Error();
        setItems((await r.json()).items ?? []);
        setError(null);
      })
      .catch(() => setError("Couldn't load your library. Please refresh to try again."))
      .finally(() => setLoading(false));
  }, [type, favoriteOnly, search]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  async function toggleFavorite(item: LibraryItem) {
    const setFavorite = (favorite: boolean) =>
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, favorite } : i)));
    setFavorite(!item.favorite);
    setError(null);
    try {
      const res = await fetch(`/api/library/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorite: !item.favorite }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setFavorite(item.favorite);
      setError("Couldn't update favorite. Please try again.");
    }
  }

  async function handleDuplicate(item: LibraryItem) {
    setError(null);
    try {
      const res = await fetch(`/api/library/${item.id}/duplicate`, { method: "POST" });
      if (!res.ok) throw new Error();
      load();
    } catch {
      setError("Couldn't duplicate that item. Please try again.");
    }
  }

  async function handleDelete(item: LibraryItem) {
    if (!confirm(`Delete "${item.title}"? This can't be undone.`)) return;
    setError(null);
    try {
      const res = await fetch(`/api/library/${item.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch {
      setError("Couldn't delete that item. Please try again.");
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardBody className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input className="pl-9" placeholder="Search titles…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={type} onChange={(e) => setType(e.target.value)} className="w-48">
            <option value="">All types</option>
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, " ")}
              </option>
            ))}
          </Select>
          <button
            onClick={() => setFavoriteOnly((v) => !v)}
            className={`text-sm rounded-lg border px-3 py-2 flex items-center gap-1.5 ${
              favoriteOnly ? "border-amber-400 bg-amber-50 text-amber-700" : "border-slate-300 text-slate-600"
            }`}
          >
            <Star className={`h-3.5 w-3.5 ${favoriteOnly ? "fill-amber-400" : ""}`} /> Favorites
          </button>
        </CardBody>
      </Card>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-slate-400 text-center py-12">Loading your library…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-12">
          Nothing saved yet — generate content anywhere in the app and hit &ldquo;Save&rdquo;.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <LibraryCard
              key={item.id}
              item={item}
              onToggleFavorite={() => toggleFavorite(item)}
              onDuplicate={() => handleDuplicate(item)}
              onDelete={() => handleDelete(item)}
              onUpdated={(updated) => setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LibraryCard({
  item,
  onToggleFavorite,
  onDuplicate,
  onDelete,
  onUpdated,
}: {
  item: LibraryItem;
  onToggleFavorite: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onUpdated: (item: LibraryItem) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(item.title);
  const [draftText, setDraftText] = useState(() => flattenLibraryBody(JSON.parse(item.body)));
  const [saving, setSaving] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const previewText = flattenLibraryBody(JSON.parse(item.body));

  function handleCancelEdit() {
    setDraftTitle(item.title);
    setDraftText(previewText);
    setEditing(false);
    setCardError(null);
  }

  async function handleCopy() {
    try {
      await copyToClipboard(previewText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCardError("Couldn't copy to the clipboard — select the text and copy it manually.");
    }
  }

  async function handleSaveEdit() {
    setSaving(true);
    setCardError(null);
    try {
      const res = await fetch(`/api/library/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: draftTitle.trim(), body: { text: draftText } }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error();
      onUpdated(json.item);
      setEditing(false);
    } catch {
      setCardError("Couldn't save your edits. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleExport(format: "txt" | "docx" | "pdf") {
    setExportOpen(false);
    setCardError(null);
    try {
      await downloadFromApi(`/api/export/${format}`, { title: item.title, content: previewText }, `${slugify(item.title)}.${format}`);
    } catch {
      setCardError(`Couldn't export as .${format}. Please try again.`);
    }
  }

  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {editing ? (
              <Input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} className="mb-2" />
            ) : (
              <p className="font-semibold text-slate-900">{item.title}</p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-1">
              <Badge>{item.type.replace(/_/g, " ")}</Badge>
              {item.platform && <Badge className="capitalize">{item.platform}</Badge>}
              {item.pillar && <Badge className="bg-violet-50 text-violet-700">{item.pillar}</Badge>}
              {item.qualityScore != null && <ScoreBadge score={item.qualityScore} />}
              <span className="text-xs text-slate-400 self-center">{formatDate(item.createdAt)}</span>
            </div>
          </div>
          <button onClick={onToggleFavorite} className="shrink-0 text-slate-300 hover:text-amber-400">
            <Star className={`h-5 w-5 ${item.favorite ? "fill-amber-400 text-amber-400" : ""}`} />
          </button>
        </div>

        {editing ? (
          <textarea
            className="w-full mt-3 min-h-32 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
          />
        ) : (
          <p className="prose-content text-sm text-slate-600 mt-3 line-clamp-6">{previewText}</p>
        )}

        {cardError && (
          <p role="alert" className="mt-3 text-xs text-red-600">
            {cardError}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          {editing ? (
            <>
              <Button size="sm" onClick={handleSaveEdit} loading={saving} disabled={!draftTitle.trim()}>
                <Check className="h-3.5 w-3.5" /> Save
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                <X className="h-3.5 w-3.5" /> Cancel
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={handleCopy}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button size="sm" variant="outline" onClick={onDuplicate}>
                <CopyIcon className="h-3.5 w-3.5" /> Duplicate
              </Button>
              <div className="relative">
                <Button size="sm" variant="ghost" onClick={() => setExportOpen((v) => !v)}>
                  <FileDown className="h-3.5 w-3.5" /> Export
                </Button>
                {exportOpen && (
                  <div className="absolute z-10 mt-1 bg-white border border-slate-200 rounded-lg shadow-md py-1 w-28">
                    {(["txt", "docx", "pdf"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => handleExport(f)}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                      >
                        .{f}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button size="sm" variant="ghost" onClick={onDelete} className="text-red-600 hover:bg-red-50 ml-auto">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
