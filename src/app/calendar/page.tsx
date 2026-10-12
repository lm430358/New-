"use client";

import { useState, useSyncExternalStore } from "react";
import { format } from "date-fns";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldGroup, Select } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { SavedHistory } from "@/components/SavedHistory";
import { CALENDAR_LENGTHS } from "@/lib/types";
import type { CalendarContent } from "@/lib/ai/schemas";
import { downloadFromApi } from "@/lib/download";
import { CalendarDays, FileDown, Save, Check } from "lucide-react";
import { readApiJson } from "@/lib/api";

const subscribeNever = () => () => {};
const localToday = () => format(new Date(), "yyyy-MM-dd");

export default function CalendarPage() {
  const [days, setDays] = useState<number>(7);
  // Today in the user's own time zone. Read via useSyncExternalStore so the prerendered
  // HTML doesn't bake in the build date (React won't patch a mismatched input value).
  const today = useSyncExternalStore(subscribeNever, localToday, () => "");
  const [pickedStartDate, setStartDate] = useState<string | null>(null);
  const startDate = pickedStartDate ?? today;
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [calendar, setCalendar] = useState<CalendarContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [historyKey, setHistoryKey] = useState(0);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCalendar(null);
    setSaved(false);
    setActionError(null);
    setActiveId(null);
    try {
      const res = await fetch("/api/generate/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days, startDate: startDate || undefined, title: title || undefined }),
      });
      const json = await readApiJson(res);
      setCalendar(json.calendar);
      setActiveId(json.id);
      setHistoryKey((k) => k + 1);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenSaved(item: unknown) {
    const saved = item as { id: string; calendar: CalendarContent };
    setCalendar(saved.calendar);
    setActiveId(saved.id);
    setSaved(false);
    setActionError(null);
    setError(null);
  }

  async function handleExportCsv() {
    if (!calendar) return;
    const rows = calendar.entries.map((e) => ({
      Day: e.day,
      Date: e.date,
      Platform: e.platform,
      "Content Type": e.contentType,
      Pillar: e.pillar,
      Goal: e.goal,
      Topic: e.topic,
      Hook: e.hook,
      "Caption / Script": e.captionOrScript,
      CTA: e.cta,
      "Visual Idea": e.visualIdea,
      Hashtags: e.hashtags.join(" "),
    }));
    setActionError(null);
    try {
      await downloadFromApi("/api/export/csv", { rows, filename: "content-calendar.csv" }, "content-calendar.csv");
    } catch {
      setActionError("Couldn't export the CSV. Please try again.");
    }
  }

  async function handleSaveToLibrary() {
    if (!calendar) return;
    setActionError(null);
    const res = await fetch("/api/library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "calendar",
        title: calendar.title,
        body: calendar,
        sourceTool: "calendar",
      }),
    }).catch(() => null);
    if (res?.ok) setSaved(true);
    else setActionError("Couldn't save to the library. Please try again.");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Calendar</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Built from your content pillars so platforms, pillars, and goals rotate — never the same thing twice in a row.
          </p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleGenerate}>
            <div className="grid sm:grid-cols-3 gap-x-4">
              <FieldGroup>
                <Label>Length</Label>
                <Select value={days} onChange={(e) => setDays(Number(e.target.value))}>
                  {CALENDAR_LENGTHS.map((d) => (
                    <option key={d} value={d}>
                      {d} days
                    </option>
                  ))}
                </Select>
              </FieldGroup>
              <FieldGroup>
                <Label>Start date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </FieldGroup>
              <FieldGroup>
                <Label hint="optional">Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Spring Promo Calendar" />
              </FieldGroup>
            </div>
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <Button type="submit" loading={loading}>
              <CalendarDays className="h-4 w-4" /> Generate Calendar
            </Button>
            {loading && (
              <p className="text-xs text-slate-400 mt-2">
                Building {days} days of content — larger calendars can take a couple of minutes.
              </p>
            )}
          </form>
        </CardBody>
      </Card>

      <SavedHistory kind="calendars" label="calendars" refreshKey={historyKey} activeId={activeId} onOpen={handleOpenSaved} />

      {calendar && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{calendar.title}</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleExportCsv}>
                <FileDown className="h-3.5 w-3.5" /> Export CSV
              </Button>
              <Button size="sm" variant="outline" onClick={handleSaveToLibrary} disabled={saved}>
                {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                {saved ? "Saved" : "Save to Library"}
              </Button>
            </div>
          </CardHeader>
          {actionError && (
            <p role="alert" className="px-5 pt-3 text-sm text-red-600">
              {actionError}
            </p>
          )}
          <CardBody className="overflow-x-auto">
            <div className="space-y-3 min-w-[720px]">
              {calendar.entries.map((entry) => (
                <div key={entry.day} className="border border-slate-100 rounded-lg p-3">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-sm font-semibold text-slate-900">
                      Day {entry.day} · {entry.date}
                    </span>
                    <Badge className="capitalize">{entry.platform}</Badge>
                    <Badge>{entry.contentType}</Badge>
                    <Badge className="bg-violet-50 text-violet-700">{entry.pillar}</Badge>
                    <Badge className="bg-emerald-50 text-emerald-700">{entry.goal}</Badge>
                  </div>
                  <p className="text-sm font-medium text-slate-800">{entry.topic}</p>
                  <p className="text-sm text-slate-600 mt-0.5">
                    <span className="text-slate-400">Hook:</span> {entry.hook}
                  </p>
                  <p className="text-sm text-slate-600 mt-0.5 whitespace-pre-wrap">{entry.captionOrScript}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    <span className="font-medium">CTA:</span> {entry.cta} · <span className="font-medium">Visual:</span>{" "}
                    {entry.visualIdea}
                  </p>
                  {entry.hashtags.length > 0 && (
                    <p className="text-xs text-violet-600 mt-1">{entry.hashtags.map((h) => `#${h}`).join(" ")}</p>
                  )}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
