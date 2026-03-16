# FoodMarket — New Chat Starter

> Paste this file into any new Claude session to get full context on the project instantly.
> Last updated: 2026-03-16

---

## Project Name

**FoodMarket** — An e-commerce platform for international specialty food ingredients, targeting the Netherlands market. Customers browse, add to cart, and pay via Mollie. An internal admin panel manages orders, products, stock, and customers.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | npm workspaces |
| Backend | Node.js, TypeScript, Express v5, Prisma v6, PostgreSQL 16 |
| ORM | Prisma v6 (pinned — v7 removed `url` from datasource, incompatible) |
| Auth | JWT (`jsonwebtoken`), bcrypt (12 rounds), opaque refresh tokens |
| Payments | Mollie (`@mollie/api-client`) |
| Email | Resend (graceful degradation if key absent) |
| Logging | Pino (pretty in dev, JSON in prod) — **default export**: `import logger from '../lib/logger'` |
| AI | Anthropic API (`claude-sonnet-4-20250514`) — used for PDF invoice parsing |
| Storefront | Next.js 14 App Router, React 18, Tailwind CSS v4 |
| Admin | Next.js 14 App Router, React 18, Tailwind CSS v4 |
| Shared types | `packages/shared/src/index.ts` (`@foodmarket/shared`) |
| Database | PostgreSQL 16 (Docker, port 5433) |

---

## Ports

| Service | Port | URL |
|---|---|---|
| Backend API | 4000 | http://localhost:4000 |
| Storefront | 3000 | http://localhost:3000 |
| Admin panel | 3001 | http://localhost:3001 |
| PostgreSQL | 5433 | localhost:5433 (non-standard — native Windows PG on 5432) |

---

## Dev Commands

```bash
# Kill stale Node processes first (Windows — tsx watch lingers on port after crash)
Get-Process -Name 'node','tsx' -ErrorAction SilentlyContinue | Stop-Process -Force

# Start all three servers
npm run dev --workspace=packages/backend    # port 4000
npm run dev --workspace=packages/storefront # port 3000
npm run dev --workspace=packages/admin      # port 3001

# Health check
curl http://localhost:4000/health

# Prisma commands (run from packages/backend/)
node_modules/.bin/prisma.cmd migrate dev --schema=src/prisma/schema.prisma --name <name>
node_modules/.bin/prisma.cmd generate --schema=src/prisma/schema.prisma
node_modules/.bin/prisma.cmd studio --schema=src/prisma/schema.prisma

# Tests
npm run test --workspace=packages/backend
```

---

## Environment Variables

### `packages/backend/.env`

```env
DATABASE_URL=postgresql://foodwebshop:changeme@localhost:5433/foodwebshop_dev
JWT_SECRET=your-secret-here           # REQUIRED — server won't start without it
PORT=4000
NODE_ENV=development

# Access tokens are short-lived; refresh tokens extend sessions to 30 days
JWT_ACCESS_EXPIRES_IN=15m
JWT_EXPIRES_IN=15m

# Flat shipping rate in euro cents (499 = €4.99)
SHIPPING_FLAT_RATE_CENTS=499

# CORS — comma-separated allowed origins; defaults to both localhost ports
ALLOWED_ORIGINS=

# Bootstrap — set a secret to enable POST /api/v1/bootstrap/admin (first-run only)
ADMIN_BOOTSTRAP_SECRET=

# AI invoice parsing — required for the Stock Import PDF feature
ANTHROPIC_API_KEY=

# Optional — features degrade gracefully if absent
MOLLIE_API_KEY=
MOLLIE_REDIRECT_BASE=http://localhost:3000
WEBHOOK_BASE_URL=http://localhost:4000
RESEND_API_KEY=
RESEND_FROM=onboarding@resend.dev
```

### `packages/storefront/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SHIPPING_CENTS=499
```

### `packages/admin/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## Key File Locations

| What | Path |
|---|---|
| Backend entry point | `packages/backend/src/index.ts` |
| Express app setup | `packages/backend/src/app.ts` |
| Prisma schema | `packages/backend/src/prisma/schema.prisma` |
| Migrations | `packages/backend/src/prisma/migrations/` |
| Seed script | `packages/backend/src/prisma/seed.ts` |
| Env config (validated) | `packages/backend/src/config/env.ts` |
| AppError class | `packages/backend/src/lib/errors.ts` |
| Prisma singleton | `packages/backend/src/lib/prisma.ts` |
| Email helpers | `packages/backend/src/lib/email.ts` |
| Auth middleware | `packages/backend/src/middleware/auth.middleware.ts` |
| Admin middleware | `packages/backend/src/middleware/admin.middleware.ts` |
| Upload middleware (multer) | `packages/backend/src/middleware/upload.middleware.ts` |
| Rate limit middleware | `packages/backend/src/middleware/rateLimit.middleware.ts` |
| All route files | `packages/backend/src/routes/` |
| All service files | `packages/backend/src/services/` |
| Backend tests | `packages/backend/src/__tests__/` |
| Uploaded images (static) | `packages/backend/uploads/` → served at `/uploads/*` |
| Shared types | `packages/shared/src/index.ts` |
| Storefront API client | `packages/storefront/src/lib/api.ts` |
| AuthContext (storefront) | `packages/storefront/src/context/AuthContext.tsx` |
| CartContext | `packages/storefront/src/context/CartContext.tsx` |
| Admin API client | `packages/admin/src/lib/api.ts` |
| AuthContext (admin) | `packages/admin/src/context/AuthContext.tsx` |
| Admin auth guard | `packages/admin/src/components/AdminGuard.tsx` |
| CI pipeline | `.github/workflows/ci.yml` |
| Docker Compose | `docker-compose.yml` |
| Shared TS config | `tsconfig.base.json` |

