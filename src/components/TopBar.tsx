"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, ChevronRight, Menu } from "lucide-react";

interface ProfileSummary {
  businessName: string;
  industry: string;
}

const ROUTE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/business-profile": "Business Profile",
  "/everything": "One Idea → Everything",
  "/social": "Social Media Content",
  "/video": "Video Script Builder",
  "/calendar": "Content Calendar",
  "/campaign": "Marketing Campaign",
  "/business-content": "Business Content",
  "/sales": "Sales Content",
  "/lead-magnet": "Lead Magnets",
  "/repurpose": "Repurpose Content",
  "/improve": "Content Improver",
  "/ideas": "Content Ideas",
  "/library": "Content Library",
  "/assistant": "Smart Assistant",
};

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/business-profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active) {
          setProfile(data?.profile ?? null);
          setLoaded(true);
        }
      })
      .catch(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, [pathname]);

  const title = ROUTE_TITLES[pathname] ?? "Content Builder";

  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <select
          aria-label="Navigate"
          className="md:hidden text-sm border border-slate-300 rounded-lg px-2 py-1.5"
          value={pathname}
          onChange={(e) => router.push(e.target.value)}
        >
          {Object.entries(ROUTE_TITLES).map(([href, label]) => (
            <option key={href} value={href}>
              {label}
            </option>
          ))}
        </select>
        <Menu className="h-4 w-4 text-slate-300 md:hidden" />
        <h1 className="text-lg font-semibold text-slate-900 truncate">{title}</h1>
      </div>

      <Link
        href="/business-profile"
        className="flex items-center gap-2 shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
      >
        <Building2 className="h-3.5 w-3.5" />
        {!loaded ? (
          <span className="text-slate-400">Loading…</span>
        ) : profile ? (
          <span className="max-w-[160px] truncate">{profile.businessName}</span>
        ) : (
          <span className="text-violet-600">Set up your business profile</span>
        )}
        <ChevronRight className="h-3 w-3 text-slate-400" />
      </Link>
    </header>
  );
}
