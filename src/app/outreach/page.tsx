import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { OUTREACH_TEMPLATES } from "@/lib/content/outreach-templates";

const CHANNEL_LABEL: Record<string, string> = {
  email: "Email",
  instagram_dm: "Instagram DM",
  facebook: "Facebook Message",
  sms: "SMS",
};

export default function OutreachPage() {
  const byChannel = Object.entries(CHANNEL_LABEL).map(([channel, label]) => ({
    channel,
    label,
    templates: OUTREACH_TEMPLATES.filter((t) => t.channel === channel),
  }));

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold text-white">Outreach Template Library</h1>
      <p className="mt-1 text-sm text-white/50">
        Base templates for every stage of the funnel. On a lead&apos;s detail page, AI fills the{" "}
        <code className="rounded bg-white/10 px-1">{"{{placeholders}}"}</code> in with genuine,
        lead-specific details — nothing is ever sent automatically; every draft needs your approval first.
      </p>

      <div className="mt-6 space-y-8">
        {byChannel.map(({ channel, label, templates }) => (
          <div key={channel}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">{label}</h2>
            <div className="space-y-3">
              {templates.map((t) => (
                <Card key={t.id}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{t.label}</span>
                    <Badge>{t.stage.replace(/_/g, " ")}</Badge>
                  </div>
                  {t.subject && <p className="mt-2 text-sm font-medium text-white/80">Subject: {t.subject}</p>}
                  <p className="mt-1 whitespace-pre-wrap text-sm text-white/60">{t.body}</p>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
