/**
 * A small, hand-curated reference list of well-known, real, legitimate
 * national/major U.S. automotive parts businesses. This is NOT a live vendor
 * search — it exists so "Find Vendors" and "Find Wholesale Vendors" have real
 * starting points to suggest even before the user has added anything to
 * their own Vendor database, without ever inventing a company.
 *
 * Every field here is limited to well-established public facts (what kind of
 * business it is, and that it generally offers a trade/commercial program
 * where that's publicly known). We deliberately do NOT include pricing,
 * specific minimum orders, or specific wholesale terms here — those change
 * and must be verified directly with the vendor. `sourceType` is always
 * "reference_list" so the UI can visually distinguish these from vendors the
 * user has actually researched and verified themselves.
 */
export interface VendorReference {
  name: string;
  vendorType:
    | "wholesale_distributor"
    | "oem_supplier"
    | "aftermarket_supplier"
    | "salvage_recycled"
    | "specialty"
    | "performance"
    | "fleet_supplier"
    | "heavy_duty";
  supplyKind: "oem" | "aftermarket" | "wholesale" | "used" | "specialty" | "mixed";
  website: string;
  description: string;
  commercialProgramKnown: boolean; // publicly known to offer some form of trade/pro/commercial account
  notes: string;
}

export const VENDOR_REFERENCE_LIST: VendorReference[] = [
  {
    name: "RockAuto",
    vendorType: "aftermarket_supplier",
    supplyKind: "aftermarket",
    website: "https://www.rockauto.com",
    description: "Large online aftermarket parts catalog covering most makes/models, ships nationwide.",
    commercialProgramKnown: false,
    notes: "No account required to order; pricing is shown at checkout on their site — verify current pricing there directly.",
  },
  {
    name: "NAPA Auto Parts",
    vendorType: "wholesale_distributor",
    supplyKind: "mixed",
    website: "https://www.napaonline.com",
    description: "National auto parts retail/distribution chain with a large local-store footprint.",
    commercialProgramKnown: true,
    notes: "Local stores commonly offer commercial/trade accounts for shops and fleets — terms vary by store, confirm locally.",
  },
  {
    name: "O'Reilly Auto Parts",
    vendorType: "aftermarket_supplier",
    supplyKind: "aftermarket",
    website: "https://www.oreillyauto.com",
    description: "National retail auto parts chain.",
    commercialProgramKnown: true,
    notes: "Offers a 'Professional Parts People' commercial program for shops — confirm current terms with a local store.",
  },
  {
    name: "AutoZone",
    vendorType: "aftermarket_supplier",
    supplyKind: "aftermarket",
    website: "https://www.autozone.com",
    description: "National retail auto parts chain.",
    commercialProgramKnown: true,
    notes: "Offers 'AutoZone Pro' commercial/trade accounts — confirm current terms with a local store.",
  },
  {
    name: "Advance Auto Parts / Carquest",
    vendorType: "wholesale_distributor",
    supplyKind: "mixed",
    website: "https://www.carquest.com",
    description: "National retail chain (Advance Auto Parts) with Carquest as its trade/wholesale-facing brand.",
    commercialProgramKnown: true,
    notes: "Carquest historically focuses on professional/trade accounts — confirm current program details locally.",
  },
  {
    name: "LKQ Corporation",
    vendorType: "salvage_recycled",
    supplyKind: "used",
    website: "https://www.lkqcorp.com",
    description: "Largest North American provider of recycled/salvage and aftermarket collision & mechanical parts.",
    commercialProgramKnown: true,
    notes: "Serves collision/mechanical repair shops at scale; account setup and pricing are handled through their sales channels.",
  },
  {
    name: "Keystone Automotive Operations (an LKQ company)",
    vendorType: "wholesale_distributor",
    supplyKind: "aftermarket",
    website: "https://www.keystoneautomotive.com",
    description: "Wholesale distributor of aftermarket collision and mechanical parts to the professional trade.",
    commercialProgramKnown: true,
    notes: "Trade-only distributor — a business/trade account is required to purchase.",
  },
  {
    name: "WorldPac",
    vendorType: "wholesale_distributor",
    supplyKind: "aftermarket",
    website: "https://www.worldpac.com",
    description: "Wholesale distributor specializing in import/OEM-quality aftermarket parts for repair shops.",
    commercialProgramKnown: true,
    notes: "Sells to professional repair shops through branch/account relationships.",
  },
  {
    name: "Parts Authority",
    vendorType: "wholesale_distributor",
    supplyKind: "mixed",
    website: "https://www.partsauthority.com",
    description: "Wholesale automotive parts distributor serving the professional trade in many U.S. metro markets.",
    commercialProgramKnown: true,
    notes: "Trade account required — contact a local branch.",
  },
  {
    name: "FCP Euro",
    vendorType: "aftermarket_supplier",
    supplyKind: "aftermarket",
    website: "https://www.fcpeuro.com",
    description: "Online retailer specializing in European-make (VW/Audi/BMW/Mercedes/Volvo) aftermarket parts.",
    commercialProgramKnown: false,
    notes: "Publicly advertises a lifetime replacement guarantee on many parts — verify current terms on their site.",
  },
  {
    name: "1A Auto",
    vendorType: "aftermarket_supplier",
    supplyKind: "aftermarket",
    website: "https://www.1aauto.com",
    description: "Online retailer of aftermarket parts with install-guide videos for many jobs.",
    commercialProgramKnown: false,
    notes: "Direct-to-consumer/shop online ordering; no special account required.",
  },
  {
    name: "PartsGeek",
    vendorType: "aftermarket_supplier",
    supplyKind: "aftermarket",
    website: "https://www.partsgeek.com",
    description: "Online aftermarket parts retailer aggregating multiple brands/warehouses.",
    commercialProgramKnown: false,
    notes: "Direct online ordering; verify shipping source and warranty per item.",
  },
  {
    name: "CarParts.com",
    vendorType: "aftermarket_supplier",
    supplyKind: "aftermarket",
    website: "https://www.carparts.com",
    description: "Online aftermarket parts retailer with its own distribution centers.",
    commercialProgramKnown: false,
    notes: "Direct online ordering; verify shipping timelines and return policy per item.",
  },
  {
    name: "Summit Racing Equipment",
    vendorType: "performance",
    supplyKind: "specialty",
    website: "https://www.summitracing.com",
    description: "Major performance and racing parts retailer/distributor.",
    commercialProgramKnown: true,
    notes: "Offers a wholesale/dealer program for qualifying resellers — apply through their site.",
  },
  {
    name: "JEGS",
    vendorType: "performance",
    supplyKind: "specialty",
    website: "https://www.jegs.com",
    description: "Performance parts retailer/distributor.",
    commercialProgramKnown: true,
    notes: "Offers a dealer/trade program for qualifying businesses — apply through their site.",
  },
  {
    name: "FleetPride",
    vendorType: "heavy_duty",
    supplyKind: "aftermarket",
    website: "https://www.fleetpride.com",
    description: "Largest independent distributor of heavy-duty truck and trailer parts in the U.S.",
    commercialProgramKnown: true,
    notes: "Serves fleets and heavy-duty repair shops through branch locations and commercial accounts.",
  },
  {
    name: "TruckPro",
    vendorType: "heavy_duty",
    supplyKind: "aftermarket",
    website: "https://www.truckpro.com",
    description: "Heavy-duty truck and trailer parts distributor with branch locations across the U.S.",
    commercialProgramKnown: true,
    notes: "Offers commercial accounts for fleets and shops — contact a local branch.",
  },
  {
    name: "Local new-car dealership parts department",
    vendorType: "oem_supplier",
    supplyKind: "oem",
    website: "",
    description: "Franchised dealerships for a given make sell genuine OEM parts and typically offer wholesale/trade pricing to repair shops.",
    commercialProgramKnown: true,
    notes: "Look up the nearest franchised dealership for the vehicle's make and ask their parts department about a wholesale account.",
  },
];
