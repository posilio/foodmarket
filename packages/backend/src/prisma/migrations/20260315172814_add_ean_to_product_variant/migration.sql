-- AlterTable: add nullable EAN field to ProductVariant
ALTER TABLE "ProductVariant" ADD COLUMN "ean" TEXT;

-- CreateIndex: enforce uniqueness on ean (nulls are not considered duplicates in PostgreSQL)
CREATE UNIQUE INDEX "ProductVariant_ean_key" ON "ProductVariant"("ean");
