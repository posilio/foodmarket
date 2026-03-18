# FoodMarket — Implementation Backlog

> Prioritised list of work items identified in the initial audit (2026-03-15).
> See `docs/AUDIT_INITIAL.md` for the full audit findings.
> See `NEW_CHAT_STARTER.md` for project context.

Status values: `TODO` | `IN_PROGRESS` | `DONE` | `BLOCKED`

---

## P1 — Fix Before Going Live

These items represent bugs, security gaps, or architectural holes that will cause real problems in a live environment.

---

### FOOD-001: Cart Persistence (localStorage)

| Field | Value |
|---|---|
| **ID** | FOOD-001 |
| **Title** | Cart persistence (localStorage) |
| **Priority** | P1 |
| **Status** | DONE |
| **Area** | Storefront |
| **Dependencies** | None |

**Summary:**
The cart (`CartContext`) is held in React state only. It is lost on every page refresh, tab close, or navigation away from the app. This is a critical UX failure — users who browse for a while, then refresh, lose their cart silently.

**What to do:**
- Persist `items` to `localStorage` in `CartContext` (key: `foodmarket_cart`).
- On mount, hydrate state from `localStorage` before first render.
- On every state change, write to `localStorage`.
- Handle JSON parse errors gracefully (corrupted storage).
- On `clearCart()`, also clear from `localStorage`.

**Files to change:**
- `packages/storefront/src/context/CartContext.tsx`

**Acceptance criteria:**
- Add 3 items, refresh page — items still in cart.
- Remove an item, refresh — item stays removed.
- `clearCart()` after checkout — localStorage cleared.

---

### FOOD-002: Auth Persistence (localStorage instead of sessionStorage)

| Field | Value |
|---|---|
| **ID** | FOOD-002 |
| **Title** | Auth persistence (localStorage instead of sessionStorage) |
| **Priority** | P1 |
| **Status** | DONE |
| **Area** | Storefront |
| **Dependencies** | None |

**Summary:**
`AuthContext` stores the JWT token in `sessionStorage` (key: `foodwebshop_token`). `sessionStorage` is scoped to the browser tab and cleared when the tab is closed. Users are silently logged out every time they close and reopen their browser, or open the site in a new tab.

**What to do:**
- Change all `sessionStorage` references in `AuthContext` to `localStorage`.
- The key name can stay the same (`foodwebshop_token`) or be updated for clarity.
- Verify that `logout()` still clears the item correctly.
- Consider also storing the `customer` object in `localStorage` so the user's name is available immediately on hydration, before any API call.

**Files to change:**
- `packages/storefront/src/context/AuthContext.tsx`

**Acceptance criteria:**
- Log in, close the browser, reopen — still logged in.
- Open the site in a new tab — still logged in.
- Click log out — token cleared, user is anonymous.

---

### FOOD-003: Stock Decrement Timing (Release Unpaid Orders)

| Field | Value |
|---|---|
| **ID** | FOOD-003 |
| **Title** | Stock decrement timing (release unpaid orders after N minutes) |
| **Priority** | P1 |
| **Status** | DONE |
| **Area** | Backend |
| **Dependencies** | None |

**Summary:**
Stock is currently decremented atomically when an order is **created** (before payment). If a customer creates an order, gets redirected to Mollie, and then abandons the payment, the stock remains decremented forever. For a food shop with limited inventory, this is a real business problem.

**Recommended approach — grace period + cleanup job:**
1. Add a `stockReservedUntil` timestamp field to `Order` (set to `NOW() + 30 minutes` on creation).
2. Create a background job (cron or interval) that runs every 5 minutes:
   - Finds all orders with status `PENDING` where `stockReservedUntil < NOW()`.
   - For each expired order: restores stock for all line items, sets order status to `CANCELLED`, creates an `OrderEvent`.
3. The Mollie webhook, when it fires for a paid order, updates status to `PAID` before the expiry fires — so legitimate checkouts are unaffected.

**Alternative (simpler but less safe):** decrement stock only in the payment webhook (`PAID` event), and validate stock availability again at that point. Risk: race condition if two customers buy the last unit simultaneously.

**Files to change:**
- `packages/backend/src/prisma/schema.prisma` (add `stockReservedUntil` to `Order`)
- `packages/backend/src/services/orders.service.ts`
- `packages/backend/src/services/payments.service.ts`
- New file: `packages/backend/src/jobs/expireOrders.ts`
- `packages/backend/src/index.ts` (start the job)
- New migration required

**Acceptance criteria:**
- Create an order, do not pay, wait for expiry — order becomes CANCELLED, stock is restored.
- Create an order, pay via Mollie — order becomes PAID before expiry fires, stock stays decremented.

---

### FOOD-004: Implement Admin api.ts (Typed Fetch Abstraction)

| Field | Value |
|---|---|
| **ID** | FOOD-004 |
| **Title** | Implement admin api.ts — move raw fetch calls to typed functions |
| **Priority** | P1 |
| **Status** | DONE |
| **Area** | Admin |
| **Dependencies** | None |

**Summary:**
`packages/admin/src/lib/api.ts` exists but contains only `export {}`. Every admin page performs raw `fetch()` calls inline, duplicating the `Authorization` header, error handling, and JSON parsing. The intended abstraction was never implemented.

**What to do:**
Implement typed API functions in `api.ts` covering all endpoints the admin uses:
- `getOrders(token, status?)` — `GET /api/v1/admin/orders`
- `getOrder(token, id)` — `GET /api/v1/admin/orders/:id`
- `updateOrderStatus(token, id, status)` — `PATCH /api/v1/admin/orders/:id/status`
- `getProducts(token)` — `GET /api/v1/admin/products`
- `updateVariantStock(token, productId, variantId, qty)` — `PATCH /api/v1/admin/products/:id/stock`
- `getCustomers(token)` — `GET /api/v1/admin/customers`
- `getCustomer(token, id)` — `GET /api/v1/admin/customers/:id`

