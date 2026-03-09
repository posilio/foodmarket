// Shared TypeScript types for storefront API responses.
// These must stay in sync with the Prisma schema and backend responses.

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: { products: number };
}

export interface Allergen {
  id: string;
  allergen: string;
}

export interface DietaryLabel {
  id: string;
  label: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  label: string;
  weightGrams: number | null;
  priceEuroCents: number;
  stockQuantity: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  countryOfOrigin: string;
  isActive: boolean;
  category: Category;
  variants: ProductVariant[];
  allergens: Allergen[];
  dietaryLabels: DietaryLabel[];
}

export interface ApiResponse<T> {
  data: T;
}
