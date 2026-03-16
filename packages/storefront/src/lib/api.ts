// Typed fetch wrapper for calling the backend API from the storefront.
// All data fetching goes through these functions — never call the backend directly from pages.
import type { ApiResponse, Category, Product } from "../types";

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set. Add it to packages/storefront/.env.local"
    );
  }
  return url;
}

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, options);
  if (!res.ok) {
    throw new Error(`API error ${res.status} for ${path}`);
  }
  return res.json() as Promise<T>;
}

// Products list now returns paginated shape — pass limit=200 so all active products are returned
// for the server-rendered storefront listing page (storefront has no client-side load-more).
export async function getProducts(categorySlug?: string): Promise<Product[]> {
  const params = new URLSearchParams({ limit: "200" });
  if (categorySlug) params.set("category", categorySlug);
  const data = await apiFetch<ApiResponse<Product[]> & { nextCursor: string | null; total: number }>(
    `/api/v1/products?${params.toString()}`,
    { cache: "no-store" }
  );
  return data.data;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const res = await fetch(
    `${getBaseUrl()}/api/v1/products/${encodeURIComponent(slug)}`,
    { cache: "no-store" }
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`API error ${res.status} fetching product "${slug}"`);
  }
  const body = (await res.json()) as ApiResponse<Product>;
  return body.data;
}

export async function getCategories(): Promise<Category[]> {
  const data = await apiFetch<ApiResponse<Category[]>>("/api/v1/categories", {
    cache: "no-store",
  });
  return data.data;
}