Update all admin pages to call these functions instead of inline `fetch()`.

**Files to change:**
- `packages/admin/src/lib/api.ts` (implement)
- `packages/admin/src/app/orders/page.tsx`
- `packages/admin/src/app/orders/[id]/page.tsx`
- `packages/admin/src/app/products/page.tsx`
- `packages/admin/src/app/customers/page.tsx`
- `packages/admin/src/app/customers/[id]/page.tsx`

**Acceptance criteria:**
- No raw `fetch()` calls remain in admin page components.
- All API calls route through `api.ts`.
- TypeScript types are correct and shared across pages.

---

### FOOD-005: Admin Layout Auth Guard

| Field | Value |
|---|---|
| **ID** | FOOD-005 |
| **Title** | Admin layout auth guard (single layout.tsx instead of per-page checks) |
| **Priority** | P1 |
| **Status** | DONE |
| **Area** | Admin |
| **Dependencies** | None |

**Summary:**
Each admin page individually checks `if (!isLoggedIn) router.replace('/login')`. This is fragile — any new page added without this boilerplate is unprotected by default. It also means the redirect logic is duplicated across every page.

**What to do:**
- Create `packages/admin/src/app/(protected)/layout.tsx` — a route group layout that wraps all protected admin pages.
- The layout checks auth on mount and redirects to `/login` if not authenticated.
- Move all protected pages into the `(protected)` route group folder.
- Remove the per-page auth check boilerplate from each page.
- The login page stays outside `(protected)`.

**Files to change:**
- New: `packages/admin/src/app/(protected)/layout.tsx`
- Move and update: all admin pages except `login/page.tsx`

**Acceptance criteria:**
- Visiting any admin URL without being logged in redirects to `/login`.
- Logged-in users can access all admin pages normally.
- No per-page `if (!isLoggedIn)` boilerplate remains.

---

### FOOD-006: Admin Bootstrap Route

| Field | Value |
|---|---|
| **ID** | FOOD-006 |
| **Title** | Admin bootstrap route (promote first admin without DB access) |
| **Priority** | P1 |
| **Status** | DONE |
| **Area** | Backend |
| **Dependencies** | None |

**Summary:**
`customer.isAdmin` defaults to `false` for all users. There is no way to promote the first admin user without running a raw SQL query against the database. This is a deployment blocker — any fresh install requires DB access to become operational.

**Recommended approach — secure bootstrap endpoint:**
- Add `POST /api/v1/admin/bootstrap` to the backend.
- The endpoint only works if **zero** admins exist in the database (first-run guard).
- Requires a `BOOTSTRAP_SECRET` env var to be set; the request must include this secret in the body.
- If the conditions are met, promotes the given email to admin.
- After the first admin exists, the endpoint permanently returns 403.

**Alternative:** a CLI script (`npx tsx src/scripts/bootstrap-admin.ts <email>`) that runs outside the web server.

**Files to change:**
- `packages/backend/src/routes/admin.ts` (or new route file)
- `packages/backend/src/services/admin.service.ts`
- `packages/backend/src/config/env.ts` (add `BOOTSTRAP_SECRET`)
- `packages/backend/.env.example`

**Acceptance criteria:**
- Fresh database: calling the endpoint with correct secret promotes the user to admin.
- After one admin exists: endpoint returns 403 regardless of secret.
- Wrong secret: endpoint returns 403.

---

### FOOD-007: Set Up Testing (vitest + supertest)

| Field | Value |
|---|---|
| **ID** | FOOD-007 |
| **Title** | Set up testing — vitest + supertest for backend, vitest for frontend |
| **Priority** | P1 |
| **Status** | DONE |
| **Area** | Backend + Storefront + Admin |
| **Dependencies** | None |

**Summary:**
There are zero test files in the project. No testing framework is configured. This is the highest-risk gap for long-term stability — any refactor or new feature could silently break existing behaviour.

**What to do:**

*Backend (highest priority):*
- Add `vitest` + `supertest` + a test database setup.
- Write integration tests for the critical paths:
  - Auth: register, login, JWT validation, wrong password
  - Orders: create order (valid), create order (out of stock), create order (invalid variant)
  - Payments: webhook idempotency, status update flow
  - Admin: requireAdmin blocks non-admins

*Storefront (lower priority):*
- Add `vitest` + `@testing-library/react`.
- Write unit tests for `CartContext` (add, remove, update, clear, persistence).
- Write unit tests for `AuthContext` (login, logout, persistence).

**Files to create:**
- `packages/backend/vitest.config.ts`
- `packages/backend/src/__tests__/auth.test.ts`
- `packages/backend/src/__tests__/orders.test.ts`
- `packages/backend/src/__tests__/payments.test.ts`
- `packages/storefront/vitest.config.ts`
- `packages/storefront/src/__tests__/CartContext.test.tsx`

**Acceptance criteria:**
- `npm test` runs from the repo root.
- Auth happy path and at least two error paths are covered.
- Order creation with out-of-stock variant is tested.
- Tests can run in CI without a live database (test DB or mocks).

---

### FOOD-008: Rate Limiting on Auth Endpoints

| Field | Value |
|---|---|
| **ID** | FOOD-008 |
| **Title** | Rate limiting on auth endpoints |
| **Priority** | P1 |
| **Status** | DONE |
| **Area** | Backend |
| **Dependencies** | None |

**Summary:**
`POST /api/v1/auth/login` and `POST /api/v1/auth/register` have no rate limiting. An attacker can make unlimited requests — brute-forcing passwords or flooding registrations with throwaway accounts.