---

## Database Tables

| Table | Purpose |
|---|---|
| `Category` | Product groupings (Asian Sauces, Grains & Rice, etc.) |
| `Product` | Base product — name, slug, description, imageUrl, countryOfOrigin |
| `ProductVariant` | SKU + EAN (unique, nullable) with price (euro cents), weight, stock qty |
| `ProductAllergen` | Join: product ↔ allergen enum (14 EU allergens) |
| `ProductDietaryLabel` | Join: product ↔ dietary label (VEGAN, HALAL, etc.) |
| `Customer` | User account — email, passwordHash, name, isAdmin, isActive |
| `RefreshToken` | Opaque 30-day refresh tokens linked to Customer |
| `Address` | Delivery address (NL format), linked to Customer |
| `Order` | Customer order — status, shippingAddressId, totalEuroCents, shippingCents |
| `OrderLine` | Line item — variantId, quantity, unitPriceEuroCents (frozen at purchase) |
| `Payment` | Mollie payment record, one-to-one with Order |
| `OrderEvent` | Append-only audit log of all order status changes |

**Enums:** `OrderStatus` (PENDING/PAID/PROCESSING/SHIPPED/DELIVERED/CANCELLED/REFUNDED), `PaymentStatus` (PENDING/PAID/FAILED/REFUNDED), `DietaryLabel` (7), `AllergenType` (14)

---

## What Is Built and Working

### Backend
- Auth: register, login, JWT verify, refresh token (15m access / 30d refresh), logout, `requireAuth` / `requireAdmin` middleware
- Rate limiting: strict on `/auth/login` + `/auth/register`, global on all routes
- Bootstrap: `POST /api/v1/bootstrap/admin` (first-run only, requires `ADMIN_BOOTSTRAP_SECRET`)
- Products: list (cursor pagination), get by slug, list categories
- Orders: create (transactional — validates stock, calculates total + shipping server-side), list, get by ID
- Payments: create Mollie payment, idempotent webhook handler, status polling
- Email: order confirmation + shipping notification via Resend
- Addresses: list saved addresses for authenticated customer
- Admin APIs:
  - Orders: list (filtered, paginated), detail, status update with `OrderEvent`
  - Products: list (paginated), create, update, add variant, update variant (label/price/active/EAN), update stock
  - Categories: list
  - Customers: list (paginated, searchable), detail with orders + addresses
  - Low stock alerts: `GET /admin/products/low-stock?threshold=5`
  - Image upload: `POST /admin/upload/image` → saved to `uploads/`, served statically
  - Stock import: `POST /admin/import/parse-pdf` (Anthropic PDF parsing), `POST /admin/import/preview` (EAN matching), `POST /admin/import/confirm` (atomic stock increment)
- CORS: origin whitelist via `ALLOWED_ORIGINS` env var
- Global error handler with `AppError` class, Pino structured logging
- Tests: vitest + supertest (`src/__tests__/auth.test.ts`, `orders.test.ts`)
- CI: GitHub Actions (`.github/workflows/ci.yml`) — typecheck + tests on every push

### Storefront (Next.js 14, port 3000)
- Homepage — hero, category grid, featured products
- Products listing — with category filter pills
- Product detail — two-column, variant selector, dietary labels, allergens, country flag
- Cart — **localStorage-persisted**, qty controls, order summary
- Checkout — saved address selector, new address form, shipping cost display, order creation → Mollie redirect
- Login / Register — **localStorage-persisted** auth with silent refresh on mount
- Account — profile + order history
- Order detail/confirmation — payment status banner, line items

### Admin (Next.js 14, port 3001)
- Auth guard via `AdminGuard` component (wraps all pages in root layout)
- Dashboard — low stock alert banner (amber, top-5 variants) + quick links
- Orders list — status filter, cursor pagination with load-more, colour-coded badges
- Order detail — line items, shipping address, status update dropdown, event timeline
- Products list — cursor pagination, Edit button per product
- Product edit page — fields form, image upload (to backend `/uploads`), inline variant editing (label, price, EAN), add variant form
- Customers list — search, cursor pagination, order count, total spend
- Customer detail — profile, order history, addresses
- **Stock Import page** (`/import`):
  - PDF card — uploads invoice to `parse-pdf`, AI extracts line items
  - CSV card — parses UTF-16 tab-separated order file in-browser
  - Preview — matched variants table (checkboxes, stock delta) + unmatched table
  - Confirm — atomic stock increment for checked variants
