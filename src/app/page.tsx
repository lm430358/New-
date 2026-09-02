import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { getActiveBusinessProfile } from "@/lib/business";
import { formatDate } from "@/lib/utils";
import {
  Search,
  Building2,
  Sparkles,
  ClipboardList,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

export default async function DashboardPage() {
  const profile = await getActiveBusinessProfile();

  const [vendorCount, verifiedWholesaleCount, favoriteCount, inventoryItems, openPOs, recentSearches] = await Promise.all([
    prisma.vendor.count(),
    prisma.vendor.count({ where: { wholesaleStatus: "verified" } }),
    prisma.vendor.count({ where: { favorite: true } }),
    prisma.inventoryItem.findMany(),
    prisma.purchaseOrder.count({ where: { status: { in: ["draft", "sent"] } } }),
    prisma.partSearchLog.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const lowStock = inventoryItems.filter((i) => i.quantity <= i.reorderLevel);

  if (!profile) {
    return (
      <div>
        <TopBar title="Welcome" />
        <div className="p-6 max-w-xl">
          <Card>
            <CardHeader><CardTitle>Set up your business profile to get started</CardTitle></CardHeader>
            <CardBody className="space-y-4">
              <p className="text-sm text-[var(--text-muted)]">
                Every tool in this app — vendor scoring, sourcing recommendations, purchase orders —
                uses your business profile automatically once it&apos;s set up.
              </p>
              <Link href="/business-profile"><Button>Set up business profile</Button></Link>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Saved vendors", value: vendorCount, href: "/vendors" },
    { label: "Wholesale verified", value: verifiedWholesaleCount, href: "/vendors/wholesale" },
    { label: "Favorite vendors", value: favoriteCount, href: "/vendors?favoriteOnly=1" },
    { label: "Open purchase orders", value: openPOs, href: "/purchase-orders" },
  ];

  const quickLinks = [
    { href: "/parts/search", label: "Search for a part", icon: Search, desc: "Identify a part category by vehicle or symptoms" },
    { href: "/sourcing", label: "Run smart sourcing", icon: Sparkles, desc: "Describe what you need, get a ranked plan" },
    { href: "/vendors/new", label: "Add a vendor", icon: Building2, desc: "Track a new supplier you've researched" },
    { href: "/purchase-orders/new", label: "New purchase order", icon: ClipboardList, desc: "Build and export a PO" },
  ];

  return (
    <div>
      <TopBar title={`Welcome back, ${profile.businessName}`} subtitle="Here's what's happening across your sourcing workspace." />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Link key={s.label} href={s.href}>
              <Card className="hover:border-[var(--brand)]">
                <CardBody>
                  <p className="text-2xl font-semibold">{s.value}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{s.label}</p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>

        {lowStock.length > 0 && (
          <Link href="/inventory">
            <div className="flex items-center gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-800 hover:bg-amber-100">
              <AlertTriangle size={16} />
              <span className="font-medium">{lowStock.length} inventory item(s) at or below reorder level</span>
              <ArrowRight size={14} className="ml-auto" />
            </div>
          </Link>
        )}

        <div>
          <h2 className="text-sm font-semibold mb-3">Quick actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {quickLinks.map((q) => (
              <Link key={q.href} href={q.href}>
                <Card className="h-full hover:border-[var(--brand)]">
                  <CardBody className="space-y-2">
                    <q.icon size={18} className="text-[var(--brand)]" />
                    <p className="text-sm font-semibold">{q.label}</p>
                    <p className="text-xs text-[var(--text-muted)]">{q.desc}</p>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle>Recent part searches</CardTitle></CardHeader>
          <CardBody>
            {recentSearches.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">
                No searches yet. <Link href="/parts/search" className="text-[var(--brand)]">Search for a part →</Link>
              </p>
            ) : (
              <div className="space-y-2">
                {recentSearches.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-sm border-b border-[var(--border)] pb-2 last:border-0">
                    <div>
                      <p className="font-medium">{s.identifiedCategory ?? s.partName ?? "Search"}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {[s.year, s.make, s.model].filter(Boolean).join(" ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>{formatDate(s.createdAt)}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>What this app never does</CardTitle></CardHeader>
          <CardBody>
            <ul className="text-sm text-[var(--text-muted)] list-disc pl-5 space-y-1">
              <li>Fabricate vendors, prices, inventory, compatibility, part numbers, or warranties</li>
              <li>Guarantee vehicle fitment, profits, or vendor legitimacy</li>
              <li>Send anything to a vendor without you reviewing it first</li>
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