**What to do:**
- Add `express-rate-limit` package to backend.
- Apply a strict limiter to `POST /auth/login` (e.g. 10 requests per 15 minutes per IP).
- Apply a looser limiter to `POST /auth/register` (e.g. 5 requests per hour per IP).
- In production, configure `trustProxy` so the limiter uses the real client IP behind a reverse proxy.
- Return `429 Too Many Requests` with a `Retry-After` header.

**Files to change:**
- `packages/backend/package.json` (add `express-rate-limit`)
- `packages/backend/src/routes/auth.ts`

**Acceptance criteria:**
- Sending 11 consecutive login requests returns 429 on the 11th.
- Successful logins within the limit work normally.
- Rate limit state resets after the window expires.

---

## P2 — Important but Not Blocking

These items improve the product significantly but are not required for an initial live deployment.

---

### FOOD-009: Pagination on All List Endpoints

| Field | Value |
|---|---|
| **ID** | FOOD-009 |
| **Title** | Pagination on all list endpoints (limit/offset or cursor) |
| **Priority** | P2 |
| **Status** | DONE |
| **Area** | Backend + Admin + Storefront |
| **Dependencies** | None |

**Summary:**
Every list endpoint returns all records. With real data this will cause slow queries, large payloads, and poor UX. Affected endpoints: `GET /products`, `GET /admin/orders`, `GET /admin/products`, `GET /admin/customers`, `GET /orders`.

**What to do:**
- Add `limit` and `offset` query params to all list endpoints (default: limit=20, offset=0).
- Return `{ data: [...], total: N, limit: N, offset: N }` so clients can compute page count.
- Update admin list pages to show pagination controls.
- Update storefront products page to support `page` query param.

---

### FOOD-010: Refresh Token Flow

| Field | Value |
|---|---|
| **ID** | FOOD-010 |
| **Title** | Refresh token flow (stay logged in beyond 1h JWT expiry) |
| **Priority** | P2 |
| **Status** | DONE |
| **Area** | Backend + Storefront + Admin |
| **Dependencies** | FOOD-002 |

**Summary:**
JWTs expire after 1 hour (`JWT_EXPIRES_IN=1h`). There is no refresh mechanism. Users mid-session get silently 401'd and must log in again — they only discover this when an API call fails.

**What to do:**
- Add a `RefreshToken` model to the schema (token string, customerId, expiresAt, revokedAt).
- Issue a refresh token (long-lived, e.g. 30 days) alongside the access JWT at login.
- Add `POST /auth/refresh` endpoint that accepts the refresh token and issues a new access JWT.
- In `AuthContext`, intercept 401 responses and attempt a token refresh before propagating the error.
- On logout, revoke the refresh token.

---

### FOOD-011: Product Editing in Admin

| Field | Value |
|---|---|
| **ID** | FOOD-011 |
| **Title** | Product editing in admin (name, description, price, active/inactive toggle) |
| **Priority** | P2 |
| **Status** | DONE |
| **Area** | Backend + Admin |
| **Dependencies** | None |

**Summary:**
The admin can create products and update stock, but cannot edit any other product field after creation (name, description, imageUrl, price, isActive, category). There is also no UI to deactivate a product.

**What to do:**
- Add `PATCH /api/v1/admin/products/:id` backend endpoint.
- Add `PATCH /api/v1/admin/products/:productId/variants/:variantId` for editing variant price/label.
- Add product edit form/page to the admin.
- Add an active/inactive toggle button to the products list.

---

### FOOD-012: Shared Types Package

| Field | Value |
|---|---|
| **ID** | FOOD-012 |
| **Title** | Shared types package (eliminate type duplication between packages) |
| **Priority** | P2 |
| **Status** | DONE |
| **Area** | Monorepo |
| **Dependencies** | None |

**Summary:**
Product, Order, Customer, and Payment types are defined separately in `packages/storefront/src/types/index.ts`, redefined inline in admin page files, and implied from Prisma in the backend. When the schema changes, three places must be updated manually.

**What to do:**
- Create `packages/shared/` with its own `package.json` (name: `@foodmarket/shared`).
- Export shared TypeScript interfaces for `Product`, `ProductVariant`, `Category`, `Order`, `OrderLine`, `Customer`, `Payment`, `OrderStatus`, etc.
- Reference `@foodmarket/shared` from storefront and admin packages.
- Remove duplicate type definitions from storefront and admin.

---

### FOOD-013: CI Pipeline (GitHub Actions)

| Field | Value |
|---|---|
| **ID** | FOOD-013 |
| **Title** | CI pipeline — lint, typecheck, and tests on every PR |
| **Priority** | P2 |
| **Status** | DONE |
| **Area** | DevOps |
| **Dependencies** | FOOD-007 |

**Summary:**
There is no automated CI. Nothing prevents a PR with TypeScript errors, lint failures, or broken tests from being merged.

**What to do:**
- Create `.github/workflows/ci.yml`.
- On push to any branch and on PR to `main`: run `npm run typecheck` and `npm run lint` for all packages, then `npm test` for backend.
- Use a PostgreSQL service container for backend integration tests.
- Cache `node_modules` across runs.

---

### FOOD-014: Shipping Cost at Checkout

| Field | Value |
|---|---|
| **ID** | FOOD-014 |
| **Title** | Shipping cost at checkout (calculate and include in order total) |
| **Priority** | P2 |
| **Status** | DONE |
| **Area** | Backend + Storefront |
| **Dependencies** | None |

**Summary:**
The cart page shows "Calculated at checkout" for shipping but the checkout flow never adds a shipping line. The order total is always the product subtotal only. This means customers are never charged for delivery.

**What to do:**
- Define shipping cost rules (e.g. flat €4.95 for NL, free above €50).
- Add a `shippingEuroCents` field to `Order`.
- Calculate shipping server-side in `orders.service.ts` and include it in the total.
- Display the calculated shipping cost in the checkout summary before the customer confirms.

