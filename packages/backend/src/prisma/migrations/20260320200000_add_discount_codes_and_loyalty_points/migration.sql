-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('FLAT', 'PERCENTAGE');

-- CreateTable DiscountCode
CREATE TABLE "DiscountCode" (
    "id"          TEXT NOT NULL,
    "code"        TEXT NOT NULL,
    "type"        "DiscountType" NOT NULL,
    "amountCents" INTEGER,
    "percent"     INTEGER,
    "maxUses"     INTEGER,
    "usedCount"   INTEGER NOT NULL DEFAULT 0,
    "expiresAt"   TIMESTAMP(3),
    "isActive"    BOOLEAN NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DiscountCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable LoyaltyPoint
CREATE TABLE "LoyaltyPoint" (
    "id"         TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "points"     INTEGER NOT NULL,
    "reason"     TEXT NOT NULL,
    "expiresAt"  TIMESTAMP(3) NOT NULL,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoyaltyPoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscountCode_code_key" ON "DiscountCode"("code");

-- AddForeignKey LoyaltyPoint → Customer
ALTER TABLE "LoyaltyPoint" ADD CONSTRAINT "LoyaltyPoint_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable Order — add discount/loyalty columns
ALTER TABLE "Order"
    ADD COLUMN "discountCodeId"             TEXT,
    ADD COLUMN "discountEuroCents"          INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "loyaltyPointsRedeemed"      INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "loyaltyPointsDiscountCents" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey Order → DiscountCode
ALTER TABLE "Order" ADD CONSTRAINT "Order_discountCodeId_fkey"
    FOREIGN KEY ("discountCodeId") REFERENCES "DiscountCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
