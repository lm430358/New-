"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { ChevronDown, ChevronUp, FolderOpen, History, Trash2 } from "lucide-react";

interface SavedSummary {
  id: string;
  title: string;
  createdAt: string;
  detail: string;
}

interface SavedHistoryProps {
  kind: "calendars" | "campaigns" | "lead-magnets";
  label: string;
  /** Bump this after a new generation so the list picks up the freshly saved row. */
  refreshKey?: number;
  activeId?: string | null;
  onOpen: (item: unknown) => void;
}

/**
 * Lists previously generated calendars / campaigns / lead magnets (they're saved
 * automatically on generation) and lets the user reopen or delete them.
 */
export function SavedHistory({ kind, label, refreshKey = 0, activeId, onOpen }: SavedHistoryProps) {
  const [items, setItems] = useState<SavedSummary[] | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/saved/${kind}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Couldn't load history");
        if (active) setItems(json.items);
      })
      .catch((err: Error) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, [kind, refreshKey]);

  async function handleOpen(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/saved/${kind}/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Couldn't open");
      onOpen(json.item);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/saved/${kind}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Couldn't delete");
      setItems((prev) => prev?.filter((i) => i.id !== id) ?? null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  if (!items || items.length === 0) return null;

  const visible = expanded ? items : items.slice(0, 3);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-3.5">
        <CardTitle className="flex items-center gap-2 text-sm">
          <History className="h-4 w-4 text-slate-400" />
          Saved {label} <span className="text-slate-400 font-normal">({items.length})</span>
        </CardTitle>
      </CardHeader>
      <CardBody className="py-2">
        {error && <p className="text-sm text-red-600 py-2">{error}</p>}
        <ul className="divide-y divide-slate-100">
          {visible.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {item.title}
                  {item.id === activeId && <span className="ml-2 text-xs font-normal text-violet-600">open</span>}
                </p>
                <p className="text-xs text-slate-500 truncate first-letter:uppercase">
                  {[item.detail, formatDate(item.createdAt)].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Button size="sm" variant="outline" onClick={() => handleOpen(item.id)} loading={busyId === item.id}>
                  <FolderOpen className="h-3.5 w-3.5" /> Open
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Delete ${item.title}`}
                  onClick={() => handleDelete(item.id, item.title)}
                  disabled={busyId === item.id}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
        {items.length > 3 && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-700 py-2"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? "Show fewer" : `Show all ${items.length}`}
          </button>
        )}
      </CardBody>
    </Card>
  );
}