---

### FOOD-015: Address Reuse at Checkout

| Field | Value |
|---|---|
| **ID** | FOOD-015 |
| **Title** | Address reuse at checkout (pick a saved address instead of always creating new) |
| **Priority** | P2 |
| **Status** | DONE |
| **Area** | Storefront + Backend |
| **Dependencies** | None |

**Summary:**
Every checkout always creates a new `Address` record, even if the customer has used the same address before. Returning customers must re-enter their full address every time.

**What to do:**
- On the checkout page, fetch the customer's saved addresses (`GET /api/v1/addresses` — needs to be created).
- If saved addresses exist, show a "Use saved address" selector above the address form.
- If the customer selects a saved address, use its ID directly when creating the order (skip address creation).
- Allow the customer to still enter a new address and optionally save it.

---

## P3 — Nice to Have

Lower-urgency improvements that would enhance the product but are not blockers.

---

### FOOD-016: Image Upload Endpoint

| Field | Value |
|---|---|
| **ID** | FOOD-016 |
| **Title** | Image upload endpoint for product images |
| **Priority** | P3 |
| **Status** | DONE |
| **Area** | Backend + Admin |
| **Dependencies** | None |

**Summary:**
Product `imageUrl` is a plain string. Adding a product requires manually providing an external image URL. There is no way to upload images through the admin UI.

**What to do:**
- Add `POST /api/v1/admin/uploads/image` endpoint using `multer` for file handling.
- Store images in an S3-compatible bucket (AWS S3, Cloudflare R2, or MinIO for local dev).
- Return the public image URL after upload.
- Add an image upload control to the admin product create/edit form.

---

### FOOD-017: Low Stock Alerts in Admin

| Field | Value |
|---|---|
| **ID** | FOOD-017 |
| **Title** | Low stock alerts in admin dashboard |
| **Priority** | P3 |
| **Status** | DONE |
| **Area** | Backend + Admin |
| **Dependencies** | None |

**Summary:**
There is no visibility into low-stock variants. Admins only discover stock problems when a customer tries to order and hits an out-of-stock error.

**What to do:**
- Add a `GET /api/v1/admin/alerts/low-stock` endpoint returning variants where `stockQuantity < threshold` (configurable, default 5).
- Show a low-stock warning panel on the admin dashboard.
- Optionally, send a daily email digest of low-stock variants.

---

### FOOD-018: CORS Hardening for Production

| Field | Value |
|---|---|
| **ID** | FOOD-018 |
| **Title** | CORS hardening for production |
| **Priority** | P3 |
| **Status** | DONE |
| **Area** | Backend |
| **Dependencies** | None |

**Summary:**
The backend uses `cors()` with default settings, which allows all origins. This is fine for local development but must be locked down before the API is publicly accessible.

**What to do:**
- Add `CORS_ORIGINS` env var (comma-separated list of allowed origins).
- Configure `cors({ origin: allowedOrigins })` in `app.ts`.
- In development, allow `http://localhost:3000` and `http://localhost:3001`.
- In production, restrict to the real storefront and admin domains only.

---

## Go-Live Tickets (P1)

---

### FOOD-020: Mollie Live Key Swap

| Field | Value |
|---|---|
| **ID** | FOOD-020 |
| **Title** | Mollie live key swap (test → production) |
| **Priority** | P1 |
| **Status** | TODO |
| **Area** | Backend + DevOps |
| **Dependencies** | FOOD-021 |

**Summary:**
`MOLLIE_API_KEY` currently holds a test key (`test_...`). All payments use the Mollie sandbox and no real money moves. Before go-live, this must be swapped for the live key.

**What to do:**
- In Railway (or your host), set `MOLLIE_API_KEY=live_...` (from the Mollie dashboard).
- Update `MOLLIE_REDIRECT_BASE` to the production storefront URL.
- Update `WEBHOOK_BASE_URL` to the production backend URL (Mollie needs to reach this for webhooks).
- Verify in Mollie dashboard that the live webhook endpoint is registered.
- **Never commit live keys to git.**

**Files to change:**
- Railway / production environment variables only — no code changes needed.

---

### FOOD-021: Production Domain + SSL (Railway)

| Field | Value |
|---|---|
| **ID** | FOOD-021 |
| **Title** | Production domain + SSL on Railway |
| **Priority** | P1 |
| **Status** | TODO |
| **Area** | DevOps |
| **Dependencies** | None |

**Summary:**
The app runs locally only. For go-live, all three services must be deployed to a hosting platform with HTTPS.

**What to do:**
- Create three Railway services: `foodmarket-backend`, `foodmarket-storefront`, `foodmarket-admin`.
- Provision a PostgreSQL database (Railway Postgres, Supabase, or Neon).
- Run `prisma migrate deploy` against the production database on first deploy.
- Set all environment variables per `docs/DEPLOYMENT.md`.
- Point custom domains at Railway services; SSL terminates automatically at Railway's edge.
- Add a `Procfile` or set Railway start commands if not auto-detected from `package.json`.

See `docs/DEPLOYMENT.md` for the full variable reference.

---

### FOOD-022: Fix 2 Failing Tests

| Field | Value |
|---|---|
| **ID** | FOOD-022 |
| **Title** | Fix 2 failing backend tests |
| **Priority** | P1 |
| **Status** | DONE |
| **Area** | Backend |
| **Dependencies** | None |

**Summary:**
Two tests currently fail. CI will block on every push until these are fixed.

**What to do:**

*Fix 1 — `auth.test.ts` response shape:*
- The register endpoint now returns `{ data: { customer, token, refreshToken } }`.
- The test asserts `expect(res.body.data).toMatchObject({ email, firstName, lastName })` — these fields are now nested under `data.customer`.
- Fix: change the assertion to `res.body.data.customer`.

