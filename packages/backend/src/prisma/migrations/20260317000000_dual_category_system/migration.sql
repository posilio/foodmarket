-- Migration: dual_category_system
-- Adds CategoryType enum, extends Category with hierarchy and type,
-- renames Product.categoryId → originCategoryId, adds typeCategoryId.

-- 1. Create the enum
CREATE TYPE "CategoryType" AS ENUM ('ORIGIN_REGION', 'ORIGIN_COUNTRY', 'PRODUCT_TYPE');

-- 2. Add new columns to Category
ALTER TABLE "Category" ADD COLUMN "emoji"    TEXT;
ALTER TABLE "Category" ADD COLUMN "type"     "CategoryType" NOT NULL DEFAULT 'ORIGIN_COUNTRY';
ALTER TABLE "Category" ADD COLUMN "parentId" TEXT;

-- 3. Drop the old unique index on Category.name (categories are now hierarchical; name uniqueness is not guaranteed across types)
DROP INDEX IF EXISTS "Category_name_key";

-- 4. Add self-referential FK on Category.parentId
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey"
  FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 5. Rename Product.categoryId → originCategoryId
ALTER TABLE "Product" RENAME COLUMN "categoryId" TO "originCategoryId";

-- 6. Drop the old FK and index on the renamed column (Postgres renames the constraint automatically on column rename, but the index is not renamed)
-- Drop old FK (Prisma named it Product_categoryId_fkey)
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_categoryId_fkey";
-- Drop old index
DROP INDEX IF EXISTS "Product_categoryId_idx";

-- 7. Re-add FK with new name
ALTER TABLE "Product" ADD CONSTRAINT "Product_originCategoryId_fkey"
  FOREIGN KEY ("originCategoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 8. Re-add index with new name
CREATE INDEX "Product_originCategoryId_idx" ON "Product"("originCategoryId");

-- 9. Add typeCategoryId column (nullable)
ALTER TABLE "Product" ADD COLUMN "typeCategoryId" TEXT;

-- 10. Add FK for typeCategoryId
ALTER TABLE "Product" ADD CONSTRAINT "Product_typeCategoryId_fkey"
  FOREIGN KEY ("typeCategoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 11. Add index for typeCategoryId
CREATE INDEX "Product_typeCategoryId_idx" ON "Product"("typeCategoryId");
