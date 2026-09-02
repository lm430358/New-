import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { price: "asc" } });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold text-white">Digital Products Catalog</h1>
      <p className="mt-1 text-sm text-white/50">
        Built once, sold repeatedly. Seeded from <code className="rounded bg-white/10 px-1">prisma/seed.ts</code> —
        edit prices/descriptions here or in the database going forward.
      </p>

      {products.length === 0 ? (
        <Card className="mt-6">
          <p className="text-sm text-white/40">
            No products yet — run <code className="rounded bg-white/10 px-1">npm run seed</code> to load the catalog.
          </p>
        </Card>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {products.map((p) => (
            <Card key={p.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-white">{p.name}</p>
                  {p.tagline && <p className="text-xs text-white/40">{p.tagline}</p>}
                </div>
                <Badge>{p.type === "recurring" ? `$${p.price}/mo` : `$${p.price}`}</Badge>
              </div>
              {p.description && <p className="mt-2 text-sm text-white/60">{p.description}</p>}
              <div className="mt-3">
                <Badge className="capitalize">{p.category}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
