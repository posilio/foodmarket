// Typed fetch client for all admin API calls.
// Every request from the admin app must go through this module.

const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

// ─── Shared types ─────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED'
  | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export interface OrderSummary {
  id: string;
  status: OrderStatus;
  totalEuroCents: number;
  createdAt: string;
  customer: { firstName: string; lastName: string; email: string };
}

export interface OrderLine {
  id: string;
  quantity: number;
  unitPriceEuroCents: number;
  variant: { label: string; product: { name: string } };
}

export interface OrderEvent {
  id: string;
  eventType: string;
  fromStatus: string | null;
  toStatus: string | null;
  note: string | null;
  createdAt: string;
}

export interface ShippingAddress {
  street: string;
  houseNumber: string;
  houseNumberAddition: string | null;
  postalCode: string;
  city: string;
  country: string;
}

export interface OrderDetail extends OrderSummary {
  shippingAddress: ShippingAddress;
  lines: OrderLine[];
  events: OrderEvent[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  ean?: string | null;
  label: string;
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
  category: { id: string; name: string };
  variants: ProductVariant[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface CreateProductBody {
  name: string;
  description?: string;
  imageUrl?: string;
  countryOfOrigin: string;
  categoryId: string;
  variants: Array<{
    sku: string;
    label: string;
    weightGrams?: number;
    priceEuroCents: number;
    stockQuantity: number;
  }>;
}

export interface UpdateProductBody {
  name?: string;
  description?: string;
  imageUrl?: string;
  countryOfOrigin?: string;
  categoryId?: string;
  isActive?: boolean;
}

export interface AddVariantBody {
  sku: string;
  label: string;
  weightGrams?: number;
  priceEuroCents: number;
  stockQuantity?: number;
}

export interface UpdateVariantBody {
  label?: string;
  priceEuroCents?: number;
  isActive?: boolean;
  ean?: string | null;
}

export interface ImportLine {
  ean: string;
  description: string;
  quantity: number;
  unitPriceEuroCents: number;
}

export interface ImportPreviewResult {
  matched: Array<{
    ean: string;
    description: string;
    productName: string;
    variantLabel: string;
    variantId: string;
    currentStock: number;
    incomingQuantity: number;
    newStock: number;
    unitPriceEuroCents: number;
  }>;
  unmatched: Array<{
    ean: string;
    description: string;
    quantity: number;
    unitPriceEuroCents: number;
  }>;
}

export interface CustomerSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  orderCount: number;
  totalSpentEuroCents: number;
}

export interface CustomerOrder {
  id: string;
  status: string;
  totalEuroCents: number;
  createdAt: string;
}

export interface CustomerAddress {
  id: string;
  street: string;
  houseNumber: string;
  houseNumberAddition: string | null;
  postalCode: string;
  city: string;
  country: string;
  isDefault: boolean;
}

export type DiscountType = 'FLAT' | 'PERCENTAGE';

export interface DiscountCode {
  id: string;
  code: string;
  type: DiscountType;
  amountCents: number | null;
  percent: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateDiscountCodeBody {
  code: string;
  type: DiscountType;
  amountCents?: number;
  percent?: number;
  maxUses?: number;
  expiresAt?: string;
}

export interface LowStockVariant {
  id: string;
  sku: string;
  label: string;
  stockQuantity: number;
  product: { name: string; slug: string };
}

export interface CustomerDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: string;
  orders: CustomerOrder[];
  addresses: CustomerAddress[];
}

// ─── Paginated response ───────────────────────────────────────────────────────

export interface PagedResponse<T> {
  data: T[];
  nextCursor: string | null;
  total: number;
}

// ─── Internal fetch wrapper ───────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function buildPaginatedUrl(base: string, params: { cursor?: string; limit?: number; [key: string]: string | number | undefined }): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) qs.set(k, String(v));
  }
  const q = qs.toString();
  return q ? `${base}?${q}` : base;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const adminApi = {
  orders: {
    list(
      token: string,
      status?: string,
      cursor?: string,
      limit?: number
    ): Promise<PagedResponse<OrderSummary>> {
      const url = buildPaginatedUrl('/api/v1/admin/orders', { status, cursor, limit });
      return apiFetch(url, token);
    },

    get(token: string, id: string): Promise<{ data: OrderDetail }> {
      return apiFetch(`/api/v1/admin/orders/${id}`, token);
    },

    updateStatus(token: string, id: string, status: string): Promise<{ data: OrderDetail }> {
      return apiFetch(`/api/v1/admin/orders/${id}/status`, token, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
  },

  products: {
    list(token: string, cursor?: string, limit?: number): Promise<PagedResponse<Product>> {
      const url = buildPaginatedUrl('/api/v1/admin/products', { cursor, limit });
      return apiFetch(url, token);
    },

    create(token: string, body: CreateProductBody): Promise<{ data: Product }> {
      return apiFetch('/api/v1/admin/products', token, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },

    update(token: string, id: string, body: UpdateProductBody): Promise<{ data: Product }> {
      return apiFetch(`/api/v1/admin/products/${id}`, token, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
    },

    addVariant(token: string, productId: string, body: AddVariantBody): Promise<{ data: ProductVariant }> {
      return apiFetch(`/api/v1/admin/products/${productId}/variants`, token, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },

    updateVariant(
      token: string,
      productId: string,
      variantId: string,
      body: UpdateVariantBody
    ): Promise<{ data: ProductVariant }> {
      return apiFetch(`/api/v1/admin/products/${productId}/variants/${variantId}`, token, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
    },

    updateStock(
      token: string,
      productId: string,
      variantId: string,
      stockQuantity: number
    ): Promise<{ data: ProductVariant }> {
      return apiFetch(`/api/v1/admin/products/${productId}/stock`, token, {
        method: 'PATCH',
        body: JSON.stringify({ variantId, stockQuantity }),
      });
    },

    listCategories(token: string): Promise<{ data: Category[] }> {
      return apiFetch('/api/v1/admin/categories', token);
    },

    lowStock(token: string, threshold?: number): Promise<{ data: LowStockVariant[]; count: number }> {
      const url = threshold !== undefined
        ? `/api/v1/admin/products/low-stock?threshold=${threshold}`
        : '/api/v1/admin/products/low-stock';
      return apiFetch(url, token);
    },
  },

  upload: {
    image(token: string, file: File): Promise<{ data: { url: string } }> {
      const fd = new FormData();
      fd.append('image', file);
      // Do NOT set Content-Type — let fetch set it with the multipart boundary.
      return fetch(`${BASE}/api/v1/admin/upload/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      }).then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
        }
        return res.json() as Promise<{ data: { url: string } }>;
      });
    },
  },

  import: {
    parsePdf(token: string, file: File): Promise<{ data: { lines: ImportLine[] } }> {
      const fd = new FormData();
      fd.append('image', file);
      // Do NOT set Content-Type — let fetch set it with the multipart boundary.
      return fetch(`${BASE}/api/v1/admin/import/parse-pdf`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      }).then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
        }
        return res.json() as Promise<{ data: { lines: ImportLine[] } }>;
      });
    },

    preview(token: string, lines: ImportLine[]): Promise<{ data: ImportPreviewResult }> {
      return apiFetch('/api/v1/admin/import/preview', token, {
        method: 'POST',
        body: JSON.stringify({ lines }),
      });
    },

    confirm(
      token: string,
      lines: Array<{ variantId: string; quantity: number }>
    ): Promise<{ data: { updated: number } }> {
      return apiFetch('/api/v1/admin/import/confirm', token, {
        method: 'POST',
        body: JSON.stringify({ lines }),
      });
    },
  },

  customers: {
    list(token: string, cursor?: string, limit?: number): Promise<PagedResponse<CustomerSummary>> {
      const url = buildPaginatedUrl('/api/v1/admin/customers', { cursor, limit });
      return apiFetch(url, token);
    },

    get(token: string, id: string): Promise<{ data: CustomerDetail }> {
      return apiFetch(`/api/v1/admin/customers/${id}`, token);
    },
  },

  discountCodes: {
    list(token: string): Promise<{ data: DiscountCode[] }> {
      return apiFetch('/api/v1/admin/discount-codes', token);
    },

    create(token: string, body: CreateDiscountCodeBody): Promise<{ data: DiscountCode }> {
      return apiFetch('/api/v1/admin/discount-codes', token, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },

    setActive(token: string, id: string, isActive: boolean): Promise<{ data: DiscountCode }> {
      return apiFetch(`/api/v1/admin/discount-codes/${id}`, token, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      });
    },
  },

  auth: {
    login(email: string, password: string): Promise<{ data: { token: string; refreshToken: string; customer: CustomerSummary } }> {
      return fetch(`${BASE}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }).then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { message?: string }).message ?? 'Login failed');
        }
        return res.json();
      });
    },
  },
};
