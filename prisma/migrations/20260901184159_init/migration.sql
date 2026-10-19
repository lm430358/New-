-- CreateTable
CREATE TABLE "BusinessProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessName" TEXT NOT NULL,
    "businessType" TEXT,
    "city" TEXT,
    "state" TEXT,
    "industry" TEXT,
    "isRepairShop" BOOLEAN NOT NULL DEFAULT false,
    "isMobileMechanic" BOOLEAN NOT NULL DEFAULT false,
    "resellsParts" BOOLEAN NOT NULL DEFAULT false,
    "operatesFleet" BOOLEAN NOT NULL DEFAULT false,
    "isDealership" BOOLEAN NOT NULL DEFAULT false,
    "monthlyPartsBudget" REAL,
    "preferredSuppliers" TEXT,
    "preferredBrands" TEXT,
    "conditionPref" TEXT NOT NULL DEFAULT 'either',
    "sourcingPref" TEXT NOT NULL DEFAULT 'either',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "activeBusinessProfileId" TEXT
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "vendorType" TEXT NOT NULL,
    "supplyKind" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "street" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "partsCategories" TEXT,
    "shippingInfo" TEXT,
    "minimumOrder" TEXT,
    "wholesaleRequirements" TEXT,
    "accountRequirements" TEXT,
    "returnPolicy" TEXT,
    "warrantyInfo" TEXT,
    "hoursInfo" TEXT,
    "wholesaleStatus" TEXT NOT NULL DEFAULT 'unverified',
    "localVerified" BOOLEAN NOT NULL DEFAULT false,
    "sourceType" TEXT NOT NULL DEFAULT 'user_added',
    "verificationDate" DATETIME,
    "verificationNotes" TEXT,
    "trustFlags" TEXT,
    "status" TEXT NOT NULL DEFAULT 'researching',
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "internalRating" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PriceCheck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vendorId" TEXT NOT NULL,
    "partDescription" TEXT NOT NULL,
    "partNumber" TEXT,
    "brand" TEXT,
    "condition" TEXT,
    "price" REAL,
    "shippingCost" REAL,
    "totalCost" REAL,
    "availability" TEXT,
    "warranty" TEXT,
    "returnPolicy" TEXT,
    "sourceUrl" TEXT,
    "checkedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PriceCheck_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CrossReference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vendorId" TEXT,
    "originalPartNumber" TEXT NOT NULL,
    "originalIsOem" BOOLEAN NOT NULL DEFAULT true,
    "alternatePartNumber" TEXT NOT NULL,
    "manufacturer" TEXT,
    "compatibilityNotes" TEXT,
    "source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'potential',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CrossReference_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PartSearchLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessProfileId" TEXT,
    "year" TEXT,
    "make" TEXT,
    "model" TEXT,
    "trim" TEXT,
    "engine" TEXT,
    "vin" TEXT,
    "partName" TEXT,
    "partNumber" TEXT,
    "oemPartNumber" TEXT,
    "aftermarketNumber" TEXT,
    "symptoms" TEXT,
    "rawQuery" TEXT,
    "identifiedCategory" TEXT,
    "aiNotes" TEXT,
    "vinDecodeJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PartSearchLog_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessProfileId" TEXT,
    "vendorId" TEXT,
    "poNumber" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "shippingCost" REAL NOT NULL DEFAULT 0,
    "taxRate" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PurchaseOrder_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PurchaseOrder_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PurchaseOrderLineItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "purchaseOrderId" TEXT NOT NULL,
    "partNumber" TEXT,
    "description" TEXT NOT NULL,
    "quantity" REAL NOT NULL DEFAULT 1,
    "unitPrice" REAL NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "PurchaseOrderLineItem_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessProfileId" TEXT,
    "vendorId" TEXT,
    "partNumber" TEXT,
    "description" TEXT NOT NULL,
    "brand" TEXT,
    "quantity" REAL NOT NULL DEFAULT 0,
    "purchaseCost" REAL,
    "sellingPrice" REAL,
    "storageLocation" TEXT,
    "datePurchased" DATETIME,
    "reorderLevel" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InventoryItem_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VendorContactMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vendorId" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VendorContactMessage_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessProfileId" TEXT,
    "title" TEXT NOT NULL DEFAULT 'New conversation',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Conversation_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "toolCalls" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
