// Shared TypeScript types for FoodMarket.
// Used by both the storefront and admin packages — do NOT import from @prisma/client here.

// ─── Enums (as string union types) ────────────────────────────────────────────

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type DietaryLabel =
  | 'VEGAN'
  | 'VEGETARIAN'
  | 'HALAL'
  | 'KOSHER'
  | 'GLUTEN_FREE'
  | 'DAIRY_FREE'
  | 'NUT_FREE';

export type AllergenType =
  | 'GLUTEN'
  | 'CRUSTACEANS'
  | 'EGGS'
  | 'FISH'
  | 'PEANUTS'
  | 'SOYBEANS'
  | 'MILK'
  | 'NUTS'
  | 'CELERY'
  | 'MUSTARD'
  | 'SESAME'
  | 'SULPHITES'
  | 'LUPIN'
  | 'MOLLUSCS';

// ─── Product types ─────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count?: { products: number };
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
  allergens: Array<{ id: string; allergen: AllergenType }>;
  dietaryLabels: Array<{ id: string; label: DietaryLabel }>;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  variantId: string;
  productName: string;
  variantLabel: string;
  imageUrl?: string | null;
  unitPriceEuroCents: number;
  quantity: number;
  maxStock: number;
}

// ─── Customer / Auth types ─────────────────────────────────────────────────────

export interface AuthCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  isAdmin: boolean;
}

export interface AdminCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

// ─── Address ───────────────────────────────────────────────────────────────────

export interface Address {
  id: string;
  street: string;
  houseNumber: string;
  houseNumberAddition: string | null;
  postalCode: string;
  city: string;
  country: string;
  isDefault: boolean;
}

// ─── Order types ───────────────────────────────────────────────────────────────

export interface OrderLine {
  id: string;
  quantity: number;
  unitPriceEuroCents: number;
  variant: { label: string; product: { name: string } };
}

export interface OrderEvent {
  id: string;
  eventType: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus | null;
  note: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  status: OrderStatus;
  totalEuroCents: number;
  shippingCents: number;
  createdAt: string;
  customer: { firstName: string; lastName: string; email: string };
  shippingAddress: Address;
  lines: OrderLine[];
  events: OrderEvent[];
}

// ─── Paginated API response ────────────────────────────────────────────────────

export interface PagedResponse<T> {
  data: T[];
  nextCursor: string | null;
  total: number;
}

export interface ApiResponse<T> {
  data: T;
}
