# FoodMarket — Deployment Guide

> Railway-based deployment for all three services + PostgreSQL.
> See `NEW_CHAT_STARTER.md` for project context and the Go-Live Checklist.

---

## Architecture

```
Railway
├── foodmarket-backend    (Node.js, port 4000)
├── foodmarket-storefront (Next.js, port 3000)
├── foodmarket-admin      (Next.js, port 3001)
└── foodmarket-postgres   (PostgreSQL 16)
```

All services communicate via Railway's internal network. The backend is the only service that touches the database directly.

---

## Prerequisites

1. [Railway CLI](https://docs.railway.app/develop/cli) installed (`npm i -g @railway/cli`)
2. Mollie account with live API keys
3. Resend account with a verified sending domain
4. (Optional) Anthropic API key for PDF stock import

---

## Step-by-Step Deployment

### 1. Create the Railway Project

```bash
railway login
railway init   # creates a new project
```

Or create via the Railway dashboard at railway.app.

### 2. Provision PostgreSQL

In the Railway dashboard: **New Service → Database → PostgreSQL 16**.

Copy the `DATABASE_URL` from the Railway Postgres service's Variables tab — it will look like:
```
postgresql://postgres:<password>@<host>.railway.internal:5432/railway
```

### 3. Deploy the Backend

```bash
cd packages/backend
railway up
```

Or connect the GitHub repo in the Railway dashboard and set the root directory to `packages/backend`.

**Set these environment variables in Railway before the first deploy:**

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | Railway Postgres URL | From step 2 |
| `JWT_SECRET` | Random 64-char string | **Never reuse the dev value** |
| `NODE_ENV` | `production` | |
| `PORT` | `4000` | Railway sets this automatically |
| `MOLLIE_API_KEY` | `live_...` | **Live key only — never test key in prod** |
| `MOLLIE_REDIRECT_BASE` | `https://your-storefront.railway.app` | Storefront URL |
| `WEBHOOK_BASE_URL` | `https://your-backend.railway.app` | Backend URL for Mollie webhooks |
| `ALLOWED_ORIGINS` | `https://your-storefront.railway.app,https://your-admin.railway.app` | Comma-separated |
| `RESEND_API_KEY` | From Resend dashboard | Required for order emails |
| `RESEND_FROM` | `orders@yourdomain.com` | Must be verified in Resend |
| `ANTHROPIC_API_KEY` | From Anthropic console | Optional — only needed for PDF import |
| `ADMIN_BOOTSTRAP_SECRET` | Random secret | Set for first run, **clear after first admin created** |
| `SHIPPING_FLAT_RATE_CENTS` | e.g. `499` | €4.99 flat shipping |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | |
| `JWT_EXPIRES_IN` | `15m` | |

### 4. Run Migrations

After the backend service is deployed, run migrations from your local machine against the production database:

```bash
cd packages/backend
DATABASE_URL="postgresql://..." node_modules/.bin/prisma.cmd migrate deploy --schema=src/prisma/schema.prisma
```

Or add a Railway deploy hook that runs `prisma migrate deploy` on each deploy.

### 5. Bootstrap the First Admin

With the backend live and `ADMIN_BOOTSTRAP_SECRET` set:

```bash
curl -X POST https://your-backend.railway.app/api/v1/bootstrap/admin \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@yourdomain.com", "secret": "your-bootstrap-secret"}'
```

The endpoint returns 403 after the first admin is created. **Remove `ADMIN_BOOTSTRAP_SECRET` from Railway env vars** once done.

### 6. Deploy Storefront

```bash
cd packages/storefront
railway up
```

**Environment variables:**

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.railway.app` |
| `NEXT_PUBLIC_SHIPPING_CENTS` | Must match `SHIPPING_FLAT_RATE_CENTS` on backend |

### 7. Deploy Admin Panel

```bash
cd packages/admin
railway up
```

**Environment variables:**

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.railway.app` |

### 8. Configure Custom Domains

In the Railway dashboard for each service: **Settings → Domains → Add Custom Domain**.

Point your DNS records at Railway:
- `yourdomain.com` → storefront
- `admin.yourdomain.com` → admin panel
- `api.yourdomain.com` → backend

Railway provisions SSL certificates automatically via Let's Encrypt.

---

## Mollie Webhook Configuration

After deploying the backend, register the webhook URL in the Mollie dashboard:

- **Webhook URL:** `https://api.yourdomain.com/api/v1/payments/webhook`
- **Events:** All payment events

The backend's Mollie webhook handler is idempotent — duplicate events are safe.

---

## Post-Deploy Verification

Run through the Go-Live Checklist in `NEW_CHAT_STARTER.md`. Key checks:

1. `GET https://api.yourdomain.com/health` → `{ "status": "ok" }`
2. Place a test order end-to-end (use a Mollie test card even in production — test mode is toggled per-key, not per-request)
3. Verify order confirmation email arrives
4. Mark an order SHIPPED in the admin → verify shipping notification email fires
5. Verify the Mollie webhook fires and order status moves to PAID

---

## Rolling Back a Migration

Prisma does not support automatic rollback. To revert a migration:

1. Write a manual reverse migration SQL file.
2. Deploy it using `prisma migrate deploy`.
3. Remove the original migration from the `migrations/` folder.

For destructive changes (dropping columns), always take a database snapshot before deploying.

---

## Environment Variable Summary (Quick Reference)

### Backend (required for full functionality)

```env
DATABASE_URL=postgresql://...
JWT_SECRET=<64-char random>
NODE_ENV=production
PORT=4000
MOLLIE_API_KEY=live_...
MOLLIE_REDIRECT_BASE=https://yourdomain.com
WEBHOOK_BASE_URL=https://api.yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
RESEND_API_KEY=re_...
RESEND_FROM=orders@yourdomain.com
SHIPPING_FLAT_RATE_CENTS=499
JWT_ACCESS_EXPIRES_IN=15m
JWT_EXPIRES_IN=15m
```

### Backend (optional)

```env
ANTHROPIC_API_KEY=sk-ant-...   # PDF stock import
ADMIN_BOOTSTRAP_SECRET=...     # First run only — clear after use
```

### Storefront + Admin

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SHIPPING_CENTS=499  # storefront only
```