- Typed `api.ts` client covering all endpoints (`adminApi.orders`, `.products`, `.customers`, `.upload`, `.import`, `.auth`)
- Nav: Orders | Products | Customers | Import

---

## What Still Needs to Be Done

### FOOD-003 — Stock Decrement Timing (P1)

Stock is decremented when an order is **created** (before payment). If the customer abandons the Mollie payment, stock remains locked forever.

**Fix:** Add `stockReservedUntil` timestamp to `Order`. Run a background job every 5 minutes that cancels PENDING orders past their reservation window and restores stock. The Mollie webhook (PAID event) beats the expiry for legitimate orders.

**Files:**
- `packages/backend/src/prisma/schema.prisma` (add `stockReservedUntil` to `Order`)
- `packages/backend/src/services/orders.service.ts`
- New: `packages/backend/src/jobs/expireOrders.ts`
- `packages/backend/src/index.ts` (start the job)
- New migration required

---

## Key Conventions

### Backend

**Error handling:**
```ts
import { AppError } from '../lib/errors';
throw new AppError('Product not found', 404);
// Unexpected errors propagate to error middleware as 500
```

**Logging** (default export — NOT named):
```ts
import logger from '../lib/logger';
logger.info({ orderId }, 'Order created');
logger.error({ err }, 'Payment webhook failed');
```

**Service layer pattern:**
```ts
// Controllers validate input → call services → return response
// Services contain all business logic and DB calls
// Never put Prisma queries directly in controllers or routes
```

**API response shape:**
```json
{ "data": { ... } }       // success
{ "message": "..." }      // error
```

**Cursor pagination pattern:**
```ts
// take n+1, pop last item if present, return nextCursor
const items = await prisma.foo.findMany({ take: take + 1, skip: cursor ? 1 : 0, cursor });
let nextCursor: string | null = null;
if (items.length > take) nextCursor = items.pop()!.id;
return { data: items, nextCursor, total };
```

**Auth:**
```ts
// Attach token: Authorization: Bearer <token>
// req.customerId is set by requireAuth middleware (string UUID)
```

**Prisma migrate** (from `packages/backend/` — TTY required for `migrate dev`):
```bash
# If Docker is running and TTY available:
node_modules/.bin/prisma.cmd migrate dev --schema=src/prisma/schema.prisma --name <name>
# If no TTY (CI / bash subprocess) — create migration SQL manually, then:
node_modules/.bin/prisma.cmd migrate deploy --schema=src/prisma/schema.prisma
node_modules/.bin/prisma.cmd generate --schema=src/prisma/schema.prisma
```

### Storefront

**Fonts:** Cormorant Garamond (serif, headings), Jost (sans-serif, body/UI)

**Colours (CSS vars):**
- `--color-primary` — earthy bio-green (`#2D6A4F`)
- `--color-primary-light` — light green tint
- `--color-accent-warm` — price/CTA colour
- `--color-text`, `--color-text-muted`, `--color-surface`, `--color-border`

**Auth in client components:**
```ts
const { token, customer, isLoggedIn, login, logout } = useAuth();
```

**Cart in client components:**
```ts
const { items, addItem, removeItem, updateQuantity, totalEuroCents } = useCart();
```

### Admin

**All API calls go through `adminApi` in `packages/admin/src/lib/api.ts`.** No raw `fetch()` in page components.

**Auth check pattern** (AdminGuard handles this globally — no per-page boilerplate needed):
```ts
// AdminGuard in layout.tsx wraps all pages — redirects to /login if not authenticated
```

---

## Known Issues / Gotchas

1. **FOOD-003 open** — stock decremented at order creation, not payment. Abandoned checkouts lock stock.
2. **Prisma pinned to v6** — do not upgrade to v7 (removed `url` from datasource block).
3. **Next.js config must be `.mjs`** — `next.config.ts` not supported in Next.js 14.
4. **Stale tsx processes on Windows** — always kill old Node/tsx processes before starting dev servers.
5. **`prisma migrate dev` requires a TTY** — in bash subprocesses (CI, scripts), use `migrate deploy` + manual SQL instead.
6. **`ANTHROPIC_API_KEY` required for PDF import** — `parse-pdf` returns 502 if the key is not set.

---

## Suggested Starter Prompt for a New Claude Session

```
I'm working on FoodMarket, a specialty food e-commerce platform.
Please read NEW_CHAT_STARTER.md at the project root for full context before we begin.

Today I want to work on: [describe what you want to do]
```
