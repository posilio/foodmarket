// Database seed script — inserts baseline test data.
// Uses upsert so it is safe to run multiple times without creating duplicates.
import { PrismaClient, DietaryLabel, AllergenType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ── Categories ───────────────────────────────────────────────────────────
  const asianSauces = await prisma.category.upsert({
    where: { slug: "asian-sauces" },
    update: { name: "Asian Sauces" },
    create: { name: "Asian Sauces", slug: "asian-sauces" },
  });

  const grainsRice = await prisma.category.upsert({
    where: { slug: "grains-rice" },
    update: { name: "Grains & Rice" },
    create: { name: "Grains & Rice", slug: "grains-rice" },
  });

  const middleEastern = await prisma.category.upsert({
    where: { slug: "middle-eastern" },
    update: { name: "Middle Eastern" },
    create: { name: "Middle Eastern", slug: "middle-eastern" },
  });

  const latinAmerican = await prisma.category.upsert({
    where: { slug: "latin-american" },
    update: { name: "Latin American" },
    create: { name: "Latin American", slug: "latin-american" },
  });

  const african = await prisma.category.upsert({
    where: { slug: "african" },
    update: { name: "African" },
    create: { name: "African", slug: "african" },
  });

  const europeanSpecialty = await prisma.category.upsert({
    where: { slug: "european-specialty" },
    update: { name: "European Specialty" },
    create: { name: "European Specialty", slug: "european-specialty" },
  });

  const japanese = await prisma.category.upsert({
    where: { slug: "japanese" },
    update: { name: "Japanese" },
    create: { name: "Japanese", slug: "japanese" },
  });

  const indianSpices = await prisma.category.upsert({
    where: { slug: "indian-spices" },
    update: { name: "Indian Spices" },
    create: { name: "Indian Spices", slug: "indian-spices" },
  });

  console.log("Categories upserted: 8 total");

  // ── Helper to safely upsert dietary labels ────────────────────────────────
  async function upsertDietaryLabel(productId: string, label: DietaryLabel) {
    await prisma.productDietaryLabel.upsert({
      where: { productId_label: { productId, label } },
      update: {},
      create: { productId, label },
    });
  }

  async function upsertAllergen(productId: string, allergen: AllergenType) {
    await prisma.productAllergen.upsert({
      where: { productId_allergen: { productId, allergen } },
      update: {},
      create: { productId, allergen },
    });
  }

  // ── ASIAN SAUCES ─────────────────────────────────────────────────────────

  // Jasmine Rice
  const jasmineRice = await prisma.product.upsert({
    where: { slug: "jasmine-rice" },
    update: {
      brandName: "Golden Phoenix",
      countryOfOrigin: "TH",
      imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop",
      categoryId: grainsRice.id,
    },
    create: {
      name: "Jasmine Rice",
      slug: "jasmine-rice",
      brandName: "Golden Phoenix",
      description: "Fragrant Thai jasmine rice with a delicate floral aroma and slightly sticky texture when cooked.",
      countryOfOrigin: "TH",
      imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop",
      categoryId: grainsRice.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(jasmineRice.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(jasmineRice.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "RICE-JASMINE-500G" },
    update: { stockQuantity: 120 },
    create: { productId: jasmineRice.id, sku: "RICE-JASMINE-500G", label: "500g", weightGrams: 500, priceEuroCents: 249, stockQuantity: 120 },
  });
  await prisma.productVariant.upsert({
    where: { sku: "RICE-JASMINE-1KG" },
    update: { stockQuantity: 80 },
    create: { productId: jasmineRice.id, sku: "RICE-JASMINE-1KG", label: "1kg", weightGrams: 1000, priceEuroCents: 429, stockQuantity: 80 },
  });
  console.log("Upserted: Jasmine Rice");

  // Fish Sauce
  const fishSauce = await prisma.product.upsert({
    where: { slug: "fish-sauce" },
    update: {
      brandName: "Tiparos",
      countryOfOrigin: "VN",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
      description: "Authentic Vietnamese fish sauce fermented from anchovies and sea salt. Essential for South-East Asian cooking.",
    },
    create: {
      name: "Fish Sauce",
      slug: "fish-sauce",
      brandName: "Tiparos",
      description: "Authentic Vietnamese fish sauce fermented from anchovies and sea salt. Essential for South-East Asian cooking.",
      countryOfOrigin: "VN",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
      categoryId: asianSauces.id,
      isActive: true,
    },
  });
  await upsertAllergen(fishSauce.id, AllergenType.FISH);
  await prisma.productVariant.upsert({
    where: { sku: "SAUCE-FISH-300ML" },
    update: { stockQuantity: 90, volumeMl: 300 },
    create: { productId: fishSauce.id, sku: "SAUCE-FISH-300ML", label: "300ml", weightGrams: 350, volumeMl: 300, priceEuroCents: 349, stockQuantity: 90 },
  });
  await prisma.productVariant.upsert({
    where: { sku: "SAUCE-FISH-700ML" },
    update: { stockQuantity: 60, volumeMl: 700 },
    create: { productId: fishSauce.id, sku: "SAUCE-FISH-700ML", label: "700ml", weightGrams: 800, volumeMl: 700, priceEuroCents: 599, stockQuantity: 60 },
  });
  console.log("Upserted: Fish Sauce");

  // Oyster Sauce
  const oysterSauce = await prisma.product.upsert({
    where: { slug: "oyster-sauce" },
    update: {
      brandName: "Lee Kum Kee",
      countryOfOrigin: "CN",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Oyster Sauce",
      slug: "oyster-sauce",
      brandName: "Lee Kum Kee",
      description: "Rich, thick Chinese oyster sauce made from caramelised oyster extracts. Adds depth and umami to stir-fries.",
      countryOfOrigin: "CN",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
      categoryId: asianSauces.id,
      isActive: true,
    },
  });
  await upsertAllergen(oysterSauce.id, AllergenType.MOLLUSCS);
  await prisma.productVariant.upsert({
    where: { sku: "SAUCE-OYSTER-255G" },
    update: { stockQuantity: 75 },
    create: { productId: oysterSauce.id, sku: "SAUCE-OYSTER-255G", label: "255g", weightGrams: 255, priceEuroCents: 279, stockQuantity: 75 },
  });
  await prisma.productVariant.upsert({
    where: { sku: "SAUCE-OYSTER-510G" },
    update: { stockQuantity: 50 },
    create: { productId: oysterSauce.id, sku: "SAUCE-OYSTER-510G", label: "510g", weightGrams: 510, priceEuroCents: 479, stockQuantity: 50 },
  });
  console.log("Upserted: Oyster Sauce");

  // Hoisin Sauce
  const hoisinSauce = await prisma.product.upsert({
    where: { slug: "hoisin-sauce" },
    update: {
      brandName: "Lee Kum Kee",
      countryOfOrigin: "CN",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Hoisin Sauce",
      slug: "hoisin-sauce",
      brandName: "Lee Kum Kee",
      description: "Sweet and savoury Chinese hoisin sauce made from soybeans, garlic and spices. Perfect for Peking duck and dipping.",
      countryOfOrigin: "CN",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
      categoryId: asianSauces.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(hoisinSauce.id, DietaryLabel.VEGAN);
  await upsertAllergen(hoisinSauce.id, AllergenType.SOYBEANS);
  await prisma.productVariant.upsert({
    where: { sku: "SAUCE-HOISIN-220G" },
    update: { stockQuantity: 85 },
    create: { productId: hoisinSauce.id, sku: "SAUCE-HOISIN-220G", label: "220g", weightGrams: 220, priceEuroCents: 259, stockQuantity: 85 },
  });
  console.log("Upserted: Hoisin Sauce");

  // Sambal Oelek
  const sambalOelek = await prisma.product.upsert({
    where: { slug: "sambal-oelek" },
    update: {
      brandName: "Conimex",
      countryOfOrigin: "ID",
      imageUrl: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Sambal Oelek",
      slug: "sambal-oelek",
      brandName: "Conimex",
      description: "Traditional Indonesian chilli paste made from ground fresh red chillies and salt. Fiery and versatile.",
      countryOfOrigin: "ID",
      imageUrl: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&auto=format&fit=crop",
      categoryId: asianSauces.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(sambalOelek.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(sambalOelek.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "SAUCE-SAMBAL-185G" },
    update: { stockQuantity: 100 },
    create: { productId: sambalOelek.id, sku: "SAUCE-SAMBAL-185G", label: "185g", weightGrams: 185, priceEuroCents: 229, stockQuantity: 100 },
  });
  await prisma.productVariant.upsert({
    where: { sku: "SAUCE-SAMBAL-400G" },
    update: { stockQuantity: 65 },
    create: { productId: sambalOelek.id, sku: "SAUCE-SAMBAL-400G", label: "400g", weightGrams: 400, priceEuroCents: 399, stockQuantity: 65 },
  });
  console.log("Upserted: Sambal Oelek");

  // Gochujang
  const gochujang = await prisma.product.upsert({
    where: { slug: "gochujang" },
    update: {
      brandName: "Haechandle",
      countryOfOrigin: "KR",
      imageUrl: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Gochujang",
      slug: "gochujang",
      brandName: "Haechandle",
      description: "Korean fermented red chilli paste with a deep, complex heat. The cornerstone of Korean cuisine.",
      countryOfOrigin: "KR",
      imageUrl: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&auto=format&fit=crop",
      categoryId: asianSauces.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(gochujang.id, DietaryLabel.VEGAN);
  await upsertAllergen(gochujang.id, AllergenType.SOYBEANS);
  await upsertAllergen(gochujang.id, AllergenType.GLUTEN);
  await prisma.productVariant.upsert({
    where: { sku: "SAUCE-GOCHUJANG-200G" },
    update: { stockQuantity: 90 },
    create: { productId: gochujang.id, sku: "SAUCE-GOCHUJANG-200G", label: "200g", weightGrams: 200, priceEuroCents: 349, stockQuantity: 90 },
  });
  await prisma.productVariant.upsert({
    where: { sku: "SAUCE-GOCHUJANG-500G" },
    update: { stockQuantity: 45 },
    create: { productId: gochujang.id, sku: "SAUCE-GOCHUJANG-500G", label: "500g", weightGrams: 500, priceEuroCents: 649, stockQuantity: 45 },
  });
  console.log("Upserted: Gochujang");

  // NEW: Soy Sauce
  const soySauce = await prisma.product.upsert({
    where: { slug: "soy-sauce" },
    update: { brandName: "Kikkoman", countryOfOrigin: "JP" },
    create: {
      name: "Soy Sauce",
      slug: "soy-sauce",
      brandName: "Kikkoman",
      description: "Classic Japanese naturally brewed soy sauce, fermented for months from whole soybeans and wheat. The essential Asian seasoning.",
      countryOfOrigin: "JP",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
      categoryId: asianSauces.id,
      isActive: true,
    },
  });
  await upsertAllergen(soySauce.id, AllergenType.SOYBEANS);
  await upsertAllergen(soySauce.id, AllergenType.GLUTEN);
  await prisma.productVariant.upsert({
    where: { sku: "SOYSAUCE-150ML" },
    update: { stockQuantity: 150, volumeMl: 150 },
    create: { productId: soySauce.id, sku: "SOYSAUCE-150ML", label: "150ml", weightGrams: 190, volumeMl: 150, priceEuroCents: 299, stockQuantity: 150 },
  });
  await prisma.productVariant.upsert({
    where: { sku: "SOYSAUCE-500ML" },
    update: { stockQuantity: 90, volumeMl: 500 },
    create: { productId: soySauce.id, sku: "SOYSAUCE-500ML", label: "500ml", weightGrams: 590, volumeMl: 500, priceEuroCents: 699, stockQuantity: 90 },
  });
  console.log("Upserted: Soy Sauce");

  // NEW: Sesame Oil
  const sesameOil = await prisma.product.upsert({
    where: { slug: "sesame-oil" },
    update: { brandName: "Kadoya", countryOfOrigin: "JP" },
    create: {
      name: "Sesame Oil",
      slug: "sesame-oil",
      brandName: "Kadoya",
      description: "Pure Japanese toasted sesame oil with a rich, nutty aroma. A few drops finish stir-fries, noodles and dipping sauces.",
      countryOfOrigin: "JP",
      imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop",
      categoryId: asianSauces.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(sesameOil.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(sesameOil.id, DietaryLabel.GLUTEN_FREE);
  await upsertAllergen(sesameOil.id, AllergenType.SESAME);
  await prisma.productVariant.upsert({
    where: { sku: "SESAMEOIL-100ML" },
    update: { stockQuantity: 80, volumeMl: 100 },
    create: { productId: sesameOil.id, sku: "SESAMEOIL-100ML", label: "100ml", weightGrams: 120, volumeMl: 100, priceEuroCents: 399, stockQuantity: 80 },
  });
  await prisma.productVariant.upsert({
    where: { sku: "SESAMEOIL-250ML" },
    update: { stockQuantity: 50, volumeMl: 250 },
    create: { productId: sesameOil.id, sku: "SESAMEOIL-250ML", label: "250ml", weightGrams: 290, volumeMl: 250, priceEuroCents: 799, stockQuantity: 50 },
  });
  console.log("Upserted: Sesame Oil");

  // NEW: Coconut Milk
  const coconutMilk = await prisma.product.upsert({
    where: { slug: "coconut-milk" },
    update: { brandName: "Chaokoh", countryOfOrigin: "TH" },
    create: {
      name: "Coconut Milk",
      slug: "coconut-milk",
      brandName: "Chaokoh",
      description: "Full-fat Thai coconut milk made from freshly pressed coconut cream. Creamy base for curries, soups and desserts.",
      countryOfOrigin: "TH",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
      categoryId: asianSauces.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(coconutMilk.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(coconutMilk.id, DietaryLabel.GLUTEN_FREE);
  await upsertDietaryLabel(coconutMilk.id, DietaryLabel.DAIRY_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "COCONUTMILK-400ML" },
    update: { stockQuantity: 120, volumeMl: 400 },
    create: { productId: coconutMilk.id, sku: "COCONUTMILK-400ML", label: "400ml", weightGrams: 440, volumeMl: 400, priceEuroCents: 189, stockQuantity: 120 },
  });
  console.log("Upserted: Coconut Milk");

  // ── GRAINS & RICE ─────────────────────────────────────────────────────────

  // Basmati Rice
  const basmatiRice = await prisma.product.upsert({
    where: { slug: "basmati-rice" },
    update: {
      brandName: "Tilda",
      countryOfOrigin: "IN",
      imageUrl: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Basmati Rice",
      slug: "basmati-rice",
      brandName: "Tilda",
      description: "Long-grain aged Indian basmati rice with a distinctive nutty aroma. Ideal for biryanis and pilafs.",
      countryOfOrigin: "IN",
      imageUrl: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&auto=format&fit=crop",
      categoryId: grainsRice.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(basmatiRice.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(basmatiRice.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "RICE-BASMATI-1KG" },
    update: { stockQuantity: 150 },
    create: { productId: basmatiRice.id, sku: "RICE-BASMATI-1KG", label: "1kg", weightGrams: 1000, priceEuroCents: 349, stockQuantity: 150 },
  });
  await prisma.productVariant.upsert({
    where: { sku: "RICE-BASMATI-2KG" },
    update: { stockQuantity: 80 },
    create: { productId: basmatiRice.id, sku: "RICE-BASMATI-2KG", label: "2kg", weightGrams: 2000, priceEuroCents: 599, stockQuantity: 80 },
  });
  console.log("Upserted: Basmati Rice");

  // Black Rice
  const blackRice = await prisma.product.upsert({
    where: { slug: "black-rice" },
    update: {
      brandName: "Royal Thai",
      countryOfOrigin: "TH",
      imageUrl: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Black Rice",
      slug: "black-rice",
      brandName: "Royal Thai",
      description: "Nutty Thai black rice rich in antioxidants. Also called forbidden rice — striking colour and earthy flavour.",
      countryOfOrigin: "TH",
      imageUrl: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&auto=format&fit=crop",
      categoryId: grainsRice.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(blackRice.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(blackRice.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "RICE-BLACK-500G" },
    update: { stockQuantity: 60 },
    create: { productId: blackRice.id, sku: "RICE-BLACK-500G", label: "500g", weightGrams: 500, priceEuroCents: 449, stockQuantity: 60 },
  });
  console.log("Upserted: Black Rice");

  // Quinoa
  const quinoa = await prisma.product.upsert({
    where: { slug: "quinoa" },
    update: {
      brandName: "Andean Gold",
      countryOfOrigin: "PE",
      imageUrl: "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Quinoa",
      slug: "quinoa",
      brandName: "Andean Gold",
      description: "Andean white quinoa — a complete protein grain packed with all nine essential amino acids.",
      countryOfOrigin: "PE",
      imageUrl: "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=800&auto=format&fit=crop",
      categoryId: grainsRice.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(quinoa.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(quinoa.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "GRAIN-QUINOA-500G" },
    update: { stockQuantity: 90 },
    create: { productId: quinoa.id, sku: "GRAIN-QUINOA-500G", label: "500g", weightGrams: 500, priceEuroCents: 499, stockQuantity: 90 },
  });
  await prisma.productVariant.upsert({
    where: { sku: "GRAIN-QUINOA-1KG" },
    update: { stockQuantity: 50 },
    create: { productId: quinoa.id, sku: "GRAIN-QUINOA-1KG", label: "1kg", weightGrams: 1000, priceEuroCents: 899, stockQuantity: 50 },
  });
  console.log("Upserted: Quinoa");

  // Red Lentils
  const redLentils = await prisma.product.upsert({
    where: { slug: "red-lentils" },
    update: {
      brandName: "Sera",
      countryOfOrigin: "TR",
      imageUrl: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Red Lentils",
      slug: "red-lentils",
      brandName: "Sera",
      description: "Split Turkish red lentils — quick-cooking and perfect for soups, dahls and stews.",
      countryOfOrigin: "TR",
      imageUrl: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&auto=format&fit=crop",
      categoryId: grainsRice.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(redLentils.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(redLentils.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "GRAIN-LENTILS-500G" },
    update: { stockQuantity: 120 },
    create: { productId: redLentils.id, sku: "GRAIN-LENTILS-500G", label: "500g", weightGrams: 500, priceEuroCents: 199, stockQuantity: 120 },
  });
  await prisma.productVariant.upsert({
    where: { sku: "GRAIN-LENTILS-1KG" },
    update: { stockQuantity: 70 },
    create: { productId: redLentils.id, sku: "GRAIN-LENTILS-1KG", label: "1kg", weightGrams: 1000, priceEuroCents: 349, stockQuantity: 70 },
  });
  console.log("Upserted: Red Lentils");

  // ── MIDDLE EASTERN ────────────────────────────────────────────────────────

  // Tahini
  const tahini = await prisma.product.upsert({
    where: { slug: "tahini" },
    update: {
      brandName: "Al Kanater",
      countryOfOrigin: "LB",
      imageUrl: "https://images.unsplash.com/photo-1612257998531-959d1a5f3f14?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Tahini",
      slug: "tahini",
      brandName: "Al Kanater",
      description: "Smooth Lebanese sesame paste, stone-ground from hulled sesame seeds. Essential for hummus and halva.",
      countryOfOrigin: "LB",
      imageUrl: "https://images.unsplash.com/photo-1612257998531-959d1a5f3f14?w=800&auto=format&fit=crop",
      categoryId: middleEastern.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(tahini.id, DietaryLabel.VEGAN);
  await upsertAllergen(tahini.id, AllergenType.SESAME);
  await prisma.productVariant.upsert({
    where: { sku: "TAH-300G" },
    update: { stockQuantity: 80 },
    create: { productId: tahini.id, sku: "TAH-300G", label: "300g", weightGrams: 300, priceEuroCents: 399, stockQuantity: 80 },
  });
  await prisma.productVariant.upsert({
    where: { sku: "TAH-600G" },
    update: { stockQuantity: 50 },
    create: { productId: tahini.id, sku: "TAH-600G", label: "600g", weightGrams: 600, priceEuroCents: 699, stockQuantity: 50 },
  });
  console.log("Upserted: Tahini");

  // Harissa Paste
  const harissa = await prisma.product.upsert({
    where: { slug: "harissa-paste" },
    update: {
      brandName: "Mina",
      countryOfOrigin: "TN",
      imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Harissa Paste",
      slug: "harissa-paste",
      brandName: "Mina",
      description: "Fiery Tunisian red chilli paste with caraway, coriander and garlic. The North African condiment of choice.",
      countryOfOrigin: "TN",
      imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&auto=format&fit=crop",
      categoryId: middleEastern.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(harissa.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(harissa.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "HARISSA-140G" },
    update: { stockQuantity: 70 },
    create: { productId: harissa.id, sku: "HARISSA-140G", label: "140g", weightGrams: 140, priceEuroCents: 329, stockQuantity: 70 },
  });
  console.log("Upserted: Harissa Paste");

  // Pomegranate Molasses
  const pomMolasses = await prisma.product.upsert({
    where: { slug: "pomegranate-molasses" },
    update: {
      brandName: "Cortas",
      countryOfOrigin: "LB",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Pomegranate Molasses",
      slug: "pomegranate-molasses",
      brandName: "Cortas",
      description: "Lebanese thick reduction of pomegranate juice — sweet-sour and intensely fruity. Used in salad dressings, marinades and stews.",
      countryOfOrigin: "LB",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
      categoryId: middleEastern.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(pomMolasses.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(pomMolasses.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "POMM-300ML" },
    update: { stockQuantity: 45, volumeMl: 300 },
    create: { productId: pomMolasses.id, sku: "POMM-300ML", label: "300ml", weightGrams: 380, volumeMl: 300, priceEuroCents: 449, stockQuantity: 45 },
  });
  console.log("Upserted: Pomegranate Molasses");

  // Za'atar Spice Mix
  const zaatar = await prisma.product.upsert({
    where: { slug: "zaatar-spice-mix" },
    update: {
      brandName: "Ziyad",
      countryOfOrigin: "JO",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Za'atar Spice Mix",
      slug: "zaatar-spice-mix",
      brandName: "Ziyad",
      description: "Jordanian blend of dried thyme, sumac, sesame seeds and salt. Sprinkle over flatbreads with olive oil.",
      countryOfOrigin: "JO",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      categoryId: middleEastern.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(zaatar.id, DietaryLabel.VEGAN);
  await upsertAllergen(zaatar.id, AllergenType.SESAME);
  await prisma.productVariant.upsert({
    where: { sku: "ZAATAR-100G" },
    update: { stockQuantity: 60 },
    create: { productId: zaatar.id, sku: "ZAATAR-100G", label: "100g", weightGrams: 100, priceEuroCents: 349, stockQuantity: 60 },
  });
  console.log("Upserted: Za'atar Spice Mix");

  // Bulgur Wheat
  const bulgur = await prisma.product.upsert({
    where: { slug: "bulgur-wheat" },
    update: {
      brandName: "Duru",
      countryOfOrigin: "TR",
      imageUrl: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Bulgur Wheat",
      slug: "bulgur-wheat",
      brandName: "Duru",
      description: "Pre-cooked cracked Turkish wheat — the base of tabbouleh and kibbeh. Cooks in minutes.",
      countryOfOrigin: "TR",
      imageUrl: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&auto=format&fit=crop",
      categoryId: middleEastern.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(bulgur.id, DietaryLabel.VEGAN);
  await upsertAllergen(bulgur.id, AllergenType.GLUTEN);
  await prisma.productVariant.upsert({
    where: { sku: "BULGUR-500G" },
    update: { stockQuantity: 80 },
    create: { productId: bulgur.id, sku: "BULGUR-500G", label: "500g", weightGrams: 500, priceEuroCents: 249, stockQuantity: 80 },
  });
  console.log("Upserted: Bulgur Wheat");

  // NEW: Sumac
  const sumac = await prisma.product.upsert({
    where: { slug: "sumac" },
    update: { brandName: "Ziyad", countryOfOrigin: "TR" },
    create: {
      name: "Sumac",
      slug: "sumac",
      brandName: "Ziyad",
      description: "Tart, ruby-red ground sumac berries from Turkey. Adds a lemony tang to salads, kebabs and labneh.",
      countryOfOrigin: "TR",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      categoryId: middleEastern.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(sumac.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(sumac.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "SUMAC-100G" },
    update: { stockQuantity: 70 },
    create: { productId: sumac.id, sku: "SUMAC-100G", label: "100g", weightGrams: 100, priceEuroCents: 299, stockQuantity: 70 },
  });
  console.log("Upserted: Sumac");

  // NEW: Rose Water
  const roseWater = await prisma.product.upsert({
    where: { slug: "rose-water" },
    update: { brandName: "Cortas", countryOfOrigin: "LB" },
    create: {
      name: "Rose Water",
      slug: "rose-water",
      brandName: "Cortas",
      description: "Delicately perfumed Lebanese rose water distilled from Damascene rose petals. Essential for baklava, rice pudding and Turkish delight.",
      countryOfOrigin: "LB",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
      categoryId: middleEastern.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(roseWater.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(roseWater.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "ROSEWATER-250ML" },
    update: { stockQuantity: 55, volumeMl: 250 },
    create: { productId: roseWater.id, sku: "ROSEWATER-250ML", label: "250ml", weightGrams: 280, volumeMl: 250, priceEuroCents: 349, stockQuantity: 55 },
  });
  console.log("Upserted: Rose Water");

  // NEW: Freekeh
  const freekeh = await prisma.product.upsert({
    where: { slug: "freekeh" },
    update: { brandName: "Canaan Fair Trade", countryOfOrigin: "PS" },
    create: {
      name: "Freekeh",
      slug: "freekeh",
      brandName: "Canaan Fair Trade",
      description: "Young green wheat harvested and fire-roasted. Nutty, slightly smoky grain used in Palestinian pilafs and soups.",
      countryOfOrigin: "PS",
      imageUrl: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&auto=format&fit=crop",
      categoryId: middleEastern.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(freekeh.id, DietaryLabel.VEGAN);
  await upsertAllergen(freekeh.id, AllergenType.GLUTEN);
  await prisma.productVariant.upsert({
    where: { sku: "FREEKEH-500G" },
    update: { stockQuantity: 40 },
    create: { productId: freekeh.id, sku: "FREEKEH-500G", label: "500g", weightGrams: 500, priceEuroCents: 449, stockQuantity: 40 },
  });
  console.log("Upserted: Freekeh");

  // ── LATIN AMERICAN ────────────────────────────────────────────────────────

  // Chipotle in Adobo
  const chipotle = await prisma.product.upsert({
    where: { slug: "chipotle-in-adobo" },
    update: {
      brandName: "La Morena",
      countryOfOrigin: "MX",
      imageUrl: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Chipotle in Adobo",
      slug: "chipotle-in-adobo",
      brandName: "La Morena",
      description: "Smoky Mexican chipotle chillies canned in a tangy adobo sauce. Adds deep smokiness to any dish.",
      countryOfOrigin: "MX",
      imageUrl: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&auto=format&fit=crop",
      categoryId: latinAmerican.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(chipotle.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(chipotle.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "CHIPOTLE-200G" },
    update: { stockQuantity: 65 },
    create: { productId: chipotle.id, sku: "CHIPOTLE-200G", label: "200g", weightGrams: 200, priceEuroCents: 299, stockQuantity: 65 },
  });
  console.log("Upserted: Chipotle in Adobo");

  // Mole Paste
  const molePaste = await prisma.product.upsert({
    where: { slug: "mole-paste" },
    update: {
      brandName: "Doña Maria",
      countryOfOrigin: "MX",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Mole Paste",
      slug: "mole-paste",
      brandName: "Doña Maria",
      description: "Traditional Mexican mole paste with dried chillies, chocolate, spices and nuts. The complex sauce of Oaxaca.",
      countryOfOrigin: "MX",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
      categoryId: latinAmerican.id,
      isActive: true,
    },
  });
  await upsertAllergen(molePaste.id, AllergenType.NUTS);
  await upsertAllergen(molePaste.id, AllergenType.SESAME);
  await prisma.productVariant.upsert({
    where: { sku: "MOLE-235G" },
    update: { stockQuantity: 35 },
    create: { productId: molePaste.id, sku: "MOLE-235G", label: "235g", weightGrams: 235, priceEuroCents: 549, stockQuantity: 35 },
  });
  console.log("Upserted: Mole Paste");

  // Aji Amarillo Paste
  const ajiAmarillo = await prisma.product.upsert({
    where: { slug: "aji-amarillo-paste" },
    update: {
      brandName: "Inca's Food",
      countryOfOrigin: "PE",
      imageUrl: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Aji Amarillo Paste",
      slug: "aji-amarillo-paste",
      brandName: "Inca's Food",
      description: "Bright yellow Peruvian chilli paste with fruity heat. The defining flavour of Peruvian cuisine.",
      countryOfOrigin: "PE",
      imageUrl: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&auto=format&fit=crop",
      categoryId: latinAmerican.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(ajiAmarillo.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(ajiAmarillo.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "AJI-212G" },
    update: { stockQuantity: 40 },
    create: { productId: ajiAmarillo.id, sku: "AJI-212G", label: "212g", weightGrams: 212, priceEuroCents: 399, stockQuantity: 40 },
  });
  console.log("Upserted: Aji Amarillo Paste");

  // Black Bean Paste
  const blackBeanPaste = await prisma.product.upsert({
    where: { slug: "black-bean-paste" },
    update: {
      brandName: "Casa Fiesta",
      countryOfOrigin: "BR",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Black Bean Paste",
      slug: "black-bean-paste",
      brandName: "Casa Fiesta",
      description: "Brazilian creamy black bean paste seasoned with cumin and garlic. Ready to use in feijoada or as a dip.",
      countryOfOrigin: "BR",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
      categoryId: latinAmerican.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(blackBeanPaste.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(blackBeanPaste.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "BLACKBEAN-400G" },
    update: { stockQuantity: 55 },
    create: { productId: blackBeanPaste.id, sku: "BLACKBEAN-400G", label: "400g", weightGrams: 400, priceEuroCents: 299, stockQuantity: 55 },
  });
  console.log("Upserted: Black Bean Paste");

  // Yerba Mate
  const yerbaMate = await prisma.product.upsert({
    where: { slug: "yerba-mate" },
    update: {
      brandName: "Cruz de Malta",
      countryOfOrigin: "AR",
      imageUrl: "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Yerba Mate",
      slug: "yerba-mate",
      brandName: "Cruz de Malta",
      description: "Argentinian dried yerba mate leaves for the traditional South American herbal infusion. Earthy, energising and slightly bitter.",
      countryOfOrigin: "AR",
      imageUrl: "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=800&auto=format&fit=crop",
      categoryId: latinAmerican.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(yerbaMate.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(yerbaMate.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "YERBA-500G" },
    update: { stockQuantity: 50 },
    create: { productId: yerbaMate.id, sku: "YERBA-500G", label: "500g", weightGrams: 500, priceEuroCents: 699, stockQuantity: 50 },
  });
  console.log("Upserted: Yerba Mate");

  // NEW: Tomatillo Salsa Verde
  const salsaVerde = await prisma.product.upsert({
    where: { slug: "tomatillo-salsa-verde" },
    update: { brandName: "Herdez", countryOfOrigin: "MX" },
    create: {
      name: "Tomatillo Salsa Verde",
      slug: "tomatillo-salsa-verde",
      brandName: "Herdez",
      description: "Tangy Mexican green salsa made from roasted tomatillos, serrano chillies and coriander. Ideal for enchiladas and huevos rancheros.",
      countryOfOrigin: "MX",
      imageUrl: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&auto=format&fit=crop",
      categoryId: latinAmerican.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(salsaVerde.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(salsaVerde.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "SALSAVERDE-400G" },
    update: { stockQuantity: 60 },
    create: { productId: salsaVerde.id, sku: "SALSAVERDE-400G", label: "400g", weightGrams: 400, priceEuroCents: 329, stockQuantity: 60 },
  });
  console.log("Upserted: Tomatillo Salsa Verde");

  // ── AFRICAN ───────────────────────────────────────────────────────────────

  // Berbere Spice Mix
  const berbere = await prisma.product.upsert({
    where: { slug: "berbere-spice-mix" },
    update: {
      brandName: "Teff Love",
      countryOfOrigin: "ET",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Berbere Spice Mix",
      slug: "berbere-spice-mix",
      brandName: "Teff Love",
      description: "Ethiopian aromatic spice blend of chilli, fenugreek, coriander and cinnamon. The backbone of injera stews.",
      countryOfOrigin: "ET",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      categoryId: african.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(berbere.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(berbere.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "BERBERE-75G" },
    update: { stockQuantity: 50 },
    create: { productId: berbere.id, sku: "BERBERE-75G", label: "75g", weightGrams: 75, priceEuroCents: 399, stockQuantity: 50 },
  });
  console.log("Upserted: Berbere Spice Mix");

  // Ras el Hanout
  const rasElHanout = await prisma.product.upsert({
    where: { slug: "ras-el-hanout" },
    update: {
      brandName: "Les Moulins Mahjoub",
      countryOfOrigin: "MA",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Ras el Hanout",
      slug: "ras-el-hanout",
      brandName: "Les Moulins Mahjoub",
      description: "Moroccan spice blend meaning 'top of the shop' — a complex mix of up to 30 spices including rose petals.",
      countryOfOrigin: "MA",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      categoryId: african.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(rasElHanout.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(rasElHanout.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "RASELHANOUT-65G" },
    update: { stockQuantity: 55 },
    create: { productId: rasElHanout.id, sku: "RASELHANOUT-65G", label: "65g", weightGrams: 65, priceEuroCents: 449, stockQuantity: 55 },
  });
  console.log("Upserted: Ras el Hanout");

  // Palm Oil
  const palmOil = await prisma.product.upsert({
    where: { slug: "palm-oil" },
    update: {
      brandName: "Zomi",
      countryOfOrigin: "NG",
      imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Palm Oil",
      slug: "palm-oil",
      brandName: "Zomi",
      description: "Nigerian sustainably-sourced red palm oil with a rich, nutty flavour. Essential for West African soups and stews.",
      countryOfOrigin: "NG",
      imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop",
      categoryId: african.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(palmOil.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(palmOil.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "PALMOIL-500ML" },
    update: { stockQuantity: 45, volumeMl: 500 },
    create: { productId: palmOil.id, sku: "PALMOIL-500ML", label: "500ml", weightGrams: 450, volumeMl: 500, priceEuroCents: 549, stockQuantity: 45 },
  });
  console.log("Upserted: Palm Oil");

  // Ugali Flour
  const ugaliFlour = await prisma.product.upsert({
    where: { slug: "ugali-flour" },
    update: {
      brandName: "Jogoo",
      countryOfOrigin: "KE",
      imageUrl: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Ugali Flour",
      slug: "ugali-flour",
      brandName: "Jogoo",
      description: "Kenyan white maize flour for making ugali — the staple East African porridge served with stews.",
      countryOfOrigin: "KE",
      imageUrl: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&auto=format&fit=crop",
      categoryId: african.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(ugaliFlour.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(ugaliFlour.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "UGALI-1KG" },
    update: { stockQuantity: 60 },
    create: { productId: ugaliFlour.id, sku: "UGALI-1KG", label: "1kg", weightGrams: 1000, priceEuroCents: 279, stockQuantity: 60 },
  });
  await prisma.productVariant.upsert({
    where: { sku: "UGALI-2KG" },
    update: { stockQuantity: 30 },
    create: { productId: ugaliFlour.id, sku: "UGALI-2KG", label: "2kg", weightGrams: 2000, priceEuroCents: 499, stockQuantity: 30 },
  });
  console.log("Upserted: Ugali Flour");

  // Peri Peri Sauce
  const periPeri = await prisma.product.upsert({
    where: { slug: "peri-peri-sauce" },
    update: {
      brandName: "Peri Peri Original",
      countryOfOrigin: "MZ",
      imageUrl: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Peri Peri Sauce",
      slug: "peri-peri-sauce",
      brandName: "Peri Peri Original",
      description: "Mozambican bird's eye chilli hot sauce with lemon, garlic and herbs. The iconic Southern African condiment.",
      countryOfOrigin: "MZ",
      imageUrl: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&auto=format&fit=crop",
      categoryId: african.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(periPeri.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(periPeri.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "PERIPERI-200ML" },
    update: { stockQuantity: 70, volumeMl: 200 },
    create: { productId: periPeri.id, sku: "PERIPERI-200ML", label: "200ml", weightGrams: 240, volumeMl: 200, priceEuroCents: 349, stockQuantity: 70 },
  });
  console.log("Upserted: Peri Peri Sauce");

  // NEW: Suya Spice Blend
  const suyaSpice = await prisma.product.upsert({
    where: { slug: "suya-spice-blend" },
    update: { brandName: "Mama's Kitchen", countryOfOrigin: "NG" },
    create: {
      name: "Suya Spice Blend",
      slug: "suya-spice-blend",
      brandName: "Mama's Kitchen",
      description: "Nigerian dry spice rub for suya — the iconic West African street skewer. A bold blend of groundnut, ginger, paprika and garlic.",
      countryOfOrigin: "NG",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      categoryId: african.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(suyaSpice.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(suyaSpice.id, DietaryLabel.GLUTEN_FREE);
  await upsertAllergen(suyaSpice.id, AllergenType.PEANUTS);
  await prisma.productVariant.upsert({
    where: { sku: "SUYA-80G" },
    update: { stockQuantity: 45 },
    create: { productId: suyaSpice.id, sku: "SUYA-80G", label: "80g", weightGrams: 80, priceEuroCents: 449, stockQuantity: 45 },
  });
  console.log("Upserted: Suya Spice Blend");

  // ── EUROPEAN SPECIALTY ────────────────────────────────────────────────────

  // Truffle Oil
  const truffleOil = await prisma.product.upsert({
    where: { slug: "truffle-oil" },
    update: {
      brandName: "Urbani Tartufi",
      countryOfOrigin: "IT",
      imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Truffle Oil",
      slug: "truffle-oil",
      brandName: "Urbani Tartufi",
      description: "Italian extra virgin olive oil infused with black truffle. A few drops transform pasta, eggs or risotto.",
      countryOfOrigin: "IT",
      imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop",
      categoryId: europeanSpecialty.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(truffleOil.id, DietaryLabel.VEGAN);
  await prisma.productVariant.upsert({
    where: { sku: "TRUFFLE-100ML" },
    update: { stockQuantity: 35, volumeMl: 100 },
    create: { productId: truffleOil.id, sku: "TRUFFLE-100ML", label: "100ml", weightGrams: 110, volumeMl: 100, priceEuroCents: 1299, stockQuantity: 35 },
  });
  await prisma.productVariant.upsert({
    where: { sku: "TRUFFLE-250ML" },
    update: { stockQuantity: 20, volumeMl: 250 },
    create: { productId: truffleOil.id, sku: "TRUFFLE-250ML", label: "250ml", weightGrams: 270, volumeMl: 250, priceEuroCents: 2699, stockQuantity: 20 },
  });
  console.log("Upserted: Truffle Oil");

  // Smoked Paprika
  const smokedPaprika = await prisma.product.upsert({
    where: { slug: "smoked-paprika" },
    update: {
      brandName: "La Chinata",
      countryOfOrigin: "ES",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Smoked Paprika",
      slug: "smoked-paprika",
      brandName: "La Chinata",
      description: "Spanish pimentón de la Vera — slow-smoked sweet paprika with a distinctive smokiness. Key to chorizo and paella.",
      countryOfOrigin: "ES",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      categoryId: europeanSpecialty.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(smokedPaprika.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(smokedPaprika.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "PAPRIKA-75G" },
    update: { stockQuantity: 90 },
    create: { productId: smokedPaprika.id, sku: "PAPRIKA-75G", label: "75g", weightGrams: 75, priceEuroCents: 349, stockQuantity: 90 },
  });
  console.log("Upserted: Smoked Paprika");

  // Dijon Mustard
  const dijonMustard = await prisma.product.upsert({
    where: { slug: "dijon-mustard" },
    update: {
      brandName: "Maille",
      countryOfOrigin: "FR",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Dijon Mustard",
      slug: "dijon-mustard",
      brandName: "Maille",
      description: "Classic French Dijon mustard made from brown mustard seeds and white wine. Sharp, creamy and indispensable.",
      countryOfOrigin: "FR",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
      categoryId: europeanSpecialty.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(dijonMustard.id, DietaryLabel.VEGAN);
  await upsertAllergen(dijonMustard.id, AllergenType.MUSTARD);
  await prisma.productVariant.upsert({
    where: { sku: "DIJON-200G" },
    update: { stockQuantity: 100 },
    create: { productId: dijonMustard.id, sku: "DIJON-200G", label: "200g", weightGrams: 200, priceEuroCents: 299, stockQuantity: 100 },
  });
  console.log("Upserted: Dijon Mustard");

  // Capers in Brine
  const capers = await prisma.product.upsert({
    where: { slug: "capers-in-brine" },
    update: {
      brandName: "Gaea",
      countryOfOrigin: "GR",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Capers in Brine",
      slug: "capers-in-brine",
      brandName: "Gaea",
      description: "Greek small capers preserved in brine — pungent, tangy and salty. Essential for smoked salmon, pasta puttanesca and tartare sauce.",
      countryOfOrigin: "GR",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
      categoryId: europeanSpecialty.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(capers.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(capers.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "CAPERS-100G" },
    update: { stockQuantity: 75 },
    create: { productId: capers.id, sku: "CAPERS-100G", label: "100g", weightGrams: 100, priceEuroCents: 249, stockQuantity: 75 },
  });
  console.log("Upserted: Capers in Brine");

  // Anchovy Paste
  const anchovyPaste = await prisma.product.upsert({
    where: { slug: "anchovy-paste" },
    update: {
      brandName: "Comur",
      countryOfOrigin: "PT",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Anchovy Paste",
      slug: "anchovy-paste",
      brandName: "Comur",
      description: "Portuguese concentrated anchovy paste for adding deep umami to sauces, dressings and braises.",
      countryOfOrigin: "PT",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
      categoryId: europeanSpecialty.id,
      isActive: true,
    },
  });
  await upsertAllergen(anchovyPaste.id, AllergenType.FISH);
  await prisma.productVariant.upsert({
    where: { sku: "ANCHOVY-60G" },
    update: { stockQuantity: 40 },
    create: { productId: anchovyPaste.id, sku: "ANCHOVY-60G", label: "60g", weightGrams: 60, priceEuroCents: 349, stockQuantity: 40 },
  });
  console.log("Upserted: Anchovy Paste");

  // ── JAPANESE ──────────────────────────────────────────────────────────────

  // Miso Paste
  const misoPaste = await prisma.product.upsert({
    where: { slug: "miso-paste" },
    update: {
      brandName: "Hikari",
      countryOfOrigin: "JP",
      imageUrl: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Miso Paste",
      slug: "miso-paste",
      brandName: "Hikari",
      description: "Japanese white shiro miso — mild, slightly sweet fermented soybean paste. For miso soup, marinades and dressings.",
      countryOfOrigin: "JP",
      imageUrl: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&auto=format&fit=crop",
      categoryId: japanese.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(misoPaste.id, DietaryLabel.VEGAN);
  await upsertAllergen(misoPaste.id, AllergenType.SOYBEANS);
  await prisma.productVariant.upsert({
    where: { sku: "MISO-300G" },
    update: { stockQuantity: 80 },
    create: { productId: misoPaste.id, sku: "MISO-300G", label: "300g", weightGrams: 300, priceEuroCents: 499, stockQuantity: 80 },
  });
  await prisma.productVariant.upsert({
    where: { sku: "MISO-750G" },
    update: { stockQuantity: 40 },
    create: { productId: misoPaste.id, sku: "MISO-750G", label: "750g", weightGrams: 750, priceEuroCents: 1099, stockQuantity: 40 },
  });
  console.log("Upserted: Miso Paste");

  // Mirin
  const mirin = await prisma.product.upsert({
    where: { slug: "mirin" },
    update: {
      brandName: "Mizkan",
      countryOfOrigin: "JP",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Mirin",
      slug: "mirin",
      brandName: "Mizkan",
      description: "Japanese sweet rice wine — adds subtle sweetness and gloss to teriyaki, yakitori and simmered dishes.",
      countryOfOrigin: "JP",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
      categoryId: japanese.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(mirin.id, DietaryLabel.VEGAN);
  await prisma.productVariant.upsert({
    where: { sku: "MIRIN-300ML" },
    update: { stockQuantity: 70, volumeMl: 300 },
    create: { productId: mirin.id, sku: "MIRIN-300ML", label: "300ml", weightGrams: 340, volumeMl: 300, priceEuroCents: 399, stockQuantity: 70 },
  });
  console.log("Upserted: Mirin");

  // Panko Breadcrumbs
  const panko = await prisma.product.upsert({
    where: { slug: "panko-breadcrumbs" },
    update: {
      brandName: "Kikkoman",
      countryOfOrigin: "JP",
      imageUrl: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Panko Breadcrumbs",
      slug: "panko-breadcrumbs",
      brandName: "Kikkoman",
      description: "Japanese-style coarse breadcrumbs for an extra-crispy coating on katsu, schnitzels and fried foods.",
      countryOfOrigin: "JP",
      imageUrl: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&auto=format&fit=crop",
      categoryId: japanese.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(panko.id, DietaryLabel.VEGAN);
  await upsertAllergen(panko.id, AllergenType.GLUTEN);
  await prisma.productVariant.upsert({
    where: { sku: "PANKO-200G" },
    update: { stockQuantity: 100 },
    create: { productId: panko.id, sku: "PANKO-200G", label: "200g", weightGrams: 200, priceEuroCents: 249, stockQuantity: 100 },
  });
  console.log("Upserted: Panko Breadcrumbs");

  // Dashi Stock Powder
  const dashiPowder = await prisma.product.upsert({
    where: { slug: "dashi-stock-powder" },
    update: {
      brandName: "Ajinomoto",
      countryOfOrigin: "JP",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Dashi Stock Powder",
      slug: "dashi-stock-powder",
      brandName: "Ajinomoto",
      description: "Instant Japanese dashi made from dried bonito flakes and kombu kelp. The umami foundation of Japanese cooking.",
      countryOfOrigin: "JP",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      categoryId: japanese.id,
      isActive: true,
    },
  });
  await upsertAllergen(dashiPowder.id, AllergenType.FISH);
  await prisma.productVariant.upsert({
    where: { sku: "DASHI-50G" },
    update: { stockQuantity: 60 },
    create: { productId: dashiPowder.id, sku: "DASHI-50G", label: "50g (24 sachets)", weightGrams: 50, priceEuroCents: 449, stockQuantity: 60 },
  });
  console.log("Upserted: Dashi Stock Powder");

  // Yuzu Kosho
  const yuzuKosho = await prisma.product.upsert({
    where: { slug: "yuzu-kosho" },
    update: {
      brandName: "S&B",
      countryOfOrigin: "JP",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Yuzu Kosho",
      slug: "yuzu-kosho",
      brandName: "S&B",
      description: "Japanese fermented condiment of yuzu zest and green chilli. Intensely aromatic with a citrusy heat.",
      countryOfOrigin: "JP",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      categoryId: japanese.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(yuzuKosho.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(yuzuKosho.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "YUZU-50G" },
    update: { stockQuantity: 30 },
    create: { productId: yuzuKosho.id, sku: "YUZU-50G", label: "50g", weightGrams: 50, priceEuroCents: 699, stockQuantity: 30 },
  });
  console.log("Upserted: Yuzu Kosho");

  // NEW: Rice Vinegar
  const riceVinegar = await prisma.product.upsert({
    where: { slug: "rice-vinegar" },
    update: { brandName: "Mizkan", countryOfOrigin: "JP" },
    create: {
      name: "Rice Vinegar",
      slug: "rice-vinegar",
      brandName: "Mizkan",
      description: "Mild Japanese rice vinegar with a clean, slightly sweet acidity. Used for sushi rice, pickles and dressings.",
      countryOfOrigin: "JP",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
      categoryId: japanese.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(riceVinegar.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(riceVinegar.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "RICEVINEGAR-200ML" },
    update: { stockQuantity: 80, volumeMl: 200 },
    create: { productId: riceVinegar.id, sku: "RICEVINEGAR-200ML", label: "200ml", weightGrams: 240, volumeMl: 200, priceEuroCents: 299, stockQuantity: 80 },
  });
  await prisma.productVariant.upsert({
    where: { sku: "RICEVINEGAR-500ML" },
    update: { stockQuantity: 50, volumeMl: 500 },
    create: { productId: riceVinegar.id, sku: "RICEVINEGAR-500ML", label: "500ml", weightGrams: 580, volumeMl: 500, priceEuroCents: 599, stockQuantity: 50 },
  });
  console.log("Upserted: Rice Vinegar");

  // NEW: Nori Sheets
  const noriSheets = await prisma.product.upsert({
    where: { slug: "nori-sheets" },
    update: { brandName: "Yamamotoyama", countryOfOrigin: "JP" },
    create: {
      name: "Nori Sheets",
      slug: "nori-sheets",
      brandName: "Yamamotoyama",
      description: "Premium Japanese roasted seaweed sheets for sushi, onigiri and garnishes. Crispy, umami-rich, and paper-thin.",
      countryOfOrigin: "JP",
      imageUrl: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&auto=format&fit=crop",
      categoryId: japanese.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(noriSheets.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(noriSheets.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "NORI-10SHEETS" },
    update: { stockQuantity: 90 },
    create: { productId: noriSheets.id, sku: "NORI-10SHEETS", label: "10 sheets (22g)", weightGrams: 22, priceEuroCents: 349, stockQuantity: 90 },
  });
  await prisma.productVariant.upsert({
    where: { sku: "NORI-50SHEETS" },
    update: { stockQuantity: 45 },
    create: { productId: noriSheets.id, sku: "NORI-50SHEETS", label: "50 sheets (110g)", weightGrams: 110, priceEuroCents: 1399, stockQuantity: 45 },
  });
  console.log("Upserted: Nori Sheets");

  // NEW: Shichimi Togarashi
  const shichimi = await prisma.product.upsert({
    where: { slug: "shichimi-togarashi" },
    update: { brandName: "S&B", countryOfOrigin: "JP" },
    create: {
      name: "Shichimi Togarashi",
      slug: "shichimi-togarashi",
      brandName: "S&B",
      description: "Japanese seven-spice blend of chilli, orange peel, black sesame, white sesame, hemp, ginger and nori. Sprinkle on noodles, gyoza and grilled meats.",
      countryOfOrigin: "JP",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      categoryId: japanese.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(shichimi.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(shichimi.id, DietaryLabel.GLUTEN_FREE);
  await upsertAllergen(shichimi.id, AllergenType.SESAME);
  await prisma.productVariant.upsert({
    where: { sku: "SHICHIMI-15G" },
    update: { stockQuantity: 80 },
    create: { productId: shichimi.id, sku: "SHICHIMI-15G", label: "15g", weightGrams: 15, priceEuroCents: 299, stockQuantity: 80 },
  });
  await prisma.productVariant.upsert({
    where: { sku: "SHICHIMI-30G" },
    update: { stockQuantity: 50 },
    create: { productId: shichimi.id, sku: "SHICHIMI-30G", label: "30g", weightGrams: 30, priceEuroCents: 499, stockQuantity: 50 },
  });
  console.log("Upserted: Shichimi Togarashi");

  // ── INDIAN SPICES ─────────────────────────────────────────────────────────

  // Garam Masala
  const garamMasala = await prisma.product.upsert({
    where: { slug: "garam-masala" },
    update: {
      brandName: "MDH",
      countryOfOrigin: "IN",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Garam Masala",
      slug: "garam-masala",
      brandName: "MDH",
      description: "Aromatic North Indian spice blend of cardamom, cinnamon, cloves and black pepper. The finishing spice of Indian cooking.",
      countryOfOrigin: "IN",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      categoryId: indianSpices.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(garamMasala.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(garamMasala.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "GARAM-100G" },
    update: { stockQuantity: 100 },
    create: { productId: garamMasala.id, sku: "GARAM-100G", label: "100g", weightGrams: 100, priceEuroCents: 299, stockQuantity: 100 },
  });
  await prisma.productVariant.upsert({
    where: { sku: "GARAM-250G" },
    update: { stockQuantity: 60 },
    create: { productId: garamMasala.id, sku: "GARAM-250G", label: "250g", weightGrams: 250, priceEuroCents: 599, stockQuantity: 60 },
  });
  console.log("Upserted: Garam Masala");

  // Curry Leaves Dried
  const curryLeaves = await prisma.product.upsert({
    where: { slug: "curry-leaves-dried" },
    update: {
      brandName: "Eastern",
      countryOfOrigin: "IN",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Curry Leaves Dried",
      slug: "curry-leaves-dried",
      brandName: "Eastern",
      description: "Sun-dried South Indian curry leaves with an intense, aromatic flavour. Fry in oil before adding other ingredients.",
      countryOfOrigin: "IN",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      categoryId: indianSpices.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(curryLeaves.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(curryLeaves.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "CURRYLEAVES-20G" },
    update: { stockQuantity: 70 },
    create: { productId: curryLeaves.id, sku: "CURRYLEAVES-20G", label: "20g", weightGrams: 20, priceEuroCents: 199, stockQuantity: 70 },
  });
  console.log("Upserted: Curry Leaves Dried");

  // Tamarind Paste
  const tamarindPaste = await prisma.product.upsert({
    where: { slug: "tamarind-paste" },
    update: {
      brandName: "Patak's",
      countryOfOrigin: "IN",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Tamarind Paste",
      slug: "tamarind-paste",
      brandName: "Patak's",
      description: "Indian concentrated tamarind paste with a sharp, sweet-sour tang. Essential for chutneys, pad thai and sambar.",
      countryOfOrigin: "IN",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
      categoryId: indianSpices.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(tamarindPaste.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(tamarindPaste.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "TAMARIND-200G" },
    update: { stockQuantity: 75 },
    create: { productId: tamarindPaste.id, sku: "TAMARIND-200G", label: "200g", weightGrams: 200, priceEuroCents: 299, stockQuantity: 75 },
  });
  console.log("Upserted: Tamarind Paste");

  // Fenugreek Seeds
  const fenugreek = await prisma.product.upsert({
    where: { slug: "fenugreek-seeds" },
    update: {
      brandName: "Barts",
      countryOfOrigin: "IN",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Fenugreek Seeds",
      slug: "fenugreek-seeds",
      brandName: "Barts",
      description: "Whole Indian fenugreek seeds with a bitter, slightly maple-like flavour. Used in tadka, pickles and spice blends.",
      countryOfOrigin: "IN",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      categoryId: indianSpices.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(fenugreek.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(fenugreek.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "FENUGREEK-100G" },
    update: { stockQuantity: 80 },
    create: { productId: fenugreek.id, sku: "FENUGREEK-100G", label: "100g", weightGrams: 100, priceEuroCents: 179, stockQuantity: 80 },
  });
  console.log("Upserted: Fenugreek Seeds");

  // Amchur Powder
  const amchur = await prisma.product.upsert({
    where: { slug: "amchur-powder" },
    update: {
      brandName: "MDH",
      countryOfOrigin: "IN",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
    },
    create: {
      name: "Amchur Powder",
      slug: "amchur-powder",
      brandName: "MDH",
      description: "Indian dried green mango powder — adds a tart, fruity sourness to chaat, chutneys and marinades.",
      countryOfOrigin: "IN",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      categoryId: indianSpices.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(amchur.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(amchur.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "AMCHUR-100G" },
    update: { stockQuantity: 65 },
    create: { productId: amchur.id, sku: "AMCHUR-100G", label: "100g", weightGrams: 100, priceEuroCents: 229, stockQuantity: 65 },
  });
  console.log("Upserted: Amchur Powder");

  // NEW: Turmeric Powder
  const turmeric = await prisma.product.upsert({
    where: { slug: "turmeric-powder" },
    update: { brandName: "MDH", countryOfOrigin: "IN" },
    create: {
      name: "Turmeric Powder",
      slug: "turmeric-powder",
      brandName: "MDH",
      description: "Vibrant Indian ground turmeric with earthy, warm notes and a deep golden colour. Staple of Indian cooking and golden milk.",
      countryOfOrigin: "IN",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      categoryId: indianSpices.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(turmeric.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(turmeric.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "TURMERIC-100G" },
    update: { stockQuantity: 110 },
    create: { productId: turmeric.id, sku: "TURMERIC-100G", label: "100g", weightGrams: 100, priceEuroCents: 199, stockQuantity: 110 },
  });
  await prisma.productVariant.upsert({
    where: { sku: "TURMERIC-200G" },
    update: { stockQuantity: 70 },
    create: { productId: turmeric.id, sku: "TURMERIC-200G", label: "200g", weightGrams: 200, priceEuroCents: 349, stockQuantity: 70 },
  });
  console.log("Upserted: Turmeric Powder");

  // NEW: Cardamom Pods
  const cardamom = await prisma.product.upsert({
    where: { slug: "cardamom-pods" },
    update: { brandName: "Rajah", countryOfOrigin: "IN" },
    create: {
      name: "Cardamom Pods",
      slug: "cardamom-pods",
      brandName: "Rajah",
      description: "Whole green cardamom pods from Kerala with an intense floral, citrusy warmth. Grind fresh for chai, biryanis and Scandinavian pastries.",
      countryOfOrigin: "IN",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      categoryId: indianSpices.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(cardamom.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(cardamom.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({
    where: { sku: "CARDAMOM-50G" },
    update: { stockQuantity: 65 },
    create: { productId: cardamom.id, sku: "CARDAMOM-50G", label: "50g", weightGrams: 50, priceEuroCents: 399, stockQuantity: 65 },
  });
  await prisma.productVariant.upsert({
    where: { sku: "CARDAMOM-100G" },
    update: { stockQuantity: 40 },
    create: { productId: cardamom.id, sku: "CARDAMOM-100G", label: "100g", weightGrams: 100, priceEuroCents: 699, stockQuantity: 40 },
  });
  console.log("Upserted: Cardamom Pods");

  // NEW: Black Mustard Seeds
  const mustardSeeds = await prisma.product.upsert({
    where: { slug: "black-mustard-seeds" },
    update: { brandName: "Rajah", countryOfOrigin: "IN" },
    create: {
      name: "Black Mustard Seeds",
      slug: "black-mustard-seeds",
      brandName: "Rajah",
      description: "Whole Indian black mustard seeds — the essential first step in any tadka. Toast in oil until they pop and release their nutty aroma.",
      countryOfOrigin: "IN",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      categoryId: indianSpices.id,
      isActive: true,
    },
  });
  await upsertDietaryLabel(mustardSeeds.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(mustardSeeds.id, DietaryLabel.GLUTEN_FREE);
  await upsertAllergen(mustardSeeds.id, AllergenType.MUSTARD);
  await prisma.productVariant.upsert({
    where: { sku: "MUSTARDSEEDS-100G" },
    update: { stockQuantity: 90 },
    create: { productId: mustardSeeds.id, sku: "MUSTARDSEEDS-100G", label: "100g", weightGrams: 100, priceEuroCents: 149, stockQuantity: 90 },
  });
  await prisma.productVariant.upsert({
    where: { sku: "MUSTARDSEEDS-250G" },
    update: { stockQuantity: 55 },
    create: { productId: mustardSeeds.id, sku: "MUSTARDSEEDS-250G", label: "250g", weightGrams: 250, priceEuroCents: 299, stockQuantity: 55 },
  });
  console.log("Upserted: Black Mustard Seeds");

  console.log("\nSeed complete. 8 categories, 51 products (36 original + 15 new).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
