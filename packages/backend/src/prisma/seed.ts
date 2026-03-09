// Database seed script — inserts baseline test data.
// Uses upsert so it is safe to run multiple times without creating duplicates.
import { PrismaClient, DietaryLabel, AllergenType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ── Categories ───────────────────────────────────────────────────────────
  const asianSauces = await prisma.category.upsert({
    where: { slug: "asian-sauces" },
    update: {},
    create: { name: "Asian Sauces", slug: "asian-sauces" },
  });

  const grainsRice = await prisma.category.upsert({
    where: { slug: "grains-rice" },
    update: {},
    create: { name: "Grains & Rice", slug: "grains-rice" },
  });

  console.log("Categories upserted:", asianSauces.name, grainsRice.name);

  // ── Product 1: Jasmine Rice ───────────────────────────────────────────────
  const jasmineRice = await prisma.product.upsert({
    where: { slug: "jasmine-rice" },
    update: {},
    create: {
      name: "Jasmine Rice",
      slug: "jasmine-rice",
      countryOfOrigin: "Thailand",
      categoryId: grainsRice.id,
      dietaryLabels: {
        create: [
          { label: DietaryLabel.VEGAN },
          { label: DietaryLabel.GLUTEN_FREE },
        ],
      },
    },
  });

  await prisma.productVariant.upsert({
    where: { sku: "RICE-JASMINE-500G" },
    update: {},
    create: {
      productId: jasmineRice.id,
      sku: "RICE-JASMINE-500G",
      label: "500g",
      weightGrams: 500,
      priceEuroCents: 249,
    },
  });

  await prisma.productVariant.upsert({
    where: { sku: "RICE-JASMINE-1KG" },
    update: {},
    create: {
      productId: jasmineRice.id,
      sku: "RICE-JASMINE-1KG",
      label: "1kg",
      weightGrams: 1000,
      priceEuroCents: 429,
    },
  });

  console.log("Product upserted:", jasmineRice.name);

  // ── Product 2: Fish Sauce ─────────────────────────────────────────────────
  const fishSauce = await prisma.product.upsert({
    where: { slug: "fish-sauce" },
    update: {},
    create: {
      name: "Fish Sauce",
      slug: "fish-sauce",
      countryOfOrigin: "Vietnam",
      categoryId: asianSauces.id,
      allergens: {
        create: [{ allergen: AllergenType.FISH }],
      },
    },
  });

  await prisma.productVariant.upsert({
    where: { sku: "SAUCE-FISH-300ML" },
    update: {},
    create: {
      productId: fishSauce.id,
      sku: "SAUCE-FISH-300ML",
      label: "300ml",
      weightGrams: 350,
      priceEuroCents: 349,
    },
  });

  console.log("Product upserted:", fishSauce.name);
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