*Fix 2 — `afterAll` FK constraint (both test files):*
- `prisma.customer.deleteMany()` fails because the customer has linked `RefreshToken` rows.
- Fix: add `await prisma.refreshToken.deleteMany({ where: { customer: { email: TEST_EMAIL } } })` before the customer delete in both `afterAll` blocks.

**Files to change:**
- `packages/backend/src/__tests__/auth.test.ts`
- `packages/backend/src/__tests__/orders.test.ts`

---

### FOOD-023: GDPR Basics (Privacy Policy + Cookie Notice)

| Field | Value |
|---|---|
| **ID** | FOOD-023 |
| **Title** | GDPR basics — privacy policy page + cookie notice |
| **Priority** | P1 |
| **Status** | DONE |
| **Area** | Storefront |
| **Dependencies** | None |

**Summary:**
Dutch law (AVG/GDPR) requires a privacy policy and cookie notice before a site collects personal data (email, name, address). Launching without these is a legal risk.

**What to do:**
- Add a `/privacy` static page to the storefront with a privacy policy (covering what data is collected, why, retention period, and customer rights).
- Add a cookie consent banner that appears on first visit. Since the site only sets session/auth cookies (no tracking), the banner can be minimal — just an acknowledgement.
- Add a link to `/privacy` in the storefront footer.

**Files to change:**
- New: `packages/storefront/src/app/privacy/page.tsx`
- New: `packages/storefront/src/components/CookieBanner.tsx`
- `packages/storefront/src/app/layout.tsx` (mount banner, add footer link)

---

## Go-Live Tickets (P2)

---

### FOOD-024: Password Reset Flow

| Field | Value |
|---|---|
| **ID** | FOOD-024 |
| **Title** | Password reset flow (forgotten password recovery) |
| **Priority** | P2 |
| **Status** | DONE |
| **Area** | Backend + Storefront |
| **Dependencies** | None |

**Summary:**
Users have no way to recover a forgotten password. They are permanently locked out if they forget it, requiring manual database intervention.

**What to do:**
- `POST /auth/forgot-password` — generates a signed, short-lived token (15 min), stores a hash in a new `PasswordResetToken` table, emails a link via Resend to the customer.
- `POST /auth/reset-password` — validates the token, updates `passwordHash`, deletes the token, revokes all existing refresh tokens for the account.
- Storefront: `/forgot-password` page (email input), `/reset-password?token=...` page (new password form).

**Files to change:**
- New migration: `PasswordResetToken` model
- `packages/backend/src/services/auth.service.ts`
- `packages/backend/src/routes/auth.ts`
- `packages/backend/src/lib/email.ts` (add reset email template)
- New: `packages/storefront/src/app/forgot-password/page.tsx`
- New: `packages/storefront/src/app/reset-password/page.tsx`

---

### FOOD-025: Order Cancellation + Mollie Refund

| Field | Value |
|---|---|
| **ID** | FOOD-025 |
| **Title** | Order cancellation with Mollie refund and stock restore |
| **Priority** | P2 |
| **Status** | DONE |
| **Area** | Backend + Admin |
| **Dependencies** | None |

**Summary:**
Admins can set order status to `CANCELLED` via the status dropdown, but this does not trigger a Mollie refund for paid orders, and does not restore stock.

**What to do:**
- In the `updateOrderStatus` service, when transitioning to `CANCELLED` from `PAID` or `PROCESSING`:
  - Call `mollieClient.payments.cancel(providerReference)` or create a refund via the Mollie API.
  - Restore stock for all `OrderLine` variants (increment `stockQuantity`).
  - Create an `OrderEvent` recording the cancellation and refund reference.
- Handle the case where payment was never made (PENDING → CANCELLED): just restore stock, no Mollie call.

**Files to change:**
- `packages/backend/src/services/admin.service.ts`
- `packages/backend/src/services/payments.service.ts`

---

### FOOD-026: Low Stock Email Alert (Daily Digest)

| Field | Value |
|---|---|
| **ID** | FOOD-026 |
| **Title** | Low stock email alert — daily digest to admin |
| **Priority** | P2 |
| **Status** | DONE |
| **Area** | Backend |
| **Dependencies** | None |

**Summary:**
The admin dashboard shows a low-stock banner (top-5 variants below threshold) but nothing is sent proactively. Admins who don't check the dashboard daily will miss low-stock warnings.

**What to do:**
- Create `packages/backend/src/jobs/lowStockAlert.ts`.
- The job runs once per day (via `setInterval` with 24h ms, or a proper scheduler).
- Fetches all variants where `stockQuantity < threshold` (configurable, default 5).
- If any exist, sends a summary email via Resend to a configured `ADMIN_EMAIL` env var.
- Wire into `index.ts` alongside `startExpireOrdersJob()`.

**Files to change:**
- New: `packages/backend/src/jobs/lowStockAlert.ts`
- `packages/backend/src/index.ts`
- `packages/backend/src/lib/email.ts` (add low-stock email template)
- `packages/backend/src/config/env.ts` (add `ADMIN_EMAIL`)

---

### FOOD-027: VAT Handling (NL Law)

| Field | Value |
|---|---|
| **ID** | FOOD-027 |
| **Title** | VAT handling — NL 9% on food, 21% on non-food |
| **Priority** | P2 |
| **Status** | DEFERRED |
| **Area** | Backend + Storefront |
| **Dependencies** | None |

> ⚠️ DO NOT IMPLEMENT until KOR threshold is exceeded (€20,000 annual turnover)

**Summary:**
FoodMarket sells food ingredients — all products are subject to 9% BTW (reduced rate for food). Dutch B2C law requires VAT-inclusive pricing, meaning prices already include tax.

Under the KOR scheme (kleine ondernemersregeling), businesses with annual turnover under €20,000 are fully exempt from charging VAT and filing VAT returns. No BTW number is needed during this phase.

