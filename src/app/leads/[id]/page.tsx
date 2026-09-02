"use client";

import { useEffect, useState, use as usePromise } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { inputClass } from "@/components/ui/Field";
import { OWNER_COLOR, PIPELINE_STAGES, stageById } from "@/lib/content/workflow";
import { OUTREACH_TEMPLATES } from "@/lib/content/outreach-templates";

interface OutreachMessage {
  id: string;
  channel: string;
  stage: string;
  subject: string | null;
  content: string;
  status: string;
  createdAt: string;
}

interface AuditReportRow {
  id: string;
  kind: string;
  report: string;
  createdAt: string;
}

interface Lead {
  id: string;
  businessName: string;
  ownerName: string | null;
  industry: string;
  city: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  instagram: string | null;
  facebook: string | null;
  googleBusinessProfile: string | null;
  leadSource: string | null;
  researchNotes: string | null;
  problemsFound: string | null;
  opportunity: string | null;
  leadScore: number | null;
  scoreReasoning: string | null;
  personalizationHook: string | null;
  offerRecommended: string | null;
  potentialDealSize: number | null;
  stage: string;
  closedStatus: string;
  lastContact: string | null;
  nextFollowUp: string | null;
  response: string | null;
  notes: string | null;
  outreachMessages: OutreachMessage[];
  auditReports: AuditReportRow[];
}

