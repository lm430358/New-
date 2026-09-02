import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { OFFER } from "@/lib/content/offer";

export default function OfferPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <Badge>{OFFER.parentBrand}</Badge>
        <h1 className="mt-2 text-2xl font-semibold text-white">{OFFER.name}</h1>
        <p className="mt-2 text-lg text-white/80">{OFFER.headline}</p>
        <p className="mt-1 text-sm text-white/50">{OFFER.subheadline}</p>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-white">Sales Page Copy</h2>
        <div className="mt-3 space-y-5 text-sm">
          <div>
            <p className="text-xs uppercase text-white/40">{OFFER.salesPageCopy.hero.eyebrow}</p>
            <p className="mt-1 text-lg font-semibold text-white">{OFFER.salesPageCopy.hero.headline}</p>
            <p className="mt-1 text-white/70">{OFFER.salesPageCopy.hero.body}</p>
            <p className="mt-2 font-medium text-violet-300">{OFFER.salesPageCopy.hero.cta}</p>
          </div>
          <div>
            <p className="font-semibold text-white">{OFFER.salesPageCopy.problem.headline}</p>
            <p className="text-white/70">{OFFER.salesPageCopy.problem.body}</p>
          </div>
          <div>
            <p className="font-semibold text-white">{OFFER.salesPageCopy.solution.headline}</p>
            <p className="text-white/70">{OFFER.salesPageCopy.solution.body}</p>
          </div>
          <div>
            <p className="font-semibold text-white">{OFFER.salesPageCopy.proof.headline}</p>
            <p className="text-white/70">{OFFER.salesPageCopy.proof.body}</p>
          </div>
          <div className="rounded-lg bg-violet-500/10 p-3">
            <p className="font-semibold text-white">{OFFER.salesPageCopy.close.headline}</p>
            <p className="mt-1 text-violet-300">{OFFER.salesPageCopy.close.cta}</p>
            <p className="mt-1 text-xs text-white/50">{OFFER.salesPageCopy.close.riskReversal}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-white">Deliverables</h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-white/70">
            {OFFER.deliverables.map((d) => <li key={d}>{d}</li>)}
          </ul>
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-white">Bonuses</h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-white/70">
            {OFFER.bonuses.map((d) => <li key={d}>{d}</li>)}
          </ul>
        </Card>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-white">Guarantee</h2>
        <p className="mt-1 text-sm text-white/70">{OFFER.guarantee}</p>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-white">FAQs</h2>
        <div className="mt-3 space-y-3">
          {OFFER.faqs.map((f) => (
            <div key={f.q}>
              <p className="text-sm font-medium text-white">{f.q}</p>
              <p className="text-sm text-white/60">{f.a}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-white">Objections & Responses</h2>
        <div className="mt-3 space-y-3">
          {OFFER.objections.map((o) => (
            <div key={o.objection}>
              <p className="text-sm font-medium text-white">{o.objection}</p>
              <p className="text-sm text-white/60">{o.response}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-white">Checkout Page Copy</h2>
          <p className="mt-2 text-sm font-medium text-white">{OFFER.checkoutCopy.headline}</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-white/70">
            {OFFER.checkoutCopy.bullets.map((b) => <li key={b}>{b}</li>)}
          </ul>
          <p className="mt-2 text-sm font-semibold text-violet-300">{OFFER.checkoutCopy.price}</p>
          <p className="mt-1 text-xs text-white/40">{OFFER.checkoutCopy.reassurance}</p>
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-white">Booking Page Copy</h2>
          <p className="mt-2 text-sm font-medium text-white">{OFFER.bookingCopy.headline}</p>
          <p className="mt-1 text-sm text-white/70">{OFFER.bookingCopy.body}</p>
          <p className="mt-2 text-sm font-semibold text-violet-300">{OFFER.bookingCopy.cta}</p>
          <p className="mt-1 text-xs text-white/40">{OFFER.bookingCopy.afterBooking}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-white">Upsells</h2>
          <div className="mt-2 space-y-2 text-sm">
            {OFFER.upsells.map((u) => (
              <div key={u.name}>
                <p className="font-medium text-white">{u.name}</p>
                <p className="text-white/60">{u.pitch}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-white">Downsells</h2>
          <div className="mt-2 space-y-2 text-sm">
            {OFFER.downsells.map((u) => (
              <div key={u.name}>
                <p className="font-medium text-white">{u.name}</p>
                <p className="text-white/60">{u.pitch}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