Once turnover exceeds €20,000, KOR must be deactivated and this ticket must be implemented: charge 9% BTW, show VAT breakdown on checkout and order confirmation emails, add BTW number to footer and emails, and file quarterly BTW returns with Belastingdienst.

**What to do (when KOR threshold is exceeded):**
- Decide on pricing model: VAT-inclusive (prices already include tax — standard for B2C in NL) vs VAT-exclusive (add on top).
- If VAT-inclusive: add a `vatRatePercent` field to `Category` or `Product` (9 or 21).
- Calculate and display the VAT breakdown (e.g. "incl. 9% BTW: €0.45") on checkout, order confirmation, and admin order detail.
- Add VAT line to order confirmation email template.
- Consider storing `vatEuroCents` on `OrderLine` for audit purposes.

**Files to change:**
- Possibly new migration (if storing VAT rate/amount on model)
- `packages/backend/src/services/orders.service.ts`
- `packages/backend/src/lib/email.ts`
- `packages/storefront/src/app/checkout/page.tsx`
- `packages/admin/src/app/orders/[id]/page.tsx`

---

## Nice to Have (P3)

---

### FOOD-028: Storefront Search

| Field | Value |
|---|---|
| **ID** | FOOD-028 |
| **Title** | Storefront product search |
| **Priority** | P3 |
| **Status** | DONE |
| **Area** | Backend + Storefront |
| **Dependencies** | None |

**Summary:**
There is no search functionality. Users must browse by category to find products.

**What to do:**
- Add `?q=` query param to `GET /products` backend endpoint; filter by `name` ILIKE and `description` ILIKE.
- Add a search input to the storefront products listing page with debounce (300ms).
- Update the URL query string on search so results are shareable/bookmarkable.

**Files to change:**
- `packages/backend/src/services/products.service.ts`
- `packages/storefront/src/app/products/page.tsx`

---

### FOOD-029: Product Reviews

| Field | Value |
|---|---|
| **ID** | FOOD-029 |
| **Title** | Product reviews (customer ratings) |
| **Priority** | P3 |
| **Status** | DONE |
| **Area** | Backend + Storefront |
| **Dependencies** | None |

**Summary:**
Products have no review or rating system.

**What to do:**
- New `Review` model: `productId`, `customerId`, `rating` (1–5), `body` (text), `createdAt`.
- `POST /products/:slug/reviews` — authenticated customers only, one review per product.
- `GET /products/:slug` — include reviews (or a summary) in the response.
- Display star rating and review list on the storefront product detail page.

---

### FOOD-030: Discount Codes

| Field | Value |
|---|---|
| **ID** | FOOD-030 |
| **Title** | Discount codes at checkout |
| **Priority** | P3 |
| **Status** | TODO |
| **Area** | Backend + Storefront + Admin |
| **Dependencies** | None |

**Summary:**
There is no promotional discount mechanism. The shop cannot run sales or targeted promotions.

**What to do:**
- New `DiscountCode` model: `code` (unique), `type` (FLAT | PERCENTAGE), `amountCents` or `percent`, `maxUses`, `usedCount`, `expiresAt`, `isActive`.
- Admin: create/deactivate codes via new admin endpoints.
- Checkout: code input field; `POST /orders/validate-discount` validates and returns the discount amount.
- Apply discount to `totalEuroCents` on order create; store `discountCodeId` + `discountEuroCents` on `Order`.

---

### FOOD-032: Customer PDF Invoice

| Field | Value |
|---|---|
| **ID** | FOOD-032 |
| **Title** | Customer PDF invoice for every paid order |
| **Priority** | P1 |
| **Status** | TODO |
| **Area** | Backend + Storefront |
| **Dependencies** | KVK registration (need company details) |

**Summary:**
Dutch law requires a proper invoice for every B2C sale.
Currently customers only receive an order confirmation email
with no downloadable invoice. This must be in place before
go-live.

**Invoice must include:**
- FoodMarket company name, address, KVK number, BTW number
- Invoice number (sequential, e.g. FM-2026-0001)
- Invoice date
- Customer name and delivery address
- Order lines: product name, variant, quantity, unit price, line total
- Shipping cost
- Order total
- BTW note: "Prijzen zijn inclusief BTW" (until KOR threshold
  exceeded, then show actual BTW breakdown)

**What to do:**
- Add InvoiceNumber model to schema (sequential per year)
- Generate PDF using a library like @react-pdf/renderer or
  puppeteer on the backend when order transitions to PAID
- Store PDF URL on Order or generate on demand
- Add "Download invoice" button to storefront order detail page
- Attach PDF to order confirmation email
- Admin can also download invoice from order detail page

**Files to change:**
- New: packages/backend/src/services/invoice.service.ts
- packages/backend/src/prisma/schema.prisma (InvoiceNumber model)
- packages/backend/src/lib/email.ts (attach PDF)
- packages/storefront/src/app/account/orders/[id]/page.tsx
- packages/admin/src/app/orders/[id]/page.tsx

**Note:** Do not implement until KVK number and BTW number
are available to put on the invoice.

---

### FOOD-033: Loyalty Points for Reviews (Kortingspunten)

| Field | Value |
|---|---|
| **ID** | FOOD-033 |
| **Title** | Reward customers with discount points for leaving a review |
| **Priority** | P3 |
| **Status** | TODO |
| **Area** | Backend + Storefront |
| **Dependencies** | FOOD-029 (reviews), FOOD-030 (discount codes) |

**Summary:**
After receiving a delivered order, customers can leave a
review and earn kortingspunten (loyalty/discount points)
as a reward. Points can be redeemed at checkout.

**What to do:**
- Add LoyaltyPoints model to schema (customerId, points, reason, createdAt)
- When a review is submitted for a DELIVERED order product,
  award X points to the customer
