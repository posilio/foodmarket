// Typed fetch wrapper for calling the backend API from the storefront.
// All data fetching goes through these functions — never call the backend directly from pages.
import type { ApiResponse, Category, CategoryTree, Product, Review, ReviewsResponse } from "../types";

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
export async function getProducts(options?: {
  region?: string;
  country?: string;
  type?: string;
  q?: string;
}): Promise<Product[]> {
  const params = new URLSearchParams({ limit: "200" });
  if (options?.region) params.set("region", options.region);
  if (options?.country) params.set("country", options.country);
  if (options?.type) params.set("type", options.type);
  if (options?.q) params.set("q", options.q);
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

export async function getCategoryTree(): Promise<CategoryTree> {
  return apiFetch<CategoryTree>("/api/v1/categories/tree", { cache: "no-store" });
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function forgotPassword(email: string): Promise<void> {
  await fetch(`${getBaseUrl()}/api/v1/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  // Always resolves — backend never reveals whether the email exists.
}

export async function resetPassword(token: string, password: string): Promise<void> {
  const res = await fetch(`${getBaseUrl()}/api/v1/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Invalid or expired reset link");
  }
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export async function getReviews(slug: string): Promise<ReviewsResponse> {
  return apiFetch<ReviewsResponse>(`/api/v1/products/${encodeURIComponent(slug)}/reviews`, {
    cache: "no-store",
  });
}

export async function deleteMyAccount(token: string): Promise<void> {
  const res = await fetch(`${getBaseUrl()}/api/v1/customers/me`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error("Failed to delete account");
  }
}

export async function submitReview(
  slug: string,
  rating: number,
  body: string,
  token: string
): Promise<Review> {
  const res = await fetch(
    `${getBaseUrl()}/api/v1/products/${encodeURIComponent(slug)}/reviews`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating, body: body || undefined }),
    }
  );
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(data.message ?? "Failed to submit review");
  }
  const data = (await res.json()) as ApiResponse<Review>;
  return data.data;
}
