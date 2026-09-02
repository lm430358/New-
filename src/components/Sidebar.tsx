"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  Users,
  Send,
  FileSearch,
  Package,
  Repeat,
  BookOpen,
  Tag,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads / CRM", icon: Users },
  { href: "/outreach", label: "Outreach Templates", icon: Send },
  { href: "/audit", label: "AI Consultant Report", icon: FileSearch },
  { href: "/offer", label: "The Offer", icon: Tag },
  { href: "/products", label: "Digital Products", icon: Package },
  { href: "/recurring", label: "Recurring Revenue", icon: Repeat },
  { href: "/playbook", label: "Strategy & Playbook", icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-white/10 bg-black/30 p-4">
      <div className="mb-6 px-2">
        <div className="text-sm font-semibold tracking-wide text-white">Unlimited Industries</div>
        <div className="text-xs text-white/40">Revenue Operator</div>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname?.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition",
                active ? "bg-violet-600/20 text-violet-200" : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-2 text-[11px] leading-snug text-white/30">
        Nothing here sends messages, spends money, or contacts anyone automatically. Every outbound
        action requires your review and your click.
      </div>
    </aside>
  );
}
