import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { OWNER_COLOR, OWNER_LABEL } from "@/lib/content/workflow";
import { RECURRING_SERVICE } from "@/lib/content/recurring";

export default function RecurringPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold text-white">Recurring Revenue Design</h1>
      <p className="mt-1 text-sm text-white/50">Phase 9 — the monthly service chosen for profitability + automation.</p>

      <Card className="mt-6">
        <h2 className="text-lg font-semibold text-white">{RECURRING_SERVICE.name}</h2>
        <p className="mt-1 text-violet-300">{RECURRING_SERVICE.price}</p>
        <p className="mt-3 text-sm text-white/70">{RECURRING_SERVICE.chosenBecause}</p>
      </Card>

      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-white">What&apos;s Included</h2>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-white/70">
          {RECURRING_SERVICE.whatItIncludes.map((i) => <li key={i}>{i}</li>)}
        </ul>
      </Card>

      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-white">Fulfillment Model</h2>
        <div className="mt-3 space-y-3">
          {(Object.entries(RECURRING_SERVICE.fulfillmentModel) as unknown as [keyof typeof OWNER_LABEL, string[]][]).map(
            ([key, items]) => (
              <div key={key}>
                <Badge className={OWNER_COLOR[key]}>{OWNER_LABEL[key]}</Badge>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-white/70">
                  {items.map((i) => <li key={i}>{i}</li>)}
                </ul>
              </div>
            )
          )}
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-white">Upgrade Path</h2>
        <p className="mt-1 text-sm text-white/70">{RECURRING_SERVICE.upgradePath}</p>
      </Card>
    </div>
  );
}