- Add points balance to customer account page
- Allow points redemption at checkout as a discount
- Admin can view and adjust customer points balance

**Files to change:**
- packages/backend/src/prisma/schema.prisma
- packages/backend/src/services/reviews.service.ts
- packages/backend/src/services/orders.service.ts
- packages/storefront/src/app/account/page.tsx
- packages/storefront/src/app/checkout/page.tsx

---

### FOOD-034: Upgrade Next.js 14 → 15 (4 HIGH CVEs)

| Field | Value |
|---|---|
| **ID** | FOOD-034 |
| **Title** | Upgrade Next.js 14 → 15 to fix 4 HIGH security CVEs |
| **Priority** | P1 |
| **Status** | DONE |
| **Area** | Storefront + Admin |
| **Dependencies** | None |

**Summary:**
`npm audit` reports 4 HIGH CVEs in Next.js 14 across both storefront and admin:
GHSA-3x4c (image cache DoS), GHSA-ggv3 (HTTP request smuggling),
GHSA-9g9p (Image Optimizer DoS), GHSA-h25m (RSC deserialization DoS).
Fix requires upgrading both packages to Next.js 15, which is a breaking change.

**What to do:**
- Review the Next.js 14 → 15 migration guide before starting
- Upgrade `next`, `react`, `react-dom` in both storefront and admin
- Test all pages after upgrade (layout, routing, data fetching, auth flow)
- Update `CLAUDE.md` note about Next.js version after upgrade

**Files to change:**
- packages/storefront/package.json
- packages/admin/package.json
- Potentially: next.config.mjs in both packages (API changes)

---

### FOOD-035: Migrate JWT tokens from localStorage to httpOnly cookies

| Field | Value |
|---|---|
| **ID** | FOOD-035 |
| **Title** | Migrate JWT tokens from localStorage to httpOnly cookies |
| **Priority** | P1 |
| **Status** | DONE |
| **Area** | Backend + Storefront + Admin |
| **Dependencies** | None |

**Summary:**
Access token and refresh token are currently stored in localStorage in both
storefront and admin. XSS on any page can steal the 30-day refresh token and
maintain persistent access. Migrating to httpOnly cookies eliminates this risk.

**What to do:**
- Backend: add `cookie-parser`; set tokens as `httpOnly + secure + sameSite=strict`
  cookies on login/refresh; clear cookies on logout
- Storefront `AuthContext`: remove localStorage reads/writes; read auth state
  from a `/auth/me` call on mount instead
- Admin `AuthContext`: same as storefront
- CORS: `credentials: true` and specific origin already set — verify both ends
- Do storefront and admin as separate sub-tasks

**Files to change:**
- packages/backend/src/routes/auth.ts
- packages/storefront/src/context/AuthContext.tsx
- packages/admin/src/context/AuthContext.tsx

---

### FOOD-036: GDPR right-to-erasure — DELETE /api/v1/customers/me

| Field | Value |
|---|---|
| **ID** | FOOD-036 |
| **Title** | GDPR Article 17 — customer account deletion endpoint |
| **Priority** | P1 |
| **Status** | DONE |
| **Area** | Backend + Storefront |
| **Dependencies** | None |

**Summary:**
GDPR Article 17 requires the ability for customers to delete their own account
and personal data. No such endpoint currently exists.

**What to do:**
- `DELETE /api/v1/customers/me` (requires `requireAuth`)
- Anonymise personal identifiers: replace email with `deleted_<id>@deleted.invalid`,
  null out name fields, delete Address records, delete RefreshToken records,
  mark `Customer.isActive = false`
- Retain order history for legal/tax purposes (7-year obligation) but strip
  personal identifiers from linked records
- Add a "Delete my account" button on the storefront `/account` page
- Return 204 on success; log the deletion event with Pino

**Files to change:**
- packages/backend/src/routes/customers.ts (or auth.ts)
- packages/backend/src/services/auth.service.ts
- packages/storefront/src/app/account/page.tsx

---

### FOOD-037: Hash refresh tokens before storing in DB

| Field | Value |
|---|---|
| **ID** | FOOD-037 |
| **Title** | Hash refresh tokens before storing in DB (defence-in-depth) |
| **Priority** | P2 |
| **Status** | TODO |
| **Area** | Backend |
| **Dependencies** | None |

**Summary:**
Refresh tokens are stored as plaintext in the `RefreshToken` table. Entropy
is high (`crypto.randomBytes(40)`) so the practical risk is low, but hashing
before storage is standard defence-in-depth — a DB leak would not expose
valid tokens.

**What to do:**
- SHA-256 hash the token before `INSERT`; on lookup, hash the incoming token
  and compare against the stored hash
- No schema migration needed (same `String` column)
- On deploy: invalidate all existing tokens by truncating the `RefreshToken`
  table (or add a `tokenVersion` field to `Customer`)

**Files to change:**
- packages/backend/src/services/auth.service.ts

---

### FOOD-038: Account lockout after repeated login failures

| Field | Value |
|---|---|
| **ID** | FOOD-038 |
| **Title** | Account lockout after N consecutive failed login attempts |
| **Priority** | P2 |
| **Status** | TODO |
| **Area** | Backend |
| **Dependencies** | None |

**Summary:**
Rate limiting (10/15min per IP) is the only brute-force protection. A
distributed attack from multiple IPs is not rate-limited at the account
level. Add per-account lockout as a second layer.

**What to do:**
- Add `failedLoginAttempts Int @default(0)` and `lockedUntil DateTime?`
  to the `Customer` model (requires migration)
- On login failure: increment `failedLoginAttempts`; if >= 10, set
  `lockedUntil = now() + 15min`
