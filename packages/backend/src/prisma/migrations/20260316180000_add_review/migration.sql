-- CreateTable: Review (one review per customer per product)
CREATE TABLE "Review" (
  "id"         TEXT NOT NULL,
  "productId"  TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "rating"     INTEGER NOT NULL,
  "body"       TEXT,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- FK: Review → Product
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- FK: Review → Customer
ALTER TABLE "Review" ADD CONSTRAINT "Review_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- One review per customer per product
CREATE UNIQUE INDEX "Review_productId_customerId_key" ON "Review"("productId", "customerId");

-- Fast lookup of all reviews for a product
CREATE INDEX "Review_productId_idx" ON "Review"("productId");
