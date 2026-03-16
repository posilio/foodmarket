-- Add brandName to Product
ALTER TABLE "Product" ADD COLUMN "brandName" TEXT;

-- Add volumeMl to ProductVariant
ALTER TABLE "ProductVariant" ADD COLUMN "volumeMl" INTEGER;

-- Make countryOfOrigin nullable
ALTER TABLE "Product" ALTER COLUMN "countryOfOrigin" DROP NOT NULL;

-- Normalise existing countryOfOrigin values to ISO 3166-1 alpha-2 codes
UPDATE "Product" SET "countryOfOrigin" = CASE
  WHEN "countryOfOrigin" ILIKE 'japan%'       THEN 'JP'
  WHEN "countryOfOrigin" ILIKE 'india%'       THEN 'IN'
  WHEN "countryOfOrigin" ILIKE 'netherlands%' THEN 'NL'
  WHEN "countryOfOrigin" ILIKE 'spain%'       THEN 'ES'
  WHEN "countryOfOrigin" ILIKE 'italy%'       THEN 'IT'
  WHEN "countryOfOrigin" ILIKE 'france%'      THEN 'FR'
  WHEN "countryOfOrigin" ILIKE 'portugal%'    THEN 'PT'
  WHEN "countryOfOrigin" ILIKE 'morocc%'      THEN 'MA'
  WHEN "countryOfOrigin" ILIKE 'kenya%'       THEN 'KE'
  WHEN "countryOfOrigin" ILIKE 'niger%'       THEN 'NG'
  WHEN "countryOfOrigin" ILIKE 'mexic%'       THEN 'MX'
  WHEN "countryOfOrigin" ILIKE 'lebanon%'     THEN 'LB'
  WHEN "countryOfOrigin" ILIKE 'thailand%'    THEN 'TH'
  WHEN "countryOfOrigin" ILIKE 'vietnam%'     THEN 'VN'
  WHEN "countryOfOrigin" ILIKE 'china%'       THEN 'CN'
  WHEN "countryOfOrigin" ILIKE 'indonesia%'   THEN 'ID'
  WHEN "countryOfOrigin" ILIKE 'south korea%' THEN 'KR'
  WHEN "countryOfOrigin" ILIKE 'korea%'       THEN 'KR'
  WHEN "countryOfOrigin" ILIKE 'peru%'        THEN 'PE'
  WHEN "countryOfOrigin" ILIKE 'turkey%'      THEN 'TR'
  WHEN "countryOfOrigin" ILIKE 'tunisia%'     THEN 'TN'
  WHEN "countryOfOrigin" ILIKE 'iran%'        THEN 'IR'
  WHEN "countryOfOrigin" ILIKE 'jordan%'      THEN 'JO'
  WHEN "countryOfOrigin" ILIKE 'brazil%'      THEN 'BR'
  WHEN "countryOfOrigin" ILIKE 'argentin%'    THEN 'AR'
  WHEN "countryOfOrigin" ILIKE 'ethiopia%'    THEN 'ET'
  WHEN "countryOfOrigin" ILIKE 'mozambique%'  THEN 'MZ'
  WHEN "countryOfOrigin" ILIKE 'greece%'      THEN 'GR'
  WHEN "countryOfOrigin" ILIKE 'greek%'       THEN 'GR'
  WHEN "countryOfOrigin" ILIKE 'syria%'       THEN 'SY'
  WHEN "countryOfOrigin" ILIKE 'palestin%'    THEN 'PS'
  ELSE "countryOfOrigin"
END;

-- Indexes: Product
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");

-- Indexes: ProductVariant
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");
CREATE INDEX "ProductVariant_stockQuantity_idx" ON "ProductVariant"("stockQuantity");
CREATE INDEX "ProductVariant_isActive_idx" ON "ProductVariant"("isActive");

-- Indexes: Order
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");
CREATE INDEX "Order_stockReservedUntil_idx" ON "Order"("stockReservedUntil");

-- Indexes: Payment
CREATE INDEX "Payment_providerReference_idx" ON "Payment"("providerReference");

-- Indexes: OrderLine
CREATE INDEX "OrderLine_orderId_idx" ON "OrderLine"("orderId");