- On login: check `lockedUntil` before bcrypt compare; return 429 if locked
- On login success: reset `failedLoginAttempts = 0`
- Admin panel: show lockout status on customer detail; allow manual unlock

**Files to change:**
- packages/backend/src/prisma/schema.prisma
- packages/backend/src/services/auth.service.ts
- New migration required

---

### FOOD-039: String input max-length validation across all routes

| Field | Value |
|---|---|
| **ID** | FOOD-039 |
| **Title** | Add max-length validation to all string inputs |
| **Priority** | P2 |
| **Status** | TODO |
| **Area** | Backend |
| **Dependencies** | None |

**Summary:**
No explicit max-length checks on string inputs. DB column limits apply as
a last resort but produce opaque 500 errors, not clean 400 responses.

**What to do:**
- Add length checks to all POST/PATCH route handlers (or introduce zod schemas)
- Suggested limits: email 254, firstName/lastName 100, street 255, city 100,
  postalCode 10, notes 1000, product name 200, description 5000
- Return 400 with a descriptive message when a limit is exceeded

**Files to change:**
- packages/backend/src/routes/ (all route files with string inputs)

---

### FOOD-040: Stricter rate limit on bootstrap endpoint

| Field | Value |
|---|---|
| **ID** | FOOD-040 |
| **Title** | Apply authRateLimit to POST /api/v1/bootstrap/admin |
| **Priority** | P3 |
| **Status** | TODO |
| **Area** | Backend |
| **Dependencies** | None |

**Summary:**
`POST /api/v1/bootstrap/admin` only gets the global rate limit (200/min).
If `ADMIN_BOOTSTRAP_SECRET` is accidentally left set in a staging environment,
the secret could be brute-forced. Apply `authRateLimit` (10/15min) to this
endpoint as a precaution.

**What to do:**
- Apply `authRateLimit` middleware to the bootstrap route
- Document in `CLAUDE.md` and deployment notes that `ADMIN_BOOTSTRAP_SECRET`
  must be unset (or cleared in Railway env vars) after the first admin is created

**Files to change:**
- packages/backend/src/routes/bootstrap.ts

---

## Backlog Summary

| ID | Title | Priority | Status | Area |
|---|---|---|---|---|
| FOOD-001 | Cart persistence (localStorage) | P1 | DONE | Storefront |
| FOOD-002 | Auth persistence (localStorage) | P1 | DONE | Storefront |
| FOOD-003 | Stock decrement timing | P1 | DONE | Backend |
| FOOD-004 | Implement admin api.ts | P1 | DONE | Admin |
| FOOD-005 | Admin layout auth guard | P1 | DONE | Admin |
| FOOD-006 | Admin bootstrap route | P1 | DONE | Backend |
| FOOD-007 | Set up testing | P1 | DONE | Backend |
| FOOD-008 | Rate limiting on auth endpoints | P1 | DONE | Backend |
| FOOD-009 | Pagination on list endpoints | P2 | DONE | Backend + Admin |
| FOOD-010 | Refresh token flow | P2 | DONE | Backend + Storefront + Admin |
| FOOD-011 | Product editing in admin | P2 | DONE | Backend + Admin |
| FOOD-012 | Shared types package | P2 | DONE | Monorepo |
| FOOD-013 | CI pipeline (GitHub Actions) | P2 | DONE | DevOps |
| FOOD-014 | Shipping cost at checkout | P2 | DONE | Backend + Storefront |
| FOOD-015 | Address reuse at checkout | P2 | DONE | Storefront + Backend |
| FOOD-016 | Image upload endpoint | P3 | DONE | Backend + Admin |
| FOOD-017 | Low stock alerts in admin | P3 | DONE | Backend + Admin |
| FOOD-018 | CORS hardening for production | P3 | DONE | Backend |
| FOOD-019 | Stock import (EAN + PDF/CSV) | — | DONE | Backend + Admin |
| FOOD-020 | Mollie live key swap | P1 | TODO | Backend + DevOps |
| FOOD-021 | Production domain + SSL (Railway) | P1 | TODO | DevOps |
| FOOD-022 | Fix 2 failing tests | P1 | DONE | Backend |
| FOOD-023 | GDPR basics (privacy policy + cookie notice) | P1 | DONE | Storefront |
| FOOD-024 | Password reset flow | P2 | DONE | Backend + Storefront |
| FOOD-025 | Order cancellation + Mollie refund | P2 | DONE | Backend + Admin |
| FOOD-026 | Low stock email alert (daily digest) | P2 | DONE | Backend |
| FOOD-027 | VAT handling (NL 9%/21%) | P2 | DEFERRED | Backend + Storefront |
| FOOD-028 | Storefront search | P3 | DONE | Backend + Storefront |
| FOOD-029 | Product reviews | P3 | DONE | Backend + Storefront |
| FOOD-030 | Discount codes | P3 | TODO | Backend + Storefront |
| FOOD-032 | Customer PDF invoice (per paid order) | P1 | TODO | Backend + Storefront |
| FOOD-033 | Loyalty points for reviews (kortingspunten) | P3 | TODO | Backend + Storefront |
| FOOD-034 | Upgrade Next.js 14 → 15 (4 HIGH CVEs) | P1 | DONE | Storefront + Admin |
| FOOD-035 | Migrate JWT tokens from localStorage to httpOnly cookies | P1 | DONE | Backend + Storefront + Admin |
| FOOD-036 | GDPR right-to-erasure (DELETE /customers/me) | P1 | DONE | Backend + Storefront |
| FOOD-037 | Hash refresh tokens before storing in DB | P2 | TODO | Backend |
| FOOD-038 | Account lockout after repeated login failures | P2 | TODO | Backend |
| FOOD-039 | String input max-length validation across all routes | P2 | TODO | Backend |
| FOOD-040 | Stricter rate limit on bootstrap endpoint | P3 | TODO | Backend |
