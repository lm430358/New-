"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
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
  Library,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/business-profile", label: "Business Profile", icon: Building2 },
    ],
  },
  {
    title: "Create",
    items: [
      { href: "/everything", label: "One Idea → Everything", icon: Sparkles },
      { href: "/social", label: "Social Media Content", icon: Share2 },
      { href: "/video", label: "Video Script Builder", icon: Clapperboard },
      { href: "/calendar", label: "Content Calendar", icon: CalendarDays },
      { href: "/campaign", label: "Marketing Campaign", icon: Megaphone },
      { href: "/business-content", label: "Business Content", icon: Globe },
      { href: "/sales", label: "Sales Content", icon: DollarSign },
      { href: "/lead-magnet", label: "Lead Magnets", icon: BookOpenCheck },
    ],
  },
  {
    title: "Improve & Reuse",
    items: [
      { href: "/repurpose", label: "Repurpose Content", icon: Recycle },
      { href: "/improve", label: "Content Improver", icon: Wand2 },
      { href: "/ideas", label: "Content Ideas", icon: Lightbulb },
    ],
  },
  {
    title: "Manage",
    items: [
      { href: "/library", label: "Content Library", icon: Library },
      { href: "/assistant", label: "Smart Assistant", icon: MessageCircle },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white h-screen sticky top-0 overflow-y-auto hidden md:flex md:flex-col">
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center">
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 leading-tight">Content Builder</p>
            <p className="text-[11px] text-slate-400 leading-tight">AI Content Department</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-6">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="px-2.5 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors",
                      active
                        ? "bg-violet-50 text-violet-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
