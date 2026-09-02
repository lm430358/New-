import { PrismaClient } from "@prisma/client";
import { DIGITAL_PRODUCTS } from "../src/lib/content/products";

const prisma = new PrismaClient();

async function main() {
  for (const p of DIGITAL_PRODUCTS) {
    await prisma.product.upsert({
      where: { id: p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
      update: {},
      create: {
        id: p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: p.name,
        tagline: p.tagline,
        description: p.description,
        price: p.price,
        type: p.type,
        category: p.category,
      },
    });
  }

  // One clearly-marked sample lead so the CRM isn't empty on first run. This
  // is NOT real research — replace/delete it before doing real outreach.
  const existing = await prisma.lead.findFirst({ where: { businessName: { contains: "(sample)" } } });
  if (!existing) {
    await prisma.lead.create({
      data: {
        businessName: "Example Mobile Detailing (sample)",
        ownerName: "Sample Owner",
        industry: "Mobile Detailing",
        city: "Example City",
        stage: "new",
        leadSource: "Demo data — replace with real research",
        researchNotes:
          "This is placeholder demo data to show how the CRM works. Delete this lead and add real " +
          "leads with genuine research notes before running the AI scoring or outreach tools.",
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
