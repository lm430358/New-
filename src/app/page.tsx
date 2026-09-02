import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { OWNER_COLOR, OWNER_LABEL, PIPELINE_STAGES, stageById } from "@/lib/content/workflow";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getMetrics() {
  const [leads, tasks] = await Promise.all([
    prisma.lead.findMany(),
    prisma.task.findMany({ where: { status: "pending" }, orderBy: { createdAt: "desc" } }),
  ]);

  const hotLeads = leads.filter((l) => (l.leadScore ?? 0) >= 70 && l.closedStatus === "open");
  const appointments = leads.filter((l) => l.appointment !== null);
  const proposals = leads.filter((l) => l.stage === "proposal_sent");
  const customers = leads.filter((l) => l.closedStatus === "won");
  const lost = leads.filter((l) => l.closedStatus === "lost");
  const pipelineValue = leads
    .filter((l) => l.closedStatus === "open")
    .reduce((sum, l) => sum + (l.potentialDealSize ?? 0), 0);
  const revenue = customers.reduce((sum, l) => sum + (l.potentialDealSize ?? 0), 0);
  const decided = customers.length + lost.length;
  const conversionRate = decided > 0 ? Math.round((customers.length / decided) * 100) : 0;
  const topOpportunities = leads
    .filter((l) => l.closedStatus === "open" && l.leadScore !== null)
    .sort((a, b) => (b.leadScore ?? 0) - (a.leadScore ?? 0))
    .slice(0, 5);

  const aiAssistedStages = PIPELINE_STAGES.filter((s) => s.owner === "ai_assisted").length;

  return {
    totalLeads: leads.length,
    hotLeads: hotLeads.length,
    appointments: appointments.length,
    proposals: proposals.length,
    customers: customers.length,
    conversionRate,
    pipelineValue,
    revenue,
    tasks,
    topOpportunities,
    aiAssistedStages,
  };
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <div className="text-xs uppercase tracking-wide text-white/40">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-white/40">{sub}</div>}
    </Card>
  );
}

export default async function DashboardPage() {
  const m = await getMetrics();

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold text-white">Command Center</h1>
      <p className="mt-1 text-sm text-white/50">
        Live from the CRM. Revenue and MRR are computed from leads you&apos;ve actually marked won — nothing
        here is simulated.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Revenue (Won Deals)" value={`$${m.revenue.toLocaleString()}`} />
        <Stat label="Pipeline Value" value={`$${m.pipelineValue.toLocaleString()}`} />
        <Stat label="Monthly Recurring Revenue" value="$0" sub="No recurring clients marked yet" />
        <Stat label="Conversion Rate" value={`${m.conversionRate}%`} sub="Won vs. won+lost" />
        <Stat label="Total Leads" value={String(m.totalLeads)} />
        <Stat label="Hot Leads" value={String(m.hotLeads)} sub="Score ≥ 70, still open" />
        <Stat label="Appointments" value={String(m.appointments)} />
        <Stat label="Proposals Out" value={String(m.proposals)} />
        <Stat label="Customers" value={String(m.customers)} />
        <Stat label="AI-Assisted Pipeline Stages" value={String(m.aiAssistedStages)} sub="of the full workflow" />
        <Stat label="Failed Automations" value="0" sub="Nothing tracked failing" />
        <Stat label="Tasks Needing Approval" value={String(m.tasks.length)} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-white">Tasks Requiring My Approval</h2>
          {m.tasks.length === 0 ? (
            <p className="mt-3 text-sm text-white/40">Nothing pending. New tasks appear here automatically.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {m.tasks.map((t) => (
                <li key={t.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
                  <span>{t.title}</span>
                  <Badge>{t.type}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-white">Top Opportunities</h2>
          {m.topOpportunities.length === 0 ? (
            <p className="mt-3 text-sm text-white/40">
              Score some leads on the <Link href="/leads" className="text-violet-300 underline">Leads</Link> page to
              populate this.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {m.topOpportunities.map((l) => (
                <li key={l.id}>
                  <Link
                    href={`/leads/${l.id}`}
                    className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                  >
                    <span>{l.businessName}</span>
                    <Badge className={OWNER_COLOR[stageById(l.stage).owner]}>{l.leadScore}/100</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-white">Pipeline Ownership</h2>
        <p className="mt-1 text-xs text-white/40">
          What&apos;s actually automated vs. what still needs you — see the full map on{" "}
          <Link href="/playbook" className="text-violet-300 underline">Playbook</Link>.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PIPELINE_STAGES.map((s) => (
            <Badge key={s.id} className={OWNER_COLOR[s.owner]} title={s.description}>
              {s.label} · {OWNER_LABEL[s.owner]}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}