const CHANNELS = Array.from(new Set(OUTREACH_TEMPLATES.map((t) => t.channel)));
const STAGES = Array.from(new Set(OUTREACH_TEMPLATES.map((t) => t.stage)));

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const [lead, setLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState("email");
  const [stage, setStage] = useState("initial");
  const [responseText, setResponseText] = useState("");

  async function load() {
    const res = await fetch(`/api/leads/${id}`);
    const data = await res.json();
    setLead(data.lead);
    setNotes(data.lead?.researchNotes ?? "");
    setResponseText(data.lead?.response ?? "");
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function saveNotes() {
    setBusy("notes");
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ researchNotes: notes }),
    });
    setBusy(null);
    load();
  }

  async function saveResponse() {
    setBusy("response");
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response: responseText || null }),
    });
    setBusy(null);
    load();
  }

  async function runScore() {
    setBusy("score");
    setError(null);
    const res = await fetch(`/api/leads/${id}/score`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) setError(data.error);
    setBusy(null);
    load();
  }

  async function runMiniAudit() {
    setBusy("audit");
    setError(null);
    const res = await fetch(`/api/leads/${id}/mini-audit`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) setError(data.error);
    setBusy(null);
    load();
  }

  async function generateOutreach() {
    setBusy("outreach");
    setError(null);
    const res = await fetch(`/api/leads/${id}/outreach`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, stage }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error);
    setBusy(null);
    load();
  }

  async function approveMessage(msgId: string) {
    await fetch(`/api/outreach/${msgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });
    load();
  }

  async function markSent(msgId: string) {
    await fetch(`/api/outreach/${msgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_sent" }),
    });
    load();
  }

  async function setLeadStage(newStage: string) {
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: newStage }),
    });
    load();
  }

  async function setClosed(status: "won" | "lost" | "open") {
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ closedStatus: status }),
    });
    load();
  }

  if (!lead) return <p className="text-sm text-white/40">Loading…</p>;

  const problems: string[] = lead.problemsFound ? JSON.parse(lead.problemsFound) : [];
  const currentStage = stageById(lead.stage);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">{lead.businessName}</h1>
          <p className="mt-1 text-sm text-white/50">
            {lead.industry} {lead.city ? `· ${lead.city}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={OWNER_COLOR[currentStage.owner]}>{currentStage.label}</Badge>
          <Badge className="capitalize">{lead.closedStatus}</Badge>
        </div>
      </div>

      {error && (
        <Card className="mt-4 border-rose-500/30 bg-rose-500/10">
          <p className="text-sm text-rose-200">{error}</p>
        </Card>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h2 className="text-sm font-semibold text-white">Research Notes</h2>
            <p className="mt-1 text-xs text-white/40">
              What you actually observed. AI scoring and outreach only use what&apos;s written here.
            </p>
            <textarea
              className={`${inputClass} mt-3`}
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="mt-2 flex gap-2">
              <Button variant="secondary" onClick={saveNotes} disabled={busy === "notes"}>
                {busy === "notes" ? "Saving…" : "Save Notes"}
              </Button>
              <Button onClick={runScore} disabled={busy === "score"}>
                {busy === "score" ? "Scoring…" : "Score This Lead"}
              </Button>
            </div>
          </Card>

          {lead.leadScore !== null && (
            <Card>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">Score & Opportunity</h2>
                <Badge className="bg-violet-500/15 text-violet-200 border-violet-500/30">{lead.leadScore}/100</Badge>
              </div>
              <p className="mt-2 text-sm text-white/70">{lead.scoreReasoning}</p>
              {problems.length > 0 && (
                <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-white/60">
                  {problems.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              )}
              <div className="mt-3 space-y-1 text-sm">
                <p><span className="text-white/40">Opportunity:</span> {lead.opportunity}</p>
                <p><span className="text-white/40">Recommended offer:</span> {lead.offerRecommended}</p>
                <p><span className="text-white/40">Est. deal size:</span> ${lead.potentialDealSize?.toLocaleString()}</p>
                <p><span className="text-white/40">Personalization hook:</span> {lead.personalizationHook}</p>
              </div>
            </Card>
          )}

          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Mini-Audit (pre-sale snapshot)</h2>
              <Button variant="secondary" onClick={runMiniAudit} disabled={busy === "audit"}>
                {busy === "audit" ? "Generating…" : "Generate Mini-Audit"}
              </Button>
            </div>
            {lead.auditReports.filter((r) => r.kind === "mini_audit").map((r) => {
              const parsed = JSON.parse(r.report);
              return (
                <div key={r.id} className="mt-3 rounded-lg bg-white/5 p-3 text-sm">
                  <p className="font-medium text-white">{parsed.headline}</p>
                  <p className="mt-2 text-white/40 text-xs uppercase">Gaps</p>
                  <ul className="list-inside list-disc text-white/70">{parsed.gaps.map((g: string, i: number) => <li key={i}>{g}</li>)}</ul>
                  <p className="mt-2 text-white/40 text-xs uppercase">Quick Wins</p>
                  <ul className="list-inside list-disc text-white/70">{parsed.quickWins.map((g: string, i: number) => <li key={i}>{g}</li>)}</ul>
                  <p className="mt-2 text-white/40 text-xs uppercase">Biggest Opportunity</p>
                  <p className="text-white/70">{parsed.biggestOpportunity}</p>
                </div>
              );
            })}
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-white">Outreach</h2>
            <div className="mt-3 flex flex-wrap gap-3">
              <select className={inputClass} value={channel} onChange={(e) => setChannel(e.target.value)} style={{ width: "auto" }}>
                {CHANNELS.map((c) => (
                  <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
                ))}
              </select>
              <select className={inputClass} value={stage} onChange={(e) => setStage(e.target.value)} style={{ width: "auto" }}>
                {STAGES.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                ))}
              </select>
              <Button onClick={generateOutreach} disabled={busy === "outreach"}>
                {busy === "outreach" ? "Drafting…" : "Generate Draft"}
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {lead.outreachMessages.length === 0 && <p className="text-sm text-white/40">No drafts yet.</p>}
              {lead.outreachMessages.map((m) => (
                <div key={m.id} className="rounded-lg bg-white/5 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase text-white/40">{m.channel.replace(/_/g, " ")} · {m.stage.replace(/_/g, " ")}</span>
                    <Badge className={m.status === "draft" ? "text-amber-300 border-amber-500/30" : m.status === "approved" ? "text-emerald-300 border-emerald-500/30" : "text-white/40"}>
                      {m.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  {m.subject && <p className="mt-2 text-sm font-medium text-white">{m.subject}</p>}
                  <p className="mt-1 whitespace-pre-wrap text-sm text-white/70">{m.content}</p>
                  <div className="mt-2 flex gap-2">
                    {m.status === "draft" && (
                      <Button variant="secondary" onClick={() => approveMessage(m.id)}>Approve</Button>
                    )}
                    {m.status === "approved" && (
                      <Button variant="secondary" onClick={() => markSent(m.id)}>Mark Sent (I sent this myself)</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-sm font-semibold text-white">Details</h2>
            <dl className="mt-3 space-y-1.5 text-sm">
              <Detail label="Owner" value={lead.ownerName} />
              <Detail label="Website" value={lead.website} />
              <Detail label="Email" value={lead.email} />
              <Detail label="Phone" value={lead.phone} />
              <Detail label="Instagram" value={lead.instagram} />
              <Detail label="Facebook" value={lead.facebook} />
              <Detail label="Google Business Profile" value={lead.googleBusinessProfile} />
              <Detail label="Lead Source" value={lead.leadSource} />
            </dl>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-white">Pipeline Stage</h2>
            <select
              className={`${inputClass} mt-2`}
              value={lead.stage}
              onChange={(e) => setLeadStage(e.target.value)}
            >
              {PIPELINE_STAGES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-white">Follow-Up Status</h2>
            <dl className="mt-2 space-y-1.5 text-sm">
              <Detail label="Last Contact" value={lead.lastContact ? new Date(lead.lastContact).toLocaleString() : null} />
              <Detail
                label="Next Follow-Up"
                value={lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleString() : lead.response ? "Stopped (response logged)" : null}
              />
            </dl>
            <p className="mt-2 text-xs text-white/40">
              Logging a response below stops the auto follow-up sequence for this lead — the scheduler skips any
              lead with a response on file.
            </p>
            <textarea
              className={`${inputClass} mt-2`}
              rows={2}
              placeholder="Paste what they said, if they replied…"
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
            />
            <Button variant="secondary" className="mt-2" onClick={saveResponse} disabled={busy === "response"}>
              {busy === "response" ? "Saving…" : "Save Response"}
            </Button>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-white">Deal Status</h2>
            <div className="mt-2 flex gap-2">
              <Button variant={lead.closedStatus === "won" ? "primary" : "secondary"} onClick={() => setClosed("won")}>Won</Button>
              <Button variant={lead.closedStatus === "lost" ? "primary" : "secondary"} onClick={() => setClosed("lost")}>Lost</Button>
              <Button variant={lead.closedStatus === "open" ? "primary" : "secondary"} onClick={() => setClosed("open")}>Open</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-white/40">{label}</dt>
      <dd className="text-right text-white/80">{value || "—"}</dd>
    </div>
  );
}
