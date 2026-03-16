# FoodMarket — Initial Codebase Audit

**Date:** 2026-03-15
**Auditor:** Claude Sonnet 4.6 (automated analysis)
**Scope:** Full codebase review — architecture, features, code quality, security, missing functionality
**Outcome:** [Continue building on this foundation](#recommendation)

---

## 1. Project Overview

**FoodMarket** is an e-commerce platform for international specialty food ingredients targeting the Netherlands market. It is structured as an npm workspaces monorepo with three packages:

| Package | Framework | Port | Purpose |
|---|---|---|---|
| `packages/backend` | Node.js / Express v5 / Prisma v6 | 4000 | REST API serving both frontends |
| `packages/storefront` | Next.js 14 App Router | 3000 | Customer-facing shopping experience |
| `packages/admin` | Next.js 14 App Router | 3001 | Internal order and product management |

Database: PostgreSQL 16 running in Docker on port 5433 (non-standard to avoid conflict with a native Windows PostgreSQL installation on 5432).

---

## 2. Tech Stack

### Backend
- **Runtime:** Node.js with TypeScript (compiled via `tsx` in dev)
- **Framework:** Express v5.2.1
- **ORM:** Prisma v6.19.2 (pinned — v7 removed `url` from datasource block, breaking compatibility)
- **Database:** PostgreSQL 16-alpine
- **Auth:** `jsonwebtoken` v9.0.3 (JWT, 1h expiry), `bcrypt` v6.0.0 (12 rounds)
- **Payments:** `@mollie/api-client` v4.4.0
- **Email:** `resend` v6.9.3
- **Logging:** `pino` v10.3.1 with pretty-printing in dev
- **TypeScript:** v5.9.3, strict mode

### Storefront
- **Framework:** Next.js 14.2.35, App Router
- **React:** 18.3.1
- **Styling:** Tailwind CSS v4.2.1, Google Fonts (Cormorant Garamond serif + Jost sans-serif)
- **State:** Custom React context (AuthContext, CartContext) — no external state library

### Admin
- **Framework:** Next.js 14 App Router (same version as storefront)
- **Styling:** Tailwind CSS v4

---

## 3. Database Schema

### Tables (11 total)

```
Category
  id, name, slug, description?, createdAt, updatedAt

Product
  id, name, slug (unique), description?, imageUrl?, countryOfOrigin
  isActive (default true), categoryId, createdAt, updatedAt

ProductVariant
  id, productId, sku (unique), label, weightGrams?, priceEuroCents
  stockQuantity (default 0), isActive (default true), createdAt, updatedAt

ProductAllergen
  id, productId, allergen (AllergenType enum)
  [unique: productId + allergen]

ProductDietaryLabel
  id, productId, label (DietaryLabel enum)
  [unique: productId + label]

Customer
  id, email (unique), passwordHash, firstName, lastName
  phone?, isAdmin (default false), isActive (default true), createdAt, updatedAt

Address
  id, customerId, street, houseNumber, houseNumberAddition?
  postalCode, city, country (default "NL"), createdAt

Order
  id, customerId, shippingAddressId, status (OrderStatus enum, default PENDING)
  totalEuroCents, createdAt, updatedAt

OrderLine
  id, orderId, variantId, quantity, unitPriceEuroCents (frozen at purchase time)

Payment
  id, orderId (unique), molliePaymentId (unique), status (PaymentStatus enum)
  amountEuroCents, checkoutUrl?, createdAt, updatedAt

OrderEvent
  id, orderId, eventType, fromStatus?, toStatus?, note?, createdAt
```

### Enums

| Enum | Values |
|---|---|
| `OrderStatus` | PENDING, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED |
| `PaymentStatus` | PENDING, PAID, FAILED, REFUNDED |
| `DietaryLabel` | VEGAN, VEGETARIAN, HALAL, KOSHER, GLUTEN_FREE, DAIRY_FREE, NUT_FREE |
| `AllergenType` | GLUTEN, EGGS, FISH, PEANUTS, SOY, MILK, NUTS, CELERY, MUSTARD, SESAME, SULPHITES, LUPIN, MOLLUSCS, CRUSTACEANS |

### Migrations Applied
1. `20260309025622_init` — full initial schema
2. `20260309103711_add_admin_flag` — added `isAdmin` to Customer

### Schema Assessment: **Good**
The schema is well-designed. Prices stored as integer euro-cents (correct, avoids float precision). Order total is stored as a snapshot (correct — doesn't change if product price changes later). Line items capture the unit price at time of purchase. The audit log (`OrderEvent`) is append-only and covers the full order lifecycle. Allergen and dietary label enums use EU-standard classifications.

---

## 4. Backend Architecture Assessment

### Structure
```
controllers → services → Prisma (DB)
routes → controllers
middleware → routes
```

This layering is clean and correct. Controllers are thin (validate input, call service, return response). All business logic lives in services. No Prisma queries leak into controllers or routes.

### Authentication
- JWT issued at login, verified by `requireAuth` middleware
- Token extracted from `Authorization: Bearer <token>` header
- `req.customerId` populated from verified token
- `requireAdmin` extends `requireAuth`, checks `customer.isAdmin` from DB on each request (not cached in token — correct for security)
- bcrypt with 12 rounds (appropriate cost factor)

### Error Handling
- `AppError` class with `statusCode` property for intentional errors
- Global error middleware catches all thrown errors
- Development: full error details logged; Production: generic message returned
- Consistent `{ message: "..." }` error response shape

### Transactions
- Order creation uses `prisma.$transaction` — stock decrement, order creation, order line creation, and event log are atomic
- Payment webhook uses transaction for payment status + order status update
- Correct use of transactions for operations that must succeed or fail together

### Logging
- Pino structured logging throughout services
- Pretty-printing in development, JSON in production
- Log level configurable via `LOG_LEVEL` env var

### Email
- Resend integration with graceful degradation (logs warning if key absent, does not throw)
- Two email types: order confirmation (with line items table), shipping notification
- Email sending is outside transactions (non-blocking — correct)

### Environment Validation
- `JWT_SECRET` is required — server refuses to start if absent
- All other env vars have defaults or degrade gracefully
- Config centralised in `src/config/env.ts`

---

## 5. API Endpoints

### Public
```
GET  /health
GET  /api/v1/products              ?category=<slug>
GET  /api/v1/products/:slug
GET  /api/v1/categories
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/payments/webhook      (Mollie webhook, unauthenticated)
```

### Authenticated (customer)
```
GET  /api/v1/auth/me
POST /api/v1/addresses
GET  /api/v1/customers/me
POST /api/v1/orders
GET  /api/v1/orders
GET  /api/v1/orders/:id
POST /api/v1/payments/create
GET  /api/v1/payments/status/:orderId
```

### Admin only
```
GET   /api/v1/admin/orders
GET   /api/v1/admin/orders/:id
PATCH /api/v1/admin/orders/:id/status
GET   /api/v1/admin/products
POST  /api/v1/admin/products
PATCH /api/v1/admin/products/:id/stock
GET   /api/v1/admin/customers
GET   /api/v1/admin/customers/:id
```

---

## 6. Storefront Features

All pages are implemented and functional:

| Page | Route | Status |
|---|---|---|
| Homepage | `/` | Complete — hero, category grid, featured products |
| Products listing | `/products` | Complete — category filter pills, responsive grid |
| Product detail | `/products/[slug]` | Complete — two-column, variant selector, dietary labels, allergens |
| Cart | `/cart` | Complete — qty controls, summary panel, checkout link |
| Checkout | `/checkout` | Complete — address form, order creation, Mollie redirect |
| Login | `/login` | Complete |
| Register | `/register` | Complete |
| Account | `/account` | Complete — profile card, order history list |
| Order detail | `/orders/[id]` | Complete — payment status banner, line items, total |

**Design system:** Earthy bio-green aesthetic (`#2D6A4F` primary). Cormorant Garamond for headings, Jost for body. CSS custom properties for all colours. Consistent hover animations (card lift, image scale, button state feedback).

**State management:**
- `AuthContext` — token + customer object, login/logout/register actions, persisted to `sessionStorage` (see issue below)
- `CartContext` — in-memory cart items, add/remove/update/clear, computed totals

---

## 7. Admin Features

All major pages are implemented and functional:

| Page | Route | Status |
|---|---|---|
| Dashboard | `/` | Complete — quick-links to orders and products |
| Orders list | `/orders` | Complete — status filter, colour-coded badges, table |
| Order detail | `/orders/[id]` | Complete — line items, shipping address, status update, event timeline |
| Products list | `/products` | Complete — per-variant inline stock update with optimistic UI |
| Customers list | `/customers` | Complete — search, order count, total spend |
| Customer detail | `/customers/[id]` | Complete — profile, order history, addresses |
| Login | `/login` | Complete |

---

## 8. Issues Found

### 8.1 Business Logic Issues

**[HIGH] Stock decremented at order creation, not payment**
When a customer creates an order, stock is immediately decremented even before payment is confirmed. If the customer abandons the Mollie checkout, the stock is never restored. For a food shop with limited inventory, this can cause phantom stock depletion.
*See: `packages/backend/src/services/orders.service.ts`*

**[MEDIUM] No shipping cost calculation**
The cart shows "Calculated at checkout" but the checkout flow never adds a shipping amount. Orders are always charged the product subtotal only — delivery is effectively free. This is almost certainly unintentional.

---

### 8.2 Security Issues

**[HIGH] No rate limiting on auth endpoints**
`POST /auth/login` and `POST /auth/register` accept unlimited requests. Brute-force password attacks and registration flooding are unrestricted.

**[MEDIUM] No admin bootstrapping mechanism**
Promoting the first admin user requires direct SQL against the database. This is a deployment risk — there is no safe, documented first-run process.

**[LOW] CORS is fully open**
`cors()` with default settings allows all origins. Acceptable for development, must be restricted before production deployment.

**[LOW] No CSRF protection**
Not critical while using JWT in headers (CSRF attacks rely on cookies), but worth noting for future if cookie-based auth is added.

---

### 8.3 UX / Product Issues

**[HIGH] Cart is in-memory only**
`CartContext` stores items in React state only. All cart contents are lost on page refresh, tab close, or navigation. This is a critical UX failure for any real e-commerce site.
*See: `packages/storefront/src/context/CartContext.tsx`*

**[HIGH] Auth uses `sessionStorage` instead of `localStorage`**
JWT token is stored in `sessionStorage`, which is scoped to the browser tab and cleared when the tab closes. Customers are silently logged out whenever they close their browser.
*See: `packages/storefront/src/context/AuthContext.tsx`, key: `foodwebshop_token`*

**[MEDIUM] JWT expires after 1h with no refresh path**
Access tokens expire after 1 hour with no mechanism to refresh them. Users mid-session get silently 401'd on their next API call and must log in again.

**[MEDIUM] No address reuse at checkout**
Every checkout always creates a new `Address` record. Returning customers must re-type their full address every time.

---

### 8.4 Architecture Issues

**[HIGH] Admin `api.ts` is empty**
`packages/admin/src/lib/api.ts` contains only `export {}` despite a comment stating it should be the single module for all admin API calls. Every admin page performs raw `fetch()` inline, duplicating auth headers and error handling across 5+ files.
*File: `packages/admin/src/lib/api.ts`*

**[MEDIUM] Admin auth protection is per-page**
Each admin page individually calls `if (!isLoggedIn) router.replace('/login')`. Any new page added without this boilerplate is unprotected by default.

**[MEDIUM] No shared types package**
Types for `Product`, `Order`, `Customer`, etc. are defined in `packages/storefront/src/types/index.ts`, redefined inline in admin page components, and implied from Prisma in the backend. Schema changes must be updated in three places.

**[LOW] `formatDate` duplicated**
`packages/storefront/src/app/account/page.tsx` defines a local `formatDate` function rather than importing from `packages/storefront/src/lib/format.ts`.

**[LOW] Inline style objects mixed with Tailwind**
The storefront mixes Tailwind utility classes with `style={{ }}` props using CSS custom properties throughout. The admin uses almost exclusively Tailwind classes. The inconsistency makes the storefront harder to maintain.

---

### 8.5 Missing Functionality

| Missing Feature | Impact |
|---|---|
| No tests | High — any change could silently break existing behaviour |
| No CI/CD | High — no automated quality gate on PRs |
| No pagination on list endpoints | Medium — will degrade with real data volume |
| No product editing in admin | Medium — can create products but not fix mistakes |
| No image upload | Medium — product images require external URLs |
| No low stock alerts | Low — admins discover problems reactively |

---

## 9. What Is NOT an Issue

The following were considered and found to be **correctly implemented**:

- **Order total calculated server-side** — prevents client price tampering. ✓
- **Variant price frozen at order creation** — `unitPriceEuroCents` stored on `OrderLine`. ✓
- **Mollie webhook is idempotent** — replaying the webhook does not double-update status. ✓
- **Prisma transaction for order creation** — atomic stock decrement + order creation. ✓
- **Password hash never returned** — auth service explicitly strips `passwordHash` from all returned objects. ✓
- **Admin flag checked from DB on each request** — not cached in JWT, so revoking admin is immediate. ✓
- **Email is non-blocking** — email sending outside transaction; failure does not roll back the order. ✓
- **AppError pattern** — consistent intentional vs unexpected error handling. ✓
- **Prisma singleton** — prevents connection pool exhaustion. ✓

---

## 10. Recommendation

### Continue building on this foundation.

**Do not start fresh.** The backend architecture is layered correctly (controller → service → DB), transactions are used where required, errors are handled consistently, the schema is production-appropriate, and all core user flows are functional end-to-end.

A rewrite would spend weeks reproducing what is already working and would produce something worse before it got better. The issues identified are all fixable without structural surgery.

### Fix order (before adding any new features)

**Phase 1 — Critical fixes (FOOD-001 through FOOD-008):**
1. FOOD-001 — Cart persistence to localStorage
2. FOOD-002 — Auth persistence to localStorage
3. FOOD-003 — Stock decrement timing (expire unpaid orders)
4. FOOD-004 — Implement admin api.ts
5. FOOD-005 — Admin layout-level auth guard
6. FOOD-006 — Admin bootstrap route
7. FOOD-007 — Testing setup (vitest + supertest)
8. FOOD-008 — Rate limiting on auth endpoints

**Phase 2 — Product completeness (FOOD-009 through FOOD-015)**

**Phase 3 — Polish and production readiness (FOOD-016 through FOOD-018)**

See `docs/IMPLEMENTATION_BACKLOG.md` for full ticket details on each item.

---

## Appendix: File Tree (source files only)

```
packages/
├── backend/src/
│   ├── app.ts
│   ├── index.ts
│   ├── config/
│   │   └── env.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── customers.controller.ts
│   │   ├── orders.controller.ts
│   │   ├── payments.controller.ts
│   │   └── products.controller.ts
│   ├── lib/
│   │   ├── email.ts
│   │   ├── errors.ts
│   │   ├── logger.ts
│   │   └── prisma.ts
│   ├── middleware/
│   │   ├── admin.middleware.ts
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   │       ├── 20260309025622_init/
│   │       └── 20260309103711_add_admin_flag/
│   ├── routes/
│   │   ├── admin.ts
│   │   ├── addresses.ts
│   │   ├── auth.ts
│   │   ├── customers.ts
│   │   ├── orders.ts
│   │   ├── payments.ts
│   │   └── products.ts
│   ├── services/
│   │   ├── addresses.service.ts
│   │   ├── admin.service.ts
│   │   ├── auth.service.ts
│   │   ├── customers.service.ts
│   │   ├── orders.service.ts
│   │   ├── payments.service.ts
│   │   └── products.service.ts
│   └── types/
│       └── express.d.ts
├── storefront/src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── not-found.tsx
│   │   ├── account/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── login/page.tsx
│   │   ├── orders/[id]/page.tsx
│   │   ├── products/page.tsx
│   │   └── products/[slug]/page.tsx
│   ├── components/
│   │   ├── AddToCartButton.tsx
│   │   ├── Badge.tsx
│   │   ├── CategoryFilterPills.tsx
│   │   ├── NavAuthLink.tsx
│   │   ├── NavCartCount.tsx
│   │   ├── NavScrollShadow.tsx
│   │   ├── ProductCard.tsx
│   │   └── ProductVariantControl.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   └── Providers.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   ├── format.ts
│   │   └── useRequireAuth.ts
│   └── types/
│       └── index.ts
└── admin/src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── Providers.tsx
    │   ├── customers/page.tsx
    │   ├── customers/[id]/page.tsx
    │   ├── login/page.tsx
    │   ├── orders/page.tsx
    │   ├── orders/[id]/page.tsx
    │   └── products/page.tsx
    ├── components/
    │   └── LogoutButton.tsx
    ├── context/
    │   └── AuthContext.tsx
    └── lib/
        ├── api.ts          ← EMPTY (export {} only)
        └── format.ts
```
