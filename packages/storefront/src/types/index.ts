// Shared TypeScript types for storefront API responses.
// These must stay in sync with the Prisma schema and backend responses.

export type CategoryType = 'ORIGIN_REGION' | 'ORIGIN_COUNTRY' | 'PRODUCT_TYPE';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  emoji: string | null;
  type: CategoryType;
  parentId: string | null;
  children?: Category[];
  _count?: { products: number };
}

export interface CategoryTree {
  originRegions: Array<Category & { children: Category[] }>;
  productTypes: Category[];
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
  countryOfOrigin: string | null;
  isActive: boolean;
  category: Category;
  typeCategory: Category | null;
  variants: ProductVariant[];
  allergens: Allergen[];
  dietaryLabels: DietaryLabel[];
}

export interface ApiResponse<T> {
  data: T;
}

export interface Review {
  id: string;
  rating: number;
  body: string | null;
  createdAt: string;
  customer: { firstName: string };
}

export interface ReviewsResponse {
  reviews: Review[];
  averageRating: number | null;
  totalReviews: number;
}
