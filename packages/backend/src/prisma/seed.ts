// Database seed script — inserts baseline test data.
// Uses upsert so it is safe to run multiple times without creating duplicates.
import { PrismaClient, DietaryLabel, AllergenType, CategoryType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ── Origin Regions ────────────────────────────────────────────────────────
  const eastAsia = await prisma.category.upsert({
    where: { slug: "east-asia" },
    update: { name: "East Asia", type: CategoryType.ORIGIN_REGION, emoji: "🏯", parentId: null },
    create: { name: "East Asia", slug: "east-asia", type: CategoryType.ORIGIN_REGION, emoji: "🏯" },
  });
  const southeastAsia = await prisma.category.upsert({
    where: { slug: "southeast-asia" },
    update: { name: "Southeast Asia", type: CategoryType.ORIGIN_REGION, emoji: "🌴", parentId: null },
    create: { name: "Southeast Asia", slug: "southeast-asia", type: CategoryType.ORIGIN_REGION, emoji: "🌴" },
  });
  const southAsia = await prisma.category.upsert({
    where: { slug: "south-asia" },
    update: { name: "South Asia", type: CategoryType.ORIGIN_REGION, emoji: "🌸", parentId: null },
    create: { name: "South Asia", slug: "south-asia", type: CategoryType.ORIGIN_REGION, emoji: "🌸" },
  });
  const middleEast = await prisma.category.upsert({
    where: { slug: "middle-east" },
    update: { name: "Middle East", type: CategoryType.ORIGIN_REGION, emoji: "🕌", parentId: null },
    create: { name: "Middle East", slug: "middle-east", type: CategoryType.ORIGIN_REGION, emoji: "🕌" },
  });
  const northAfrica = await prisma.category.upsert({
    where: { slug: "north-africa" },
    update: { name: "North Africa", type: CategoryType.ORIGIN_REGION, emoji: "🌙", parentId: null },
    create: { name: "North Africa", slug: "north-africa", type: CategoryType.ORIGIN_REGION, emoji: "🌙" },
  });
  const subSaharanAfrica = await prisma.category.upsert({
    where: { slug: "sub-saharan-africa" },
    update: { name: "Sub-Saharan Africa", type: CategoryType.ORIGIN_REGION, emoji: "🦁", parentId: null },
    create: { name: "Sub-Saharan Africa", slug: "sub-saharan-africa", type: CategoryType.ORIGIN_REGION, emoji: "🦁" },
  });
  const latinAmerica = await prisma.category.upsert({
    where: { slug: "latin-america" },
    update: { name: "Latin America", type: CategoryType.ORIGIN_REGION, emoji: "🌶️", parentId: null },
    create: { name: "Latin America", slug: "latin-america", type: CategoryType.ORIGIN_REGION, emoji: "🌶️" },
  });
  const europe = await prisma.category.upsert({
    where: { slug: "europe" },
    update: { name: "Europe", type: CategoryType.ORIGIN_REGION, emoji: "🏛️", parentId: null },
    create: { name: "Europe", slug: "europe", type: CategoryType.ORIGIN_REGION, emoji: "🏛️" },
  });

  // ── Origin Countries ───────────────────────────────────────────────────────
  // East Asia
  const japan = await prisma.category.upsert({
    where: { slug: "japan" },
    update: { name: "Japan", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇯🇵", parentId: eastAsia.id },
    create: { name: "Japan", slug: "japan", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇯🇵", parentId: eastAsia.id },
  });
  const southKorea = await prisma.category.upsert({
    where: { slug: "south-korea" },
    update: { name: "South Korea", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇰🇷", parentId: eastAsia.id },
    create: { name: "South Korea", slug: "south-korea", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇰🇷", parentId: eastAsia.id },
  });
  const china = await prisma.category.upsert({
    where: { slug: "china" },
    update: { name: "China", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇨🇳", parentId: eastAsia.id },
    create: { name: "China", slug: "china", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇨🇳", parentId: eastAsia.id },
  });
  // Southeast Asia
  const thailand = await prisma.category.upsert({
    where: { slug: "thailand" },
    update: { name: "Thailand", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇹🇭", parentId: southeastAsia.id },
    create: { name: "Thailand", slug: "thailand", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇹🇭", parentId: southeastAsia.id },
  });
  const vietnam = await prisma.category.upsert({
    where: { slug: "vietnam" },
    update: { name: "Vietnam", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇻🇳", parentId: southeastAsia.id },
    create: { name: "Vietnam", slug: "vietnam", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇻🇳", parentId: southeastAsia.id },
  });
  const indonesia = await prisma.category.upsert({
    where: { slug: "indonesia" },
    update: { name: "Indonesia", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇮🇩", parentId: southeastAsia.id },
    create: { name: "Indonesia", slug: "indonesia", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇮🇩", parentId: southeastAsia.id },
  });
  // South Asia
  const india = await prisma.category.upsert({
    where: { slug: "india" },
    update: { name: "India", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇮🇳", parentId: southAsia.id },
    create: { name: "India", slug: "india", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇮🇳", parentId: southAsia.id },
  });
  // Middle East
  const lebanon = await prisma.category.upsert({
    where: { slug: "lebanon" },
    update: { name: "Lebanon", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇱🇧", parentId: middleEast.id },
    create: { name: "Lebanon", slug: "lebanon", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇱🇧", parentId: middleEast.id },
  });
  const turkey = await prisma.category.upsert({
    where: { slug: "turkey" },
    update: { name: "Turkey", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇹🇷", parentId: middleEast.id },
    create: { name: "Turkey", slug: "turkey", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇹🇷", parentId: middleEast.id },
  });
  const jordan = await prisma.category.upsert({
    where: { slug: "jordan" },
    update: { name: "Jordan", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇯🇴", parentId: middleEast.id },
    create: { name: "Jordan", slug: "jordan", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇯🇴", parentId: middleEast.id },
  });
  const palestine = await prisma.category.upsert({
    where: { slug: "palestine" },
    update: { name: "Palestine", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇵🇸", parentId: middleEast.id },
    create: { name: "Palestine", slug: "palestine", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇵🇸", parentId: middleEast.id },
  });
  // North Africa
  const morocco = await prisma.category.upsert({
    where: { slug: "morocco" },
    update: { name: "Morocco", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇲🇦", parentId: northAfrica.id },
    create: { name: "Morocco", slug: "morocco", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇲🇦", parentId: northAfrica.id },
  });
  const tunisia = await prisma.category.upsert({
    where: { slug: "tunisia" },
    update: { name: "Tunisia", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇹🇳", parentId: northAfrica.id },
    create: { name: "Tunisia", slug: "tunisia", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇹🇳", parentId: northAfrica.id },
  });
  // Sub-Saharan Africa
  const ethiopia = await prisma.category.upsert({
    where: { slug: "ethiopia" },
    update: { name: "Ethiopia", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇪🇹", parentId: subSaharanAfrica.id },
    create: { name: "Ethiopia", slug: "ethiopia", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇪🇹", parentId: subSaharanAfrica.id },
  });
  const nigeria = await prisma.category.upsert({
    where: { slug: "nigeria" },
    update: { name: "Nigeria", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇳🇬", parentId: subSaharanAfrica.id },
    create: { name: "Nigeria", slug: "nigeria", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇳🇬", parentId: subSaharanAfrica.id },
  });
  const kenya = await prisma.category.upsert({
    where: { slug: "kenya" },
    update: { name: "Kenya", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇰🇪", parentId: subSaharanAfrica.id },
    create: { name: "Kenya", slug: "kenya", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇰🇪", parentId: subSaharanAfrica.id },
  });
  const mozambique = await prisma.category.upsert({
    where: { slug: "mozambique" },
    update: { name: "Mozambique", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇲🇿", parentId: subSaharanAfrica.id },
    create: { name: "Mozambique", slug: "mozambique", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇲🇿", parentId: subSaharanAfrica.id },
  });
  // Latin America
  const mexico = await prisma.category.upsert({
    where: { slug: "mexico" },
    update: { name: "Mexico", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇲🇽", parentId: latinAmerica.id },
    create: { name: "Mexico", slug: "mexico", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇲🇽", parentId: latinAmerica.id },
  });
  const peru = await prisma.category.upsert({
    where: { slug: "peru" },
    update: { name: "Peru", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇵🇪", parentId: latinAmerica.id },
    create: { name: "Peru", slug: "peru", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇵🇪", parentId: latinAmerica.id },
  });
  const brazil = await prisma.category.upsert({
    where: { slug: "brazil" },
    update: { name: "Brazil", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇧🇷", parentId: latinAmerica.id },
    create: { name: "Brazil", slug: "brazil", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇧🇷", parentId: latinAmerica.id },
  });
  const argentina = await prisma.category.upsert({
    where: { slug: "argentina" },
    update: { name: "Argentina", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇦🇷", parentId: latinAmerica.id },
    create: { name: "Argentina", slug: "argentina", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇦🇷", parentId: latinAmerica.id },
  });
  // Europe
  const france = await prisma.category.upsert({
    where: { slug: "france" },
    update: { name: "France", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇫🇷", parentId: europe.id },
    create: { name: "France", slug: "france", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇫🇷", parentId: europe.id },
  });
  const italy = await prisma.category.upsert({
    where: { slug: "italy" },
    update: { name: "Italy", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇮🇹", parentId: europe.id },
    create: { name: "Italy", slug: "italy", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇮🇹", parentId: europe.id },
  });
  const spain = await prisma.category.upsert({
    where: { slug: "spain" },
    update: { name: "Spain", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇪🇸", parentId: europe.id },
    create: { name: "Spain", slug: "spain", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇪🇸", parentId: europe.id },
  });
  const greece = await prisma.category.upsert({
    where: { slug: "greece" },
    update: { name: "Greece", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇬🇷", parentId: europe.id },
    create: { name: "Greece", slug: "greece", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇬🇷", parentId: europe.id },
  });
  const portugal = await prisma.category.upsert({
    where: { slug: "portugal" },
    update: { name: "Portugal", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇵🇹", parentId: europe.id },
    create: { name: "Portugal", slug: "portugal", type: CategoryType.ORIGIN_COUNTRY, emoji: "🇵🇹", parentId: europe.id },
  });

  // ── Product Types ─────────────────────────────────────────────────────────
  const saucesCondiments = await prisma.category.upsert({
    where: { slug: "sauces-condiments" },
    update: { name: "Sauces & Condiments", type: CategoryType.PRODUCT_TYPE, emoji: "🫙", parentId: null },
    create: { name: "Sauces & Condiments", slug: "sauces-condiments", type: CategoryType.PRODUCT_TYPE, emoji: "🫙" },
  });
  const pastes = await prisma.category.upsert({
    where: { slug: "pastes" },
    update: { name: "Pastes", type: CategoryType.PRODUCT_TYPE, emoji: "🫕", parentId: null },
    create: { name: "Pastes", slug: "pastes", type: CategoryType.PRODUCT_TYPE, emoji: "🫕" },
  });
  const grainsLegumes = await prisma.category.upsert({
    where: { slug: "grains-legumes" },
    update: { name: "Grains & Legumes", type: CategoryType.PRODUCT_TYPE, emoji: "🌾", parentId: null },
    create: { name: "Grains & Legumes", slug: "grains-legumes", type: CategoryType.PRODUCT_TYPE, emoji: "🌾" },
  });
  const spicesHerbs = await prisma.category.upsert({
    where: { slug: "spices-herbs" },
    update: { name: "Spices & Herbs", type: CategoryType.PRODUCT_TYPE, emoji: "🌿", parentId: null },
    create: { name: "Spices & Herbs", slug: "spices-herbs", type: CategoryType.PRODUCT_TYPE, emoji: "🌿" },
  });
  const oilsVinegars = await prisma.category.upsert({
    where: { slug: "oils-vinegars" },
    update: { name: "Oils & Vinegars", type: CategoryType.PRODUCT_TYPE, emoji: "🫒", parentId: null },
    create: { name: "Oils & Vinegars", slug: "oils-vinegars", type: CategoryType.PRODUCT_TYPE, emoji: "🫒" },
  });
  const driedPreserved = await prisma.category.upsert({
    where: { slug: "dried-preserved" },
    update: { name: "Dried & Preserved", type: CategoryType.PRODUCT_TYPE, emoji: "🌰", parentId: null },
    create: { name: "Dried & Preserved", slug: "dried-preserved", type: CategoryType.PRODUCT_TYPE, emoji: "🌰" },
  });

  console.log("Categories upserted: 8 regions, 26 countries, 6 product types");

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

  // ── Products ──────────────────────────────────────────────────────────────

  // Jasmine Rice — Thailand / Grains & Legumes
  const jasmineRice = await prisma.product.upsert({
    where: { slug: "jasmine-rice" },
    update: { originCategoryId: thailand.id, typeCategoryId: grainsLegumes.id },
    create: {
      name: "Jasmine Rice", slug: "jasmine-rice", brandName: "Golden Phoenix",
      description: "Fragrant Thai jasmine rice with a delicate floral aroma and slightly sticky texture when cooked.",
      countryOfOrigin: "TH",
      imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop",
      originCategoryId: thailand.id, typeCategoryId: grainsLegumes.id, isActive: true,
    },
  });
  await upsertDietaryLabel(jasmineRice.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(jasmineRice.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "RICE-JASMINE-500G" }, update: { stockQuantity: 120 }, create: { productId: jasmineRice.id, sku: "RICE-JASMINE-500G", label: "500g", weightGrams: 500, priceEuroCents: 249, stockQuantity: 120 } });
  await prisma.productVariant.upsert({ where: { sku: "RICE-JASMINE-1KG" }, update: { stockQuantity: 80 }, create: { productId: jasmineRice.id, sku: "RICE-JASMINE-1KG", label: "1kg", weightGrams: 1000, priceEuroCents: 429, stockQuantity: 80 } });
  console.log("Upserted: Jasmine Rice");

  // Fish Sauce — Vietnam / Sauces & Condiments
  const fishSauce = await prisma.product.upsert({
    where: { slug: "fish-sauce" },
    update: { originCategoryId: vietnam.id, typeCategoryId: saucesCondiments.id },
    create: {
      name: "Fish Sauce", slug: "fish-sauce", brandName: "Tiparos",
      description: "Authentic Vietnamese fish sauce fermented from anchovies and sea salt. Essential for South-East Asian cooking.",
      countryOfOrigin: "VN",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
      originCategoryId: vietnam.id, typeCategoryId: saucesCondiments.id, isActive: true,
    },
  });
  await upsertAllergen(fishSauce.id, AllergenType.FISH);
  await prisma.productVariant.upsert({ where: { sku: "SAUCE-FISH-300ML" }, update: { stockQuantity: 90, volumeMl: 300 }, create: { productId: fishSauce.id, sku: "SAUCE-FISH-300ML", label: "300ml", weightGrams: 350, volumeMl: 300, priceEuroCents: 349, stockQuantity: 90 } });
  await prisma.productVariant.upsert({ where: { sku: "SAUCE-FISH-700ML" }, update: { stockQuantity: 60, volumeMl: 700 }, create: { productId: fishSauce.id, sku: "SAUCE-FISH-700ML", label: "700ml", weightGrams: 800, volumeMl: 700, priceEuroCents: 599, stockQuantity: 60 } });
  console.log("Upserted: Fish Sauce");

  // Oyster Sauce — China / Sauces & Condiments
  const oysterSauce = await prisma.product.upsert({
    where: { slug: "oyster-sauce" },
    update: { originCategoryId: china.id, typeCategoryId: saucesCondiments.id },
    create: {
      name: "Oyster Sauce", slug: "oyster-sauce", brandName: "Lee Kum Kee",
      description: "Rich, thick Chinese oyster sauce made from caramelised oyster extracts. Adds depth and umami to stir-fries.",
      countryOfOrigin: "CN",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
      originCategoryId: china.id, typeCategoryId: saucesCondiments.id, isActive: true,
    },
  });
  await upsertAllergen(oysterSauce.id, AllergenType.MOLLUSCS);
  await prisma.productVariant.upsert({ where: { sku: "SAUCE-OYSTER-255G" }, update: { stockQuantity: 75 }, create: { productId: oysterSauce.id, sku: "SAUCE-OYSTER-255G", label: "255g", weightGrams: 255, priceEuroCents: 279, stockQuantity: 75 } });
  await prisma.productVariant.upsert({ where: { sku: "SAUCE-OYSTER-510G" }, update: { stockQuantity: 50 }, create: { productId: oysterSauce.id, sku: "SAUCE-OYSTER-510G", label: "510g", weightGrams: 510, priceEuroCents: 479, stockQuantity: 50 } });
  console.log("Upserted: Oyster Sauce");

  // Hoisin Sauce — China / Sauces & Condiments
  const hoisinSauce = await prisma.product.upsert({
    where: { slug: "hoisin-sauce" },
    update: { originCategoryId: china.id, typeCategoryId: saucesCondiments.id },
    create: {
      name: "Hoisin Sauce", slug: "hoisin-sauce", brandName: "Lee Kum Kee",
      description: "Sweet and savoury Chinese hoisin sauce made from soybeans, garlic and spices. Perfect for Peking duck and dipping.",
      countryOfOrigin: "CN",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
      originCategoryId: china.id, typeCategoryId: saucesCondiments.id, isActive: true,
    },
  });
  await upsertDietaryLabel(hoisinSauce.id, DietaryLabel.VEGAN);
  await upsertAllergen(hoisinSauce.id, AllergenType.SOYBEANS);
  await prisma.productVariant.upsert({ where: { sku: "SAUCE-HOISIN-220G" }, update: { stockQuantity: 85 }, create: { productId: hoisinSauce.id, sku: "SAUCE-HOISIN-220G", label: "220g", weightGrams: 220, priceEuroCents: 259, stockQuantity: 85 } });
  console.log("Upserted: Hoisin Sauce");

  // Sambal Oelek — Indonesia / Pastes
  const sambalOelek = await prisma.product.upsert({
    where: { slug: "sambal-oelek" },
    update: { originCategoryId: indonesia.id, typeCategoryId: pastes.id },
    create: {
      name: "Sambal Oelek", slug: "sambal-oelek", brandName: "Conimex",
      description: "Traditional Indonesian chilli paste made from ground fresh red chillies and salt. Fiery and versatile.",
      countryOfOrigin: "ID",
      imageUrl: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&auto=format&fit=crop",
      originCategoryId: indonesia.id, typeCategoryId: pastes.id, isActive: true,
    },
  });
  await upsertDietaryLabel(sambalOelek.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(sambalOelek.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "SAUCE-SAMBAL-185G" }, update: { stockQuantity: 100 }, create: { productId: sambalOelek.id, sku: "SAUCE-SAMBAL-185G", label: "185g", weightGrams: 185, priceEuroCents: 229, stockQuantity: 100 } });
  await prisma.productVariant.upsert({ where: { sku: "SAUCE-SAMBAL-400G" }, update: { stockQuantity: 65 }, create: { productId: sambalOelek.id, sku: "SAUCE-SAMBAL-400G", label: "400g", weightGrams: 400, priceEuroCents: 399, stockQuantity: 65 } });
  console.log("Upserted: Sambal Oelek");

  // Gochujang — South Korea / Pastes
  const gochujang = await prisma.product.upsert({
    where: { slug: "gochujang" },
    update: { originCategoryId: southKorea.id, typeCategoryId: pastes.id },
    create: {
      name: "Gochujang", slug: "gochujang", brandName: "Haechandle",
      description: "Korean fermented red chilli paste with a deep, complex heat. The cornerstone of Korean cuisine.",
      countryOfOrigin: "KR",
      imageUrl: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&auto=format&fit=crop",
      originCategoryId: southKorea.id, typeCategoryId: pastes.id, isActive: true,
    },
  });
  await upsertDietaryLabel(gochujang.id, DietaryLabel.VEGAN);
  await upsertAllergen(gochujang.id, AllergenType.SOYBEANS);
  await upsertAllergen(gochujang.id, AllergenType.GLUTEN);
  await prisma.productVariant.upsert({ where: { sku: "SAUCE-GOCHUJANG-200G" }, update: { stockQuantity: 90 }, create: { productId: gochujang.id, sku: "SAUCE-GOCHUJANG-200G", label: "200g", weightGrams: 200, priceEuroCents: 349, stockQuantity: 90 } });
  await prisma.productVariant.upsert({ where: { sku: "SAUCE-GOCHUJANG-500G" }, update: { stockQuantity: 45 }, create: { productId: gochujang.id, sku: "SAUCE-GOCHUJANG-500G", label: "500g", weightGrams: 500, priceEuroCents: 649, stockQuantity: 45 } });
  console.log("Upserted: Gochujang");

  // Soy Sauce — Japan / Sauces & Condiments
  const soySauce = await prisma.product.upsert({
    where: { slug: "soy-sauce" },
    update: { originCategoryId: japan.id, typeCategoryId: saucesCondiments.id },
    create: {
      name: "Soy Sauce", slug: "soy-sauce", brandName: "Kikkoman",
      description: "Classic Japanese naturally brewed soy sauce, fermented for months from whole soybeans and wheat. The essential Asian seasoning.",
      countryOfOrigin: "JP",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
      originCategoryId: japan.id, typeCategoryId: saucesCondiments.id, isActive: true,
    },
  });
  await upsertAllergen(soySauce.id, AllergenType.SOYBEANS);
  await upsertAllergen(soySauce.id, AllergenType.GLUTEN);
  await prisma.productVariant.upsert({ where: { sku: "SOYSAUCE-150ML" }, update: { stockQuantity: 150, volumeMl: 150 }, create: { productId: soySauce.id, sku: "SOYSAUCE-150ML", label: "150ml", weightGrams: 190, volumeMl: 150, priceEuroCents: 299, stockQuantity: 150 } });
  await prisma.productVariant.upsert({ where: { sku: "SOYSAUCE-500ML" }, update: { stockQuantity: 90, volumeMl: 500 }, create: { productId: soySauce.id, sku: "SOYSAUCE-500ML", label: "500ml", weightGrams: 590, volumeMl: 500, priceEuroCents: 699, stockQuantity: 90 } });
  console.log("Upserted: Soy Sauce");

  // Sesame Oil — Japan / Oils & Vinegars
  const sesameOil = await prisma.product.upsert({
    where: { slug: "sesame-oil" },
    update: { originCategoryId: japan.id, typeCategoryId: oilsVinegars.id },
    create: {
      name: "Sesame Oil", slug: "sesame-oil", brandName: "Kadoya",
      description: "Pure Japanese toasted sesame oil with a rich, nutty aroma. A few drops finish stir-fries, noodles and dipping sauces.",
      countryOfOrigin: "JP",
      imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop",
      originCategoryId: japan.id, typeCategoryId: oilsVinegars.id, isActive: true,
    },
  });
  await upsertDietaryLabel(sesameOil.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(sesameOil.id, DietaryLabel.GLUTEN_FREE);
  await upsertAllergen(sesameOil.id, AllergenType.SESAME);
  await prisma.productVariant.upsert({ where: { sku: "SESAMEOIL-100ML" }, update: { stockQuantity: 80, volumeMl: 100 }, create: { productId: sesameOil.id, sku: "SESAMEOIL-100ML", label: "100ml", weightGrams: 120, volumeMl: 100, priceEuroCents: 399, stockQuantity: 80 } });
  await prisma.productVariant.upsert({ where: { sku: "SESAMEOIL-250ML" }, update: { stockQuantity: 50, volumeMl: 250 }, create: { productId: sesameOil.id, sku: "SESAMEOIL-250ML", label: "250ml", weightGrams: 290, volumeMl: 250, priceEuroCents: 799, stockQuantity: 50 } });
  console.log("Upserted: Sesame Oil");

  // Coconut Milk — Thailand / Sauces & Condiments
  const coconutMilk = await prisma.product.upsert({
    where: { slug: "coconut-milk" },
    update: { originCategoryId: thailand.id, typeCategoryId: saucesCondiments.id },
    create: {
      name: "Coconut Milk", slug: "coconut-milk", brandName: "Chaokoh",
      description: "Full-fat Thai coconut milk made from freshly pressed coconut cream. Creamy base for curries, soups and desserts.",
      countryOfOrigin: "TH",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
      originCategoryId: thailand.id, typeCategoryId: saucesCondiments.id, isActive: true,
    },
  });
  await upsertDietaryLabel(coconutMilk.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(coconutMilk.id, DietaryLabel.GLUTEN_FREE);
  await upsertDietaryLabel(coconutMilk.id, DietaryLabel.DAIRY_FREE);
  await prisma.productVariant.upsert({ where: { sku: "COCONUTMILK-400ML" }, update: { stockQuantity: 120, volumeMl: 400 }, create: { productId: coconutMilk.id, sku: "COCONUTMILK-400ML", label: "400ml", weightGrams: 440, volumeMl: 400, priceEuroCents: 189, stockQuantity: 120 } });
  console.log("Upserted: Coconut Milk");

  // Basmati Rice — India / Grains & Legumes
  const basmatiRice = await prisma.product.upsert({
    where: { slug: "basmati-rice" },
    update: { originCategoryId: india.id, typeCategoryId: grainsLegumes.id },
    create: {
      name: "Basmati Rice", slug: "basmati-rice", brandName: "Tilda",
      description: "Long-grain aged Indian basmati rice with a distinctive nutty aroma. Ideal for biryanis and pilafs.",
      countryOfOrigin: "IN",
      imageUrl: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&auto=format&fit=crop",
      originCategoryId: india.id, typeCategoryId: grainsLegumes.id, isActive: true,
    },
  });
  await upsertDietaryLabel(basmatiRice.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(basmatiRice.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "RICE-BASMATI-1KG" }, update: { stockQuantity: 150 }, create: { productId: basmatiRice.id, sku: "RICE-BASMATI-1KG", label: "1kg", weightGrams: 1000, priceEuroCents: 349, stockQuantity: 150 } });
  await prisma.productVariant.upsert({ where: { sku: "RICE-BASMATI-2KG" }, update: { stockQuantity: 80 }, create: { productId: basmatiRice.id, sku: "RICE-BASMATI-2KG", label: "2kg", weightGrams: 2000, priceEuroCents: 599, stockQuantity: 80 } });
  console.log("Upserted: Basmati Rice");

  // Black Rice — Thailand / Grains & Legumes
  const blackRice = await prisma.product.upsert({
    where: { slug: "black-rice" },
    update: { originCategoryId: thailand.id, typeCategoryId: grainsLegumes.id },
    create: {
      name: "Black Rice", slug: "black-rice", brandName: "Royal Thai",
      description: "Nutty Thai black rice rich in antioxidants. Also called forbidden rice — striking colour and earthy flavour.",
      countryOfOrigin: "TH",
      imageUrl: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&auto=format&fit=crop",
      originCategoryId: thailand.id, typeCategoryId: grainsLegumes.id, isActive: true,
    },
  });
  await upsertDietaryLabel(blackRice.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(blackRice.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "RICE-BLACK-500G" }, update: { stockQuantity: 60 }, create: { productId: blackRice.id, sku: "RICE-BLACK-500G", label: "500g", weightGrams: 500, priceEuroCents: 449, stockQuantity: 60 } });
  console.log("Upserted: Black Rice");

  // Quinoa — Peru / Grains & Legumes
  const quinoa = await prisma.product.upsert({
    where: { slug: "quinoa" },
    update: { originCategoryId: peru.id, typeCategoryId: grainsLegumes.id },
    create: {
      name: "Quinoa", slug: "quinoa", brandName: "Andean Gold",
      description: "Andean white quinoa — a complete protein grain packed with all nine essential amino acids.",
      countryOfOrigin: "PE",
      imageUrl: "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=800&auto=format&fit=crop",
      originCategoryId: peru.id, typeCategoryId: grainsLegumes.id, isActive: true,
    },
  });
  await upsertDietaryLabel(quinoa.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(quinoa.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "GRAIN-QUINOA-500G" }, update: { stockQuantity: 90 }, create: { productId: quinoa.id, sku: "GRAIN-QUINOA-500G", label: "500g", weightGrams: 500, priceEuroCents: 499, stockQuantity: 90 } });
  await prisma.productVariant.upsert({ where: { sku: "GRAIN-QUINOA-1KG" }, update: { stockQuantity: 50 }, create: { productId: quinoa.id, sku: "GRAIN-QUINOA-1KG", label: "1kg", weightGrams: 1000, priceEuroCents: 899, stockQuantity: 50 } });
  console.log("Upserted: Quinoa");

  // Red Lentils — Turkey / Grains & Legumes
  const redLentils = await prisma.product.upsert({
    where: { slug: "red-lentils" },
    update: { originCategoryId: turkey.id, typeCategoryId: grainsLegumes.id },
    create: {
      name: "Red Lentils", slug: "red-lentils", brandName: "Sera",
      description: "Split Turkish red lentils — quick-cooking and perfect for soups, dahls and stews.",
      countryOfOrigin: "TR",
      imageUrl: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&auto=format&fit=crop",
      originCategoryId: turkey.id, typeCategoryId: grainsLegumes.id, isActive: true,
    },
  });
  await upsertDietaryLabel(redLentils.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(redLentils.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "GRAIN-LENTILS-500G" }, update: { stockQuantity: 120 }, create: { productId: redLentils.id, sku: "GRAIN-LENTILS-500G", label: "500g", weightGrams: 500, priceEuroCents: 199, stockQuantity: 120 } });
  await prisma.productVariant.upsert({ where: { sku: "GRAIN-LENTILS-1KG" }, update: { stockQuantity: 70 }, create: { productId: redLentils.id, sku: "GRAIN-LENTILS-1KG", label: "1kg", weightGrams: 1000, priceEuroCents: 349, stockQuantity: 70 } });
  console.log("Upserted: Red Lentils");

  // Tahini — Lebanon / Pastes
  const tahini = await prisma.product.upsert({
    where: { slug: "tahini" },
    update: { originCategoryId: lebanon.id, typeCategoryId: pastes.id },
    create: {
      name: "Tahini", slug: "tahini", brandName: "Al Kanater",
      description: "Smooth Lebanese sesame paste, stone-ground from hulled sesame seeds. Essential for hummus and halva.",
      countryOfOrigin: "LB",
      imageUrl: "https://images.unsplash.com/photo-1612257998531-959d1a5f3f14?w=800&auto=format&fit=crop",
      originCategoryId: lebanon.id, typeCategoryId: pastes.id, isActive: true,
    },
  });
  await upsertDietaryLabel(tahini.id, DietaryLabel.VEGAN);
  await upsertAllergen(tahini.id, AllergenType.SESAME);
  await prisma.productVariant.upsert({ where: { sku: "TAH-300G" }, update: { stockQuantity: 80 }, create: { productId: tahini.id, sku: "TAH-300G", label: "300g", weightGrams: 300, priceEuroCents: 399, stockQuantity: 80 } });
  await prisma.productVariant.upsert({ where: { sku: "TAH-600G" }, update: { stockQuantity: 50 }, create: { productId: tahini.id, sku: "TAH-600G", label: "600g", weightGrams: 600, priceEuroCents: 699, stockQuantity: 50 } });
  console.log("Upserted: Tahini");

  // Harissa Paste — Tunisia / Pastes
  const harissa = await prisma.product.upsert({
    where: { slug: "harissa-paste" },
    update: { originCategoryId: tunisia.id, typeCategoryId: pastes.id },
    create: {
      name: "Harissa Paste", slug: "harissa-paste", brandName: "Mina",
      description: "Fiery Tunisian red chilli paste with caraway, coriander and garlic. The North African condiment of choice.",
      countryOfOrigin: "TN",
      imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&auto=format&fit=crop",
      originCategoryId: tunisia.id, typeCategoryId: pastes.id, isActive: true,
    },
  });
  await upsertDietaryLabel(harissa.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(harissa.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "HARISSA-140G" }, update: { stockQuantity: 70 }, create: { productId: harissa.id, sku: "HARISSA-140G", label: "140g", weightGrams: 140, priceEuroCents: 329, stockQuantity: 70 } });
  console.log("Upserted: Harissa Paste");

  // Pomegranate Molasses — Lebanon / Sauces & Condiments
  const pomMolasses = await prisma.product.upsert({
    where: { slug: "pomegranate-molasses" },
    update: { originCategoryId: lebanon.id, typeCategoryId: saucesCondiments.id },
    create: {
      name: "Pomegranate Molasses", slug: "pomegranate-molasses", brandName: "Cortas",
      description: "Lebanese thick reduction of pomegranate juice — sweet-sour and intensely fruity. Used in salad dressings, marinades and stews.",
      countryOfOrigin: "LB",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
      originCategoryId: lebanon.id, typeCategoryId: saucesCondiments.id, isActive: true,
    },
  });
  await upsertDietaryLabel(pomMolasses.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(pomMolasses.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "POMM-300ML" }, update: { stockQuantity: 45, volumeMl: 300 }, create: { productId: pomMolasses.id, sku: "POMM-300ML", label: "300ml", weightGrams: 380, volumeMl: 300, priceEuroCents: 449, stockQuantity: 45 } });
  console.log("Upserted: Pomegranate Molasses");

  // Za'atar Spice Mix — Jordan / Spices & Herbs
  const zaatar = await prisma.product.upsert({
    where: { slug: "zaatar-spice-mix" },
    update: { originCategoryId: jordan.id, typeCategoryId: spicesHerbs.id },
    create: {
      name: "Za'atar Spice Mix", slug: "zaatar-spice-mix", brandName: "Ziyad",
      description: "Jordanian blend of dried thyme, sumac, sesame seeds and salt. Sprinkle over flatbreads with olive oil.",
      countryOfOrigin: "JO",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      originCategoryId: jordan.id, typeCategoryId: spicesHerbs.id, isActive: true,
    },
  });
  await upsertDietaryLabel(zaatar.id, DietaryLabel.VEGAN);
  await upsertAllergen(zaatar.id, AllergenType.SESAME);
  await prisma.productVariant.upsert({ where: { sku: "ZAATAR-100G" }, update: { stockQuantity: 60 }, create: { productId: zaatar.id, sku: "ZAATAR-100G", label: "100g", weightGrams: 100, priceEuroCents: 349, stockQuantity: 60 } });
  console.log("Upserted: Za'atar Spice Mix");

  // Bulgur Wheat — Turkey / Grains & Legumes
  const bulgur = await prisma.product.upsert({
    where: { slug: "bulgur-wheat" },
    update: { originCategoryId: turkey.id, typeCategoryId: grainsLegumes.id },
    create: {
      name: "Bulgur Wheat", slug: "bulgur-wheat", brandName: "Duru",
      description: "Pre-cooked cracked Turkish wheat — the base of tabbouleh and kibbeh. Cooks in minutes.",
      countryOfOrigin: "TR",
      imageUrl: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&auto=format&fit=crop",
      originCategoryId: turkey.id, typeCategoryId: grainsLegumes.id, isActive: true,
    },
  });
  await upsertDietaryLabel(bulgur.id, DietaryLabel.VEGAN);
  await upsertAllergen(bulgur.id, AllergenType.GLUTEN);
  await prisma.productVariant.upsert({ where: { sku: "BULGUR-500G" }, update: { stockQuantity: 80 }, create: { productId: bulgur.id, sku: "BULGUR-500G", label: "500g", weightGrams: 500, priceEuroCents: 249, stockQuantity: 80 } });
  console.log("Upserted: Bulgur Wheat");

  // Sumac — Turkey / Spices & Herbs
  const sumac = await prisma.product.upsert({
    where: { slug: "sumac" },
    update: { originCategoryId: turkey.id, typeCategoryId: spicesHerbs.id },
    create: {
      name: "Sumac", slug: "sumac", brandName: "Ziyad",
      description: "Tart, ruby-red ground sumac berries from Turkey. Adds a lemony tang to salads, kebabs and labneh.",
      countryOfOrigin: "TR",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      originCategoryId: turkey.id, typeCategoryId: spicesHerbs.id, isActive: true,
    },
  });
  await upsertDietaryLabel(sumac.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(sumac.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "SUMAC-100G" }, update: { stockQuantity: 70 }, create: { productId: sumac.id, sku: "SUMAC-100G", label: "100g", weightGrams: 100, priceEuroCents: 299, stockQuantity: 70 } });
  console.log("Upserted: Sumac");

  // Rose Water — Lebanon / Sauces & Condiments
  const roseWater = await prisma.product.upsert({
    where: { slug: "rose-water" },
    update: { originCategoryId: lebanon.id, typeCategoryId: saucesCondiments.id },
    create: {
      name: "Rose Water", slug: "rose-water", brandName: "Cortas",
      description: "Delicately perfumed Lebanese rose water distilled from Damascene rose petals. Essential for baklava, rice pudding and Turkish delight.",
      countryOfOrigin: "LB",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
      originCategoryId: lebanon.id, typeCategoryId: saucesCondiments.id, isActive: true,
    },
  });
  await upsertDietaryLabel(roseWater.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(roseWater.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "ROSEWATER-250ML" }, update: { stockQuantity: 55, volumeMl: 250 }, create: { productId: roseWater.id, sku: "ROSEWATER-250ML", label: "250ml", weightGrams: 280, volumeMl: 250, priceEuroCents: 349, stockQuantity: 55 } });
  console.log("Upserted: Rose Water");

  // Freekeh — Palestine / Grains & Legumes
  const freekeh = await prisma.product.upsert({
    where: { slug: "freekeh" },
    update: { originCategoryId: palestine.id, typeCategoryId: grainsLegumes.id },
    create: {
      name: "Freekeh", slug: "freekeh", brandName: "Canaan Fair Trade",
      description: "Young green wheat harvested and fire-roasted. Nutty, slightly smoky grain used in Palestinian pilafs and soups.",
      countryOfOrigin: "PS",
      imageUrl: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&auto=format&fit=crop",
      originCategoryId: palestine.id, typeCategoryId: grainsLegumes.id, isActive: true,
    },
  });
  await upsertDietaryLabel(freekeh.id, DietaryLabel.VEGAN);
  await upsertAllergen(freekeh.id, AllergenType.GLUTEN);
  await prisma.productVariant.upsert({ where: { sku: "FREEKEH-500G" }, update: { stockQuantity: 40 }, create: { productId: freekeh.id, sku: "FREEKEH-500G", label: "500g", weightGrams: 500, priceEuroCents: 449, stockQuantity: 40 } });
  console.log("Upserted: Freekeh");

  // Chipotle in Adobo — Mexico / Sauces & Condiments
  const chipotle = await prisma.product.upsert({
    where: { slug: "chipotle-in-adobo" },
    update: { originCategoryId: mexico.id, typeCategoryId: saucesCondiments.id },
    create: {
      name: "Chipotle in Adobo", slug: "chipotle-in-adobo", brandName: "La Morena",
      description: "Smoky Mexican chipotle chillies canned in a tangy adobo sauce. Adds deep smokiness to any dish.",
      countryOfOrigin: "MX",
      imageUrl: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&auto=format&fit=crop",
      originCategoryId: mexico.id, typeCategoryId: saucesCondiments.id, isActive: true,
    },
  });
  await upsertDietaryLabel(chipotle.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(chipotle.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "CHIPOTLE-200G" }, update: { stockQuantity: 65 }, create: { productId: chipotle.id, sku: "CHIPOTLE-200G", label: "200g", weightGrams: 200, priceEuroCents: 299, stockQuantity: 65 } });
  console.log("Upserted: Chipotle in Adobo");

  // Mole Paste — Mexico / Pastes
  const molePaste = await prisma.product.upsert({
    where: { slug: "mole-paste" },
    update: { originCategoryId: mexico.id, typeCategoryId: pastes.id },
    create: {
      name: "Mole Paste", slug: "mole-paste", brandName: "Doña Maria",
      description: "Traditional Mexican mole paste with dried chillies, chocolate, spices and nuts. The complex sauce of Oaxaca.",
      countryOfOrigin: "MX",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
      originCategoryId: mexico.id, typeCategoryId: pastes.id, isActive: true,
    },
  });
  await upsertAllergen(molePaste.id, AllergenType.NUTS);
  await upsertAllergen(molePaste.id, AllergenType.SESAME);
  await prisma.productVariant.upsert({ where: { sku: "MOLE-235G" }, update: { stockQuantity: 35 }, create: { productId: molePaste.id, sku: "MOLE-235G", label: "235g", weightGrams: 235, priceEuroCents: 549, stockQuantity: 35 } });
  console.log("Upserted: Mole Paste");

  // Aji Amarillo Paste — Peru / Pastes
  const ajiAmarillo = await prisma.product.upsert({
    where: { slug: "aji-amarillo-paste" },
    update: { originCategoryId: peru.id, typeCategoryId: pastes.id },
    create: {
      name: "Aji Amarillo Paste", slug: "aji-amarillo-paste", brandName: "Inca's Food",
      description: "Bright yellow Peruvian chilli paste with fruity heat. The defining flavour of Peruvian cuisine.",
      countryOfOrigin: "PE",
      imageUrl: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&auto=format&fit=crop",
      originCategoryId: peru.id, typeCategoryId: pastes.id, isActive: true,
    },
  });
  await upsertDietaryLabel(ajiAmarillo.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(ajiAmarillo.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "AJI-212G" }, update: { stockQuantity: 40 }, create: { productId: ajiAmarillo.id, sku: "AJI-212G", label: "212g", weightGrams: 212, priceEuroCents: 399, stockQuantity: 40 } });
  console.log("Upserted: Aji Amarillo Paste");

  // Black Bean Paste — Brazil / Pastes
  const blackBeanPaste = await prisma.product.upsert({
    where: { slug: "black-bean-paste" },
    update: { originCategoryId: brazil.id, typeCategoryId: pastes.id },
    create: {
      name: "Black Bean Paste", slug: "black-bean-paste", brandName: "Casa Fiesta",
      description: "Brazilian creamy black bean paste seasoned with cumin and garlic. Ready to use in feijoada or as a dip.",
      countryOfOrigin: "BR",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
      originCategoryId: brazil.id, typeCategoryId: pastes.id, isActive: true,
    },
  });
  await upsertDietaryLabel(blackBeanPaste.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(blackBeanPaste.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "BLACKBEAN-400G" }, update: { stockQuantity: 55 }, create: { productId: blackBeanPaste.id, sku: "BLACKBEAN-400G", label: "400g", weightGrams: 400, priceEuroCents: 299, stockQuantity: 55 } });
  console.log("Upserted: Black Bean Paste");

  // Yerba Mate — Argentina / Dried & Preserved
  const yerbaMate = await prisma.product.upsert({
    where: { slug: "yerba-mate" },
    update: { originCategoryId: argentina.id, typeCategoryId: driedPreserved.id },
    create: {
      name: "Yerba Mate", slug: "yerba-mate", brandName: "Cruz de Malta",
      description: "Argentinian dried yerba mate leaves for the traditional South American herbal infusion. Earthy, energising and slightly bitter.",
      countryOfOrigin: "AR",
      imageUrl: "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=800&auto=format&fit=crop",
      originCategoryId: argentina.id, typeCategoryId: driedPreserved.id, isActive: true,
    },
  });
  await upsertDietaryLabel(yerbaMate.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(yerbaMate.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "YERBA-500G" }, update: { stockQuantity: 50 }, create: { productId: yerbaMate.id, sku: "YERBA-500G", label: "500g", weightGrams: 500, priceEuroCents: 699, stockQuantity: 50 } });
  console.log("Upserted: Yerba Mate");

  // Tomatillo Salsa Verde — Mexico / Sauces & Condiments
  const salsaVerde = await prisma.product.upsert({
    where: { slug: "tomatillo-salsa-verde" },
    update: { originCategoryId: mexico.id, typeCategoryId: saucesCondiments.id },
    create: {
      name: "Tomatillo Salsa Verde", slug: "tomatillo-salsa-verde", brandName: "Herdez",
      description: "Tangy Mexican green salsa made from roasted tomatillos, serrano chillies and coriander. Ideal for enchiladas and huevos rancheros.",
      countryOfOrigin: "MX",
      imageUrl: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&auto=format&fit=crop",
      originCategoryId: mexico.id, typeCategoryId: saucesCondiments.id, isActive: true,
    },
  });
  await upsertDietaryLabel(salsaVerde.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(salsaVerde.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "SALSAVERDE-400G" }, update: { stockQuantity: 60 }, create: { productId: salsaVerde.id, sku: "SALSAVERDE-400G", label: "400g", weightGrams: 400, priceEuroCents: 329, stockQuantity: 60 } });
  console.log("Upserted: Tomatillo Salsa Verde");

  // Berbere Spice Mix — Ethiopia / Spices & Herbs
  const berbere = await prisma.product.upsert({
    where: { slug: "berbere-spice-mix" },
    update: { originCategoryId: ethiopia.id, typeCategoryId: spicesHerbs.id },
    create: {
      name: "Berbere Spice Mix", slug: "berbere-spice-mix", brandName: "Teff Love",
      description: "Ethiopian aromatic spice blend of chilli, fenugreek, coriander and cinnamon. The backbone of injera stews.",
      countryOfOrigin: "ET",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      originCategoryId: ethiopia.id, typeCategoryId: spicesHerbs.id, isActive: true,
    },
  });
  await upsertDietaryLabel(berbere.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(berbere.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "BERBERE-75G" }, update: { stockQuantity: 50 }, create: { productId: berbere.id, sku: "BERBERE-75G", label: "75g", weightGrams: 75, priceEuroCents: 399, stockQuantity: 50 } });
  console.log("Upserted: Berbere Spice Mix");

  // Ras el Hanout — Morocco / Spices & Herbs
  const rasElHanout = await prisma.product.upsert({
    where: { slug: "ras-el-hanout" },
    update: { originCategoryId: morocco.id, typeCategoryId: spicesHerbs.id },
    create: {
      name: "Ras el Hanout", slug: "ras-el-hanout", brandName: "Les Moulins Mahjoub",
      description: "Moroccan spice blend meaning 'top of the shop' — a complex mix of up to 30 spices including rose petals.",
      countryOfOrigin: "MA",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      originCategoryId: morocco.id, typeCategoryId: spicesHerbs.id, isActive: true,
    },
  });
  await upsertDietaryLabel(rasElHanout.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(rasElHanout.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "RASELHANOUT-65G" }, update: { stockQuantity: 55 }, create: { productId: rasElHanout.id, sku: "RASELHANOUT-65G", label: "65g", weightGrams: 65, priceEuroCents: 449, stockQuantity: 55 } });
  console.log("Upserted: Ras el Hanout");

  // Palm Oil — Nigeria / Oils & Vinegars
  const palmOil = await prisma.product.upsert({
    where: { slug: "palm-oil" },
    update: { originCategoryId: nigeria.id, typeCategoryId: oilsVinegars.id },
    create: {
      name: "Palm Oil", slug: "palm-oil", brandName: "Zomi",
      description: "Nigerian sustainably-sourced red palm oil with a rich, nutty flavour. Essential for West African soups and stews.",
      countryOfOrigin: "NG",
      imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop",
      originCategoryId: nigeria.id, typeCategoryId: oilsVinegars.id, isActive: true,
    },
  });
  await upsertDietaryLabel(palmOil.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(palmOil.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "PALMOIL-500ML" }, update: { stockQuantity: 45, volumeMl: 500 }, create: { productId: palmOil.id, sku: "PALMOIL-500ML", label: "500ml", weightGrams: 450, volumeMl: 500, priceEuroCents: 549, stockQuantity: 45 } });
  console.log("Upserted: Palm Oil");

  // Ugali Flour — Kenya / Grains & Legumes
  const ugaliFlour = await prisma.product.upsert({
    where: { slug: "ugali-flour" },
    update: { originCategoryId: kenya.id, typeCategoryId: grainsLegumes.id },
    create: {
      name: "Ugali Flour", slug: "ugali-flour", brandName: "Jogoo",
      description: "Kenyan white maize flour for making ugali — the staple East African porridge served with stews.",
      countryOfOrigin: "KE",
      imageUrl: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&auto=format&fit=crop",
      originCategoryId: kenya.id, typeCategoryId: grainsLegumes.id, isActive: true,
    },
  });
  await upsertDietaryLabel(ugaliFlour.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(ugaliFlour.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "UGALI-1KG" }, update: { stockQuantity: 60 }, create: { productId: ugaliFlour.id, sku: "UGALI-1KG", label: "1kg", weightGrams: 1000, priceEuroCents: 279, stockQuantity: 60 } });
  await prisma.productVariant.upsert({ where: { sku: "UGALI-2KG" }, update: { stockQuantity: 30 }, create: { productId: ugaliFlour.id, sku: "UGALI-2KG", label: "2kg", weightGrams: 2000, priceEuroCents: 499, stockQuantity: 30 } });
  console.log("Upserted: Ugali Flour");

  // Peri Peri Sauce — Mozambique / Sauces & Condiments
  const periPeri = await prisma.product.upsert({
    where: { slug: "peri-peri-sauce" },
    update: { originCategoryId: mozambique.id, typeCategoryId: saucesCondiments.id },
    create: {
      name: "Peri Peri Sauce", slug: "peri-peri-sauce", brandName: "Peri Peri Original",
      description: "Mozambican bird's eye chilli hot sauce with lemon, garlic and herbs. The iconic Southern African condiment.",
      countryOfOrigin: "MZ",
      imageUrl: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&auto=format&fit=crop",
      originCategoryId: mozambique.id, typeCategoryId: saucesCondiments.id, isActive: true,
    },
  });
  await upsertDietaryLabel(periPeri.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(periPeri.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "PERIPERI-200ML" }, update: { stockQuantity: 70, volumeMl: 200 }, create: { productId: periPeri.id, sku: "PERIPERI-200ML", label: "200ml", weightGrams: 240, volumeMl: 200, priceEuroCents: 349, stockQuantity: 70 } });
  console.log("Upserted: Peri Peri Sauce");

  // Suya Spice Blend — Nigeria / Spices & Herbs
  const suyaSpice = await prisma.product.upsert({
    where: { slug: "suya-spice-blend" },
    update: { originCategoryId: nigeria.id, typeCategoryId: spicesHerbs.id },
    create: {
      name: "Suya Spice Blend", slug: "suya-spice-blend", brandName: "Mama's Kitchen",
      description: "Nigerian dry spice rub for suya — the iconic West African street skewer. A bold blend of groundnut, ginger, paprika and garlic.",
      countryOfOrigin: "NG",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      originCategoryId: nigeria.id, typeCategoryId: spicesHerbs.id, isActive: true,
    },
  });
  await upsertDietaryLabel(suyaSpice.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(suyaSpice.id, DietaryLabel.GLUTEN_FREE);
  await upsertAllergen(suyaSpice.id, AllergenType.PEANUTS);
  await prisma.productVariant.upsert({ where: { sku: "SUYA-80G" }, update: { stockQuantity: 45 }, create: { productId: suyaSpice.id, sku: "SUYA-80G", label: "80g", weightGrams: 80, priceEuroCents: 449, stockQuantity: 45 } });
  console.log("Upserted: Suya Spice Blend");

  // Truffle Oil — Italy / Oils & Vinegars
  const truffleOil = await prisma.product.upsert({
    where: { slug: "truffle-oil" },
    update: { originCategoryId: italy.id, typeCategoryId: oilsVinegars.id },
    create: {
      name: "Truffle Oil", slug: "truffle-oil", brandName: "Urbani Tartufi",
      description: "Italian extra virgin olive oil infused with black truffle. A few drops transform pasta, eggs or risotto.",
      countryOfOrigin: "IT",
      imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop",
      originCategoryId: italy.id, typeCategoryId: oilsVinegars.id, isActive: true,
    },
  });
  await upsertDietaryLabel(truffleOil.id, DietaryLabel.VEGAN);
  await prisma.productVariant.upsert({ where: { sku: "TRUFFLE-100ML" }, update: { stockQuantity: 35, volumeMl: 100 }, create: { productId: truffleOil.id, sku: "TRUFFLE-100ML", label: "100ml", weightGrams: 110, volumeMl: 100, priceEuroCents: 1299, stockQuantity: 35 } });
  await prisma.productVariant.upsert({ where: { sku: "TRUFFLE-250ML" }, update: { stockQuantity: 20, volumeMl: 250 }, create: { productId: truffleOil.id, sku: "TRUFFLE-250ML", label: "250ml", weightGrams: 270, volumeMl: 250, priceEuroCents: 2699, stockQuantity: 20 } });
  console.log("Upserted: Truffle Oil");

  // Smoked Paprika — Spain / Spices & Herbs
  const smokedPaprika = await prisma.product.upsert({
    where: { slug: "smoked-paprika" },
    update: { originCategoryId: spain.id, typeCategoryId: spicesHerbs.id },
    create: {
      name: "Smoked Paprika", slug: "smoked-paprika", brandName: "La Chinata",
      description: "Spanish pimentón de la Vera — slow-smoked sweet paprika with a distinctive smokiness. Key to chorizo and paella.",
      countryOfOrigin: "ES",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      originCategoryId: spain.id, typeCategoryId: spicesHerbs.id, isActive: true,
    },
  });
  await upsertDietaryLabel(smokedPaprika.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(smokedPaprika.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "PAPRIKA-75G" }, update: { stockQuantity: 90 }, create: { productId: smokedPaprika.id, sku: "PAPRIKA-75G", label: "75g", weightGrams: 75, priceEuroCents: 349, stockQuantity: 90 } });
  console.log("Upserted: Smoked Paprika");

  // Dijon Mustard — France / Sauces & Condiments
  const dijonMustard = await prisma.product.upsert({
    where: { slug: "dijon-mustard" },
    update: { originCategoryId: france.id, typeCategoryId: saucesCondiments.id },
    create: {
      name: "Dijon Mustard", slug: "dijon-mustard", brandName: "Maille",
      description: "Classic French Dijon mustard made from brown mustard seeds and white wine. Sharp, creamy and indispensable.",
      countryOfOrigin: "FR",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
      originCategoryId: france.id, typeCategoryId: saucesCondiments.id, isActive: true,
    },
  });
  await upsertDietaryLabel(dijonMustard.id, DietaryLabel.VEGAN);
  await upsertAllergen(dijonMustard.id, AllergenType.MUSTARD);
  await prisma.productVariant.upsert({ where: { sku: "DIJON-200G" }, update: { stockQuantity: 100 }, create: { productId: dijonMustard.id, sku: "DIJON-200G", label: "200g", weightGrams: 200, priceEuroCents: 299, stockQuantity: 100 } });
  console.log("Upserted: Dijon Mustard");

  // Capers in Brine — Greece / Dried & Preserved
  const capers = await prisma.product.upsert({
    where: { slug: "capers-in-brine" },
    update: { originCategoryId: greece.id, typeCategoryId: driedPreserved.id },
    create: {
      name: "Capers in Brine", slug: "capers-in-brine", brandName: "Gaea",
      description: "Greek small capers preserved in brine — pungent, tangy and salty. Essential for smoked salmon, pasta puttanesca and tartare sauce.",
      countryOfOrigin: "GR",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
      originCategoryId: greece.id, typeCategoryId: driedPreserved.id, isActive: true,
    },
  });
  await upsertDietaryLabel(capers.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(capers.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "CAPERS-100G" }, update: { stockQuantity: 75 }, create: { productId: capers.id, sku: "CAPERS-100G", label: "100g", weightGrams: 100, priceEuroCents: 249, stockQuantity: 75 } });
  console.log("Upserted: Capers in Brine");

  // Anchovy Paste — Portugal / Pastes
  const anchovyPaste = await prisma.product.upsert({
    where: { slug: "anchovy-paste" },
    update: { originCategoryId: portugal.id, typeCategoryId: pastes.id },
    create: {
      name: "Anchovy Paste", slug: "anchovy-paste", brandName: "Comur",
      description: "Portuguese concentrated anchovy paste for adding deep umami to sauces, dressings and braises.",
      countryOfOrigin: "PT",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
      originCategoryId: portugal.id, typeCategoryId: pastes.id, isActive: true,
    },
  });
  await upsertAllergen(anchovyPaste.id, AllergenType.FISH);
  await prisma.productVariant.upsert({ where: { sku: "ANCHOVY-60G" }, update: { stockQuantity: 40 }, create: { productId: anchovyPaste.id, sku: "ANCHOVY-60G", label: "60g", weightGrams: 60, priceEuroCents: 349, stockQuantity: 40 } });
  console.log("Upserted: Anchovy Paste");

  // Miso Paste — Japan / Pastes
  const misoPaste = await prisma.product.upsert({
    where: { slug: "miso-paste" },
    update: { originCategoryId: japan.id, typeCategoryId: pastes.id },
    create: {
      name: "Miso Paste", slug: "miso-paste", brandName: "Hikari",
      description: "Japanese white shiro miso — mild, slightly sweet fermented soybean paste. For miso soup, marinades and dressings.",
      countryOfOrigin: "JP",
      imageUrl: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&auto=format&fit=crop",
      originCategoryId: japan.id, typeCategoryId: pastes.id, isActive: true,
    },
  });
  await upsertDietaryLabel(misoPaste.id, DietaryLabel.VEGAN);
  await upsertAllergen(misoPaste.id, AllergenType.SOYBEANS);
  await prisma.productVariant.upsert({ where: { sku: "MISO-300G" }, update: { stockQuantity: 80 }, create: { productId: misoPaste.id, sku: "MISO-300G", label: "300g", weightGrams: 300, priceEuroCents: 499, stockQuantity: 80 } });
  await prisma.productVariant.upsert({ where: { sku: "MISO-750G" }, update: { stockQuantity: 40 }, create: { productId: misoPaste.id, sku: "MISO-750G", label: "750g", weightGrams: 750, priceEuroCents: 1099, stockQuantity: 40 } });
  console.log("Upserted: Miso Paste");

  // Mirin — Japan / Sauces & Condiments
  const mirin = await prisma.product.upsert({
    where: { slug: "mirin" },
    update: { originCategoryId: japan.id, typeCategoryId: saucesCondiments.id },
    create: {
      name: "Mirin", slug: "mirin", brandName: "Mizkan",
      description: "Japanese sweet rice wine — adds subtle sweetness and gloss to teriyaki, yakitori and simmered dishes.",
      countryOfOrigin: "JP",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
      originCategoryId: japan.id, typeCategoryId: saucesCondiments.id, isActive: true,
    },
  });
  await upsertDietaryLabel(mirin.id, DietaryLabel.VEGAN);
  await prisma.productVariant.upsert({ where: { sku: "MIRIN-300ML" }, update: { stockQuantity: 70, volumeMl: 300 }, create: { productId: mirin.id, sku: "MIRIN-300ML", label: "300ml", weightGrams: 340, volumeMl: 300, priceEuroCents: 399, stockQuantity: 70 } });
  console.log("Upserted: Mirin");

  // Panko Breadcrumbs — Japan / Dried & Preserved
  const panko = await prisma.product.upsert({
    where: { slug: "panko-breadcrumbs" },
    update: { originCategoryId: japan.id, typeCategoryId: driedPreserved.id },
    create: {
      name: "Panko Breadcrumbs", slug: "panko-breadcrumbs", brandName: "Kikkoman",
      description: "Japanese-style coarse breadcrumbs for an extra-crispy coating on katsu, schnitzels and fried foods.",
      countryOfOrigin: "JP",
      imageUrl: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&auto=format&fit=crop",
      originCategoryId: japan.id, typeCategoryId: driedPreserved.id, isActive: true,
    },
  });
  await upsertDietaryLabel(panko.id, DietaryLabel.VEGAN);
  await upsertAllergen(panko.id, AllergenType.GLUTEN);
  await prisma.productVariant.upsert({ where: { sku: "PANKO-200G" }, update: { stockQuantity: 100 }, create: { productId: panko.id, sku: "PANKO-200G", label: "200g", weightGrams: 200, priceEuroCents: 249, stockQuantity: 100 } });
  console.log("Upserted: Panko Breadcrumbs");

  // Dashi Stock Powder — Japan / Dried & Preserved
  const dashiPowder = await prisma.product.upsert({
    where: { slug: "dashi-stock-powder" },
    update: { originCategoryId: japan.id, typeCategoryId: driedPreserved.id },
    create: {
      name: "Dashi Stock Powder", slug: "dashi-stock-powder", brandName: "Ajinomoto",
      description: "Instant Japanese dashi made from dried bonito flakes and kombu kelp. The umami foundation of Japanese cooking.",
      countryOfOrigin: "JP",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      originCategoryId: japan.id, typeCategoryId: driedPreserved.id, isActive: true,
    },
  });
  await upsertAllergen(dashiPowder.id, AllergenType.FISH);
  await prisma.productVariant.upsert({ where: { sku: "DASHI-50G" }, update: { stockQuantity: 60 }, create: { productId: dashiPowder.id, sku: "DASHI-50G", label: "50g (24 sachets)", weightGrams: 50, priceEuroCents: 449, stockQuantity: 60 } });
  console.log("Upserted: Dashi Stock Powder");

  // Yuzu Kosho — Japan / Pastes
  const yuzuKosho = await prisma.product.upsert({
    where: { slug: "yuzu-kosho" },
    update: { originCategoryId: japan.id, typeCategoryId: pastes.id },
    create: {
      name: "Yuzu Kosho", slug: "yuzu-kosho", brandName: "S&B",
      description: "Japanese fermented condiment of yuzu zest and green chilli. Intensely aromatic with a citrusy heat.",
      countryOfOrigin: "JP",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      originCategoryId: japan.id, typeCategoryId: pastes.id, isActive: true,
    },
  });
  await upsertDietaryLabel(yuzuKosho.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(yuzuKosho.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "YUZU-50G" }, update: { stockQuantity: 30 }, create: { productId: yuzuKosho.id, sku: "YUZU-50G", label: "50g", weightGrams: 50, priceEuroCents: 699, stockQuantity: 30 } });
  console.log("Upserted: Yuzu Kosho");

  // Rice Vinegar — Japan / Oils & Vinegars
  const riceVinegar = await prisma.product.upsert({
    where: { slug: "rice-vinegar" },
    update: { originCategoryId: japan.id, typeCategoryId: oilsVinegars.id },
    create: {
      name: "Rice Vinegar", slug: "rice-vinegar", brandName: "Mizkan",
      description: "Mild Japanese rice vinegar with a clean, slightly sweet acidity. Used for sushi rice, pickles and dressings.",
      countryOfOrigin: "JP",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
      originCategoryId: japan.id, typeCategoryId: oilsVinegars.id, isActive: true,
    },
  });
  await upsertDietaryLabel(riceVinegar.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(riceVinegar.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "RICEVINEGAR-200ML" }, update: { stockQuantity: 80, volumeMl: 200 }, create: { productId: riceVinegar.id, sku: "RICEVINEGAR-200ML", label: "200ml", weightGrams: 240, volumeMl: 200, priceEuroCents: 299, stockQuantity: 80 } });
  await prisma.productVariant.upsert({ where: { sku: "RICEVINEGAR-500ML" }, update: { stockQuantity: 50, volumeMl: 500 }, create: { productId: riceVinegar.id, sku: "RICEVINEGAR-500ML", label: "500ml", weightGrams: 580, volumeMl: 500, priceEuroCents: 599, stockQuantity: 50 } });
  console.log("Upserted: Rice Vinegar");

  // Nori Sheets — Japan / Dried & Preserved
  const noriSheets = await prisma.product.upsert({
    where: { slug: "nori-sheets" },
    update: { originCategoryId: japan.id, typeCategoryId: driedPreserved.id },
    create: {
      name: "Nori Sheets", slug: "nori-sheets", brandName: "Yamamotoyama",
      description: "Premium Japanese roasted seaweed sheets for sushi, onigiri and garnishes. Crispy, umami-rich, and paper-thin.",
      countryOfOrigin: "JP",
      imageUrl: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&auto=format&fit=crop",
      originCategoryId: japan.id, typeCategoryId: driedPreserved.id, isActive: true,
    },
  });
  await upsertDietaryLabel(noriSheets.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(noriSheets.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "NORI-10SHEETS" }, update: { stockQuantity: 90 }, create: { productId: noriSheets.id, sku: "NORI-10SHEETS", label: "10 sheets (22g)", weightGrams: 22, priceEuroCents: 349, stockQuantity: 90 } });
  await prisma.productVariant.upsert({ where: { sku: "NORI-50SHEETS" }, update: { stockQuantity: 45 }, create: { productId: noriSheets.id, sku: "NORI-50SHEETS", label: "50 sheets (110g)", weightGrams: 110, priceEuroCents: 1399, stockQuantity: 45 } });
  console.log("Upserted: Nori Sheets");

  // Shichimi Togarashi — Japan / Spices & Herbs
  const shichimi = await prisma.product.upsert({
    where: { slug: "shichimi-togarashi" },
    update: { originCategoryId: japan.id, typeCategoryId: spicesHerbs.id },
    create: {
      name: "Shichimi Togarashi", slug: "shichimi-togarashi", brandName: "S&B",
      description: "Japanese seven-spice blend of chilli, orange peel, black sesame, white sesame, hemp, ginger and nori. Sprinkle on noodles, gyoza and grilled meats.",
      countryOfOrigin: "JP",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      originCategoryId: japan.id, typeCategoryId: spicesHerbs.id, isActive: true,
    },
  });
  await upsertDietaryLabel(shichimi.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(shichimi.id, DietaryLabel.GLUTEN_FREE);
  await upsertAllergen(shichimi.id, AllergenType.SESAME);
  await prisma.productVariant.upsert({ where: { sku: "SHICHIMI-15G" }, update: { stockQuantity: 80 }, create: { productId: shichimi.id, sku: "SHICHIMI-15G", label: "15g", weightGrams: 15, priceEuroCents: 299, stockQuantity: 80 } });
  await prisma.productVariant.upsert({ where: { sku: "SHICHIMI-30G" }, update: { stockQuantity: 50 }, create: { productId: shichimi.id, sku: "SHICHIMI-30G", label: "30g", weightGrams: 30, priceEuroCents: 499, stockQuantity: 50 } });
  console.log("Upserted: Shichimi Togarashi");

  // Garam Masala — India / Spices & Herbs
  const garamMasala = await prisma.product.upsert({
    where: { slug: "garam-masala" },
    update: { originCategoryId: india.id, typeCategoryId: spicesHerbs.id },
    create: {
      name: "Garam Masala", slug: "garam-masala", brandName: "MDH",
      description: "Aromatic North Indian spice blend of cardamom, cinnamon, cloves and black pepper. The finishing spice of Indian cooking.",
      countryOfOrigin: "IN",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      originCategoryId: india.id, typeCategoryId: spicesHerbs.id, isActive: true,
    },
  });
  await upsertDietaryLabel(garamMasala.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(garamMasala.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "GARAM-100G" }, update: { stockQuantity: 100 }, create: { productId: garamMasala.id, sku: "GARAM-100G", label: "100g", weightGrams: 100, priceEuroCents: 299, stockQuantity: 100 } });
  await prisma.productVariant.upsert({ where: { sku: "GARAM-250G" }, update: { stockQuantity: 60 }, create: { productId: garamMasala.id, sku: "GARAM-250G", label: "250g", weightGrams: 250, priceEuroCents: 599, stockQuantity: 60 } });
  console.log("Upserted: Garam Masala");

  // Curry Leaves Dried — India / Dried & Preserved
  const curryLeaves = await prisma.product.upsert({
    where: { slug: "curry-leaves-dried" },
    update: { originCategoryId: india.id, typeCategoryId: driedPreserved.id },
    create: {
      name: "Curry Leaves Dried", slug: "curry-leaves-dried", brandName: "Eastern",
      description: "Sun-dried South Indian curry leaves with an intense, aromatic flavour. Fry in oil before adding other ingredients.",
      countryOfOrigin: "IN",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      originCategoryId: india.id, typeCategoryId: driedPreserved.id, isActive: true,
    },
  });
  await upsertDietaryLabel(curryLeaves.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(curryLeaves.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "CURRYLEAVES-20G" }, update: { stockQuantity: 70 }, create: { productId: curryLeaves.id, sku: "CURRYLEAVES-20G", label: "20g", weightGrams: 20, priceEuroCents: 199, stockQuantity: 70 } });
  console.log("Upserted: Curry Leaves Dried");

  // Tamarind Paste — India / Pastes
  const tamarindPaste = await prisma.product.upsert({
    where: { slug: "tamarind-paste" },
    update: { originCategoryId: india.id, typeCategoryId: pastes.id },
    create: {
      name: "Tamarind Paste", slug: "tamarind-paste", brandName: "Patak's",
      description: "Indian concentrated tamarind paste with a sharp, sweet-sour tang. Essential for chutneys, pad thai and sambar.",
      countryOfOrigin: "IN",
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
      originCategoryId: india.id, typeCategoryId: pastes.id, isActive: true,
    },
  });
  await upsertDietaryLabel(tamarindPaste.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(tamarindPaste.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "TAMARIND-200G" }, update: { stockQuantity: 75 }, create: { productId: tamarindPaste.id, sku: "TAMARIND-200G", label: "200g", weightGrams: 200, priceEuroCents: 299, stockQuantity: 75 } });
  console.log("Upserted: Tamarind Paste");

  // Fenugreek Seeds — India / Spices & Herbs
  const fenugreek = await prisma.product.upsert({
    where: { slug: "fenugreek-seeds" },
    update: { originCategoryId: india.id, typeCategoryId: spicesHerbs.id },
    create: {
      name: "Fenugreek Seeds", slug: "fenugreek-seeds", brandName: "Barts",
      description: "Whole Indian fenugreek seeds with a bitter, slightly maple-like flavour. Used in tadka, pickles and spice blends.",
      countryOfOrigin: "IN",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      originCategoryId: india.id, typeCategoryId: spicesHerbs.id, isActive: true,
    },
  });
  await upsertDietaryLabel(fenugreek.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(fenugreek.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "FENUGREEK-100G" }, update: { stockQuantity: 80 }, create: { productId: fenugreek.id, sku: "FENUGREEK-100G", label: "100g", weightGrams: 100, priceEuroCents: 179, stockQuantity: 80 } });
  console.log("Upserted: Fenugreek Seeds");

  // Amchur Powder — India / Spices & Herbs
  const amchur = await prisma.product.upsert({
    where: { slug: "amchur-powder" },
    update: { originCategoryId: india.id, typeCategoryId: spicesHerbs.id },
    create: {
      name: "Amchur Powder", slug: "amchur-powder", brandName: "MDH",
      description: "Indian dried green mango powder — adds a tart, fruity sourness to chaat, chutneys and marinades.",
      countryOfOrigin: "IN",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      originCategoryId: india.id, typeCategoryId: spicesHerbs.id, isActive: true,
    },
  });
  await upsertDietaryLabel(amchur.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(amchur.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "AMCHUR-100G" }, update: { stockQuantity: 65 }, create: { productId: amchur.id, sku: "AMCHUR-100G", label: "100g", weightGrams: 100, priceEuroCents: 229, stockQuantity: 65 } });
  console.log("Upserted: Amchur Powder");

  // Turmeric Powder — India / Spices & Herbs
  const turmeric = await prisma.product.upsert({
    where: { slug: "turmeric-powder" },
    update: { originCategoryId: india.id, typeCategoryId: spicesHerbs.id },
    create: {
      name: "Turmeric Powder", slug: "turmeric-powder", brandName: "MDH",
      description: "Vibrant Indian ground turmeric with earthy, warm notes and a deep golden colour. Staple of Indian cooking and golden milk.",
      countryOfOrigin: "IN",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      originCategoryId: india.id, typeCategoryId: spicesHerbs.id, isActive: true,
    },
  });
  await upsertDietaryLabel(turmeric.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(turmeric.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "TURMERIC-100G" }, update: { stockQuantity: 110 }, create: { productId: turmeric.id, sku: "TURMERIC-100G", label: "100g", weightGrams: 100, priceEuroCents: 199, stockQuantity: 110 } });
  await prisma.productVariant.upsert({ where: { sku: "TURMERIC-200G" }, update: { stockQuantity: 70 }, create: { productId: turmeric.id, sku: "TURMERIC-200G", label: "200g", weightGrams: 200, priceEuroCents: 349, stockQuantity: 70 } });
  console.log("Upserted: Turmeric Powder");

  // Cardamom Pods — India / Spices & Herbs
  const cardamom = await prisma.product.upsert({
    where: { slug: "cardamom-pods" },
    update: { originCategoryId: india.id, typeCategoryId: spicesHerbs.id },
    create: {
      name: "Cardamom Pods", slug: "cardamom-pods", brandName: "Rajah",
      description: "Whole green cardamom pods from Kerala with an intense floral, citrusy warmth. Grind fresh for chai, biryanis and Scandinavian pastries.",
      countryOfOrigin: "IN",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      originCategoryId: india.id, typeCategoryId: spicesHerbs.id, isActive: true,
    },
  });
  await upsertDietaryLabel(cardamom.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(cardamom.id, DietaryLabel.GLUTEN_FREE);
  await prisma.productVariant.upsert({ where: { sku: "CARDAMOM-50G" }, update: { stockQuantity: 65 }, create: { productId: cardamom.id, sku: "CARDAMOM-50G", label: "50g", weightGrams: 50, priceEuroCents: 399, stockQuantity: 65 } });
  await prisma.productVariant.upsert({ where: { sku: "CARDAMOM-100G" }, update: { stockQuantity: 40 }, create: { productId: cardamom.id, sku: "CARDAMOM-100G", label: "100g", weightGrams: 100, priceEuroCents: 699, stockQuantity: 40 } });
  console.log("Upserted: Cardamom Pods");

  // Black Mustard Seeds — India / Spices & Herbs
  const mustardSeeds = await prisma.product.upsert({
    where: { slug: "black-mustard-seeds" },
    update: { originCategoryId: india.id, typeCategoryId: spicesHerbs.id },
    create: {
      name: "Black Mustard Seeds", slug: "black-mustard-seeds", brandName: "Rajah",
      description: "Whole Indian black mustard seeds — the essential first step in any tadka. Toast in oil until they pop and release their nutty aroma.",
      countryOfOrigin: "IN",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      originCategoryId: india.id, typeCategoryId: spicesHerbs.id, isActive: true,
    },
  });
  await upsertDietaryLabel(mustardSeeds.id, DietaryLabel.VEGAN);
  await upsertDietaryLabel(mustardSeeds.id, DietaryLabel.GLUTEN_FREE);
  await upsertAllergen(mustardSeeds.id, AllergenType.MUSTARD);
  await prisma.productVariant.upsert({ where: { sku: "MUSTARDSEEDS-100G" }, update: { stockQuantity: 90 }, create: { productId: mustardSeeds.id, sku: "MUSTARDSEEDS-100G", label: "100g", weightGrams: 100, priceEuroCents: 149, stockQuantity: 90 } });
  await prisma.productVariant.upsert({ where: { sku: "MUSTARDSEEDS-250G" }, update: { stockQuantity: 55 }, create: { productId: mustardSeeds.id, sku: "MUSTARDSEEDS-250G", label: "250g", weightGrams: 250, priceEuroCents: 299, stockQuantity: 55 } });
  console.log("Upserted: Black Mustard Seeds");

  console.log("\nSeed complete. 40 categories (8 regions + 26 countries + 6 types), 54 products.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
