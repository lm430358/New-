import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MARKET_RESEARCH, OFFER_ANALYSIS } from "@/lib/content/strategy";
import { OWNER_COLOR, OWNER_LABEL, FULL_WORKFLOW } from "@/lib/content/workflow";

export default function PlaybookPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Strategy & Playbook</h1>
        <p className="mt-1 text-sm text-white/50">Phase 1 (market research + offer selection) and Phase 6 (automation map).</p>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-white">Market Research</h2>
        <p className="mt-2 text-sm text-white/70">{MARKET_RESEARCH.summary}</p>
        <div className="mt-4 space-y-3">
          {MARKET_RESEARCH.findings.map((f) => (
            <div key={f.segment} className="rounded-lg bg-white/5 p-3">
              <p className="text-sm font-medium text-white">{f.segment}</p>
              <p className="mt-1 text-xs text-white/40">{f.pricing}</p>
              <p className="mt-1 text-sm text-white/60">{f.whatTheyOffer}</p>
              <p className="mt-1 text-sm text-rose-300/80">Weakness: {f.weakness}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg bg-violet-500/10 p-3">
          <p className="text-sm font-medium text-white">The Gap</p>
          <p className="mt-1 text-sm text-white/70">{MARKET_RESEARCH.gap}</p>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-white">Competitive Advantage</h2>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-white/70">
          {MARKET_RESEARCH.competitiveAdvantage.map((a) => <li key={a}>{a}</li>)}
        </ul>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-white">Offer Selection</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-lg bg-white/5 p-3">
            <p className="text-xs uppercase text-white/40">Easiest to Sell Now</p>
            <p className="mt-1 text-sm font-medium text-white">{OFFER_ANALYSIS.easiestToSellNow.name}</p>
            <p className="mt-1 text-xs text-white/60">{OFFER_ANALYSIS.easiestToSellNow.why}</p>
          </div>
          <div className="rounded-lg bg-white/5 p-3">
            <p className="text-xs uppercase text-white/40">Most Profitable</p>
            <p className="mt-1 text-sm font-medium text-white">{OFFER_ANALYSIS.mostProfitable.name}</p>
            <p className="mt-1 text-xs text-white/60">{OFFER_ANALYSIS.mostProfitable.why}</p>
          </div>
          <div className="rounded-lg bg-white/5 p-3">
            <p className="text-xs uppercase text-white/40">Most Scalable</p>
            <p className="mt-1 text-sm font-medium text-white">{OFFER_ANALYSIS.mostScalable.name}</p>
            <p className="mt-1 text-xs text-white/60">{OFFER_ANALYSIS.mostScalable.why}</p>
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-violet-500/10 p-3">
          <p className="text-sm font-medium text-white">Chosen Wedge: {OFFER_ANALYSIS.chosenWedge.name}</p>
          <p className="mt-1 text-sm text-white/70">{OFFER_ANALYSIS.chosenWedge.rationale}</p>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-white">Pain Point & Positioning</h2>
        <p className="mt-2 text-sm text-white/70"><span className="text-white/40">Pain point:</span> {OFFER_ANALYSIS.painPoint}</p>
        <p className="mt-1 text-sm text-white/70"><span className="text-white/40">Positioning:</span> {OFFER_ANALYSIS.positioning}</p>
        <p className="mt-1 text-sm text-white/70"><span className="text-white/40">Pricing ladder:</span> {OFFER_ANALYSIS.pricing}</p>
        <p className="mt-1 text-sm text-white/70"><span className="text-white/40">Recurring path:</span> {OFFER_ANALYSIS.recurringPath}</p>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-white">Included</h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-white/70">
            {OFFER_ANALYSIS.included.map((i) => <li key={i}>{i}</li>)}
          </ul>
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-white">Deliberately Excluded</h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-white/70">
            {OFFER_ANALYSIS.excluded.map((i) => <li key={i}>{i}</li>)}
          </ul>
        </Card>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-white">Full Automation Workflow</h2>
        <p className="mt-1 text-xs text-white/40">Lead Found → … → Referral Request, with true ownership at every step.</p>
        <div className="mt-3 space-y-2">
          {FULL_WORKFLOW.map((w, i) => (
            <div key={w.step} className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2 text-sm">
              <span className="w-5 text-right text-white/30">{i + 1}</span>
              <span className="flex-1 text-white/80">{w.step}</span>
              <Badge className={OWNER_COLOR[w.owner]}>{OWNER_LABEL[w.owner]}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
