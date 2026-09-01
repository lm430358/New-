import Link from "next/link";
import {
  Sparkles,
  Share2,
  Clapperboard,
  CalendarDays,
  Megaphone,
  Globe,
  DollarSign,
  BookOpenCheck,
  Recycle,
  Wand2,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { getActiveBusinessProfile } from "@/lib/business";

const tiles = [
  {
    href: "/everything",
    icon: Sparkles,
    title: "One Idea → Everything",
    description: "Turn a single idea into a Facebook post, Instagram content, TikTok/Reels/Shorts scripts, LinkedIn post, email, blog post, and more — all at once.",
    accent: "from-violet-600 to-fuchsia-500",
    featured: true,
  },
  {
    href: "/social",
    icon: Share2,
    title: "Create Social Media Content",
    description: "Facebook, Instagram, TikTok, and LinkedIn content — each adapted to how that platform actually performs.",
    accent: "from-sky-500 to-cyan-500",
  },
  {
    href: "/video",
    icon: Clapperboard,
    title: "Create Video Content",
    description: "Short-form video scripts with hooks, on-screen text, b-roll, camera direction, and CTAs — any length.",
    accent: "from-rose-500 to-orange-500",
  },
  {
    href: "/calendar",
    icon: CalendarDays,
    title: "Create Content Calendar",
    description: "7, 14, 30, 60, or 90-day calendars built from your content pillars so nothing repeats.",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    href: "/campaign",
    icon: Megaphone,
    title: "Create Marketing Campaign",
    description: "A full campaign around a product, promotion, or launch: strategy, posts, scripts, emails, and ads.",
    accent: "from-amber-500 to-yellow-500",
  },
  {
    href: "/business-content",
    icon: Globe,
    title: "Create Business Content",
    description: "Website copy, service descriptions, FAQs, blog posts, and newsletters.",
    accent: "from-indigo-500 to-blue-500",
  },
  {
    href: "/sales",
    icon: DollarSign,
    title: "Create Promotional & Sales Content",
    description: "Sales pages, ads, offers, and follow-up messages — persuasive, never deceptive.",
    accent: "from-lime-500 to-green-500",
  },
  {
    href: "/lead-magnet",
    icon: BookOpenCheck,
    title: "Create Digital Products",
    description: "Ebooks, checklists, guides, workbooks, and lead magnets — outline through full draft.",
    accent: "from-fuchsia-500 to-pink-500",
  },
  {
    href: "/repurpose",
    icon: Recycle,
    title: "Repurpose My Content",
    description: "Paste one piece of content and turn it into 20 pieces across every format.",
    accent: "from-cyan-500 to-blue-500",
  },
  {
    href: "/improve",
    icon: Wand2,
    title: "Content Improver",
    description: "Paste existing content and make it better, shorter, more persuasive, or on-brand.",
    accent: "from-purple-500 to-violet-500",
  },
  {
    href: "/ideas",
    icon: Lightbulb,
    title: "I Don't Know What to Post",
    description: "Fresh, non-repetitive content ideas pulled from your pillars, audience, and goals.",
    accent: "from-orange-500 to-red-500",
  },
];

export default async function DashboardPage() {
  const profile = await getActiveBusinessProfile();

  return (
    <div className="space-y-8">
      {!profile && (
        <Card className="border-violet-200 bg-violet-50/50">
          <CardBody className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-semibold text-violet-900">Set up your business profile to get started</p>
              <p className="text-sm text-violet-700/80 mt-0.5">
                Tell the AI about your business once — it will reuse it for every piece of content from here on.
              </p>
            </div>
            <Link
              href="/business-profile"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg px-4 py-2 shrink-0"
            >
              Set up profile <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardBody>
        </Card>
      )}

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
          What do you want to create?
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tiles.map((tile) => (
            <Link key={tile.href} href={tile.href} className="group">
              <Card
                className={`h-full transition-all hover:shadow-md hover:-translate-y-0.5 ${
                  tile.featured ? "ring-1 ring-violet-200" : ""
                }`}
              >
                <CardBody className="flex flex-col h-full">
                  <div
                    className={`h-10 w-10 rounded-lg bg-gradient-to-br ${tile.accent} flex items-center justify-center mb-3`}
                  >
                    <tile.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-semibold text-slate-900 mb-1">{tile.title}</p>
                  <p className="text-sm text-slate-500 flex-1">{tile.description}</p>
                  <div className="mt-3 text-sm font-medium text-violet-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Open <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-900">
        <CardBody className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-semibold text-white">Not sure where to start?</p>
            <p className="text-sm text-slate-300 mt-0.5">
              Ask the Smart Assistant: &ldquo;I need content for my business this week.&rdquo;
            </p>
          </div>
          <Link
            href="/assistant"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-900 bg-white hover:bg-slate-100 rounded-lg px-4 py-2 shrink-0"
          >
            Open Assistant <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
