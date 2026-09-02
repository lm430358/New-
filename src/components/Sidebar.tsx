"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Building2,
  Scale,
  Warehouse,
  MapPin,
  GitCompareArrows,
  Tag,
  Calculator,
  TrendingUp,
  Boxes,
  ClipboardList,
  Archive,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { section: "Overview", items: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }] },
  {
    section: "Sourcing",
    items: [
      { href: "/parts/search", label: "Part Search & VIN", icon: Search },
      { href: "/sourcing", label: "Smart Sourcing Agent", icon: Sparkles },
      { href: "/cross-reference", label: "Cross-Reference", icon: GitCompareArrows },
    ],
  },
  {
    section: "Vendors",
    items: [
      { href: "/vendors", label: "Vendor Database", icon: Building2 },
      { href: "/vendors/compare", label: "Compare Vendors", icon: Scale },
      { href: "/vendors/wholesale", label: "Wholesale Finder", icon: Warehouse },
      { href: "/vendors/local", label: "Local Finder", icon: MapPin },
    ],
  },
  {
    section: "Pricing & Profit",
    items: [
      { href: "/price-checker", label: "Price Checker", icon: Tag },
      { href: "/profit-calculator", label: "Profit Calculator", icon: Calculator },
      { href: "/resell-opportunities", label: "Resell Opportunities", icon: TrendingUp },
      { href: "/bulk-buying", label: "Bulk Buying", icon: Boxes },
    ],
  },
  {
    section: "Operations",
    items: [
      { href: "/purchase-orders", label: "Purchase Orders", icon: ClipboardList },
      { href: "/inventory", label: "Inventory", icon: Archive },
      { href: "/command-center", label: "AI Command Center", icon: MessageSquare },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] h-screen sticky top-0 overflow-y-auto scrollbar-thin">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <Sparkles size={18} className="text-blue-400" />
          <span>Parts Sourcing Agent</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">AI Car Parts Vendor & Sourcing</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-5">
        {NAV.map((group) => (
          <div key={group.section}>
            <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {group.section}
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
                      "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                      active
                        ? "bg-[var(--sidebar-active)] text-white"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon size={16} className="shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-white/10 text-[11px] text-slate-500">
        Built for real sourcing decisions — vendors, pricing, and compatibility are only shown when
        verifiable.
      </div>
    </aside>
  );
}
