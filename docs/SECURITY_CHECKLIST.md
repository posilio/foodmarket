# FoodMarket Security Checklist

## How to Run This Audit

Paste the following prompt into Claude Code from the project root (`C:\dev\FoodMarket`):

```
You are performing a comprehensive security audit of the FoodMarket codebase at C:\dev\FoodMarket.
[paste the full audit prompt from the session that generated this document]
```

The audit prompt reads ~20 files, then works through 12 sections, applying CRITICAL/HIGH fixes
immediately and marking lower-severity items REPORT ONLY.

---

## Audit Checklist — 12 Sections

### Section 1 — Authentication & JWT

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1.1 | JWT_SECRET presence check at startup | PASS | env.ts throws on missing/blank |
| 1.1b | JWT_SECRET minimum 32 chars | PASS | Added 2026-03-18 |
| 1.2 | Access token expiry 15m | PASS | `JWT_ACCESS_EXPIRES_IN` default `15m` |
| 1.2b | Refresh token expiry 30 days | PASS | `REFRESH_TOKEN_TTL_DAYS = 30` |
| 1.3 | Refresh tokens stored hashed | PARTIAL | Stored plaintext; hashing is a future hardening item (low risk given 40-byte random token; add to backlog) |
| 1.4 | Logout deletes refresh token in DB | PASS | `revokeRefreshToken` calls `deleteMany` |
| 1.5 | `jwt.verify` specifies `algorithms: ['HS256']` | PASS | Fixed 2026-03-18 — both auth.middleware.ts and admin.middleware.ts |
| 1.6 | Admin middleware re-queries DB for isAdmin | PASS | DB lookup in admin.middleware.ts — does not trust JWT claim |
| 1.7 | bcrypt rounds >= 12 | PASS | `BCRYPT_ROUNDS = 12` |
| 1.8 | Timing-safe dummy compare on user-not-found | PASS | Fixed 2026-03-18 — uses `bcrypt.compare` with dummy hash |

### Section 2 — Input Validation & Injection

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 2.1 | String fields have length limits | PARTIAL | Type + presence checks exist; explicit max-length not enforced — LOW risk (DB column limits apply) |
| 2.2 | No raw SQL (`queryRaw`/`executeRaw`) | PASS | No raw queries found |
| 2.3 | No `req.body` spread into Prisma `data:` | PASS | Fields destructured explicitly in all routes |
| 2.4 | Upload MIME type check | PASS | `ACCEPTED_MIME_TYPES` whitelist in upload.middleware.ts |
| 2.4b | Upload file size limit (5 MB) | PASS | `fileSize: 5 * 1024 * 1024` |
| 2.4c | Upload filename sanitised | PASS | Memory storage — filename never written to FS by multer |
| 2.5 | Numeric inputs validated (price, stock, qty) | PASS | `Number.isInteger` checks in admin routes |
| 2.6 | PDF upload MIME type + size limit | NA | PDF import uses Anthropic API — no multer upload exposed |

### Section 3 — Authorisation & Access Control

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 3.1 | All admin routes protected by `requireAdmin` | PASS | `router.use('/admin', requireAdmin)` covers all sub-routes |
| 3.2 | Customer data isolation (orders/addresses) | PASS | `customerId` from JWT used in all WHERE clauses |
| 3.3 | Bootstrap: disabled when secret not set | PASS | Returns 404 when `ADMIN_BOOTSTRAP_SECRET` is blank |
| 3.3b | Bootstrap: blocked when admin exists | PASS | Counts admins; returns 403 if any exist |
| 3.3c | Bootstrap: rate-limited | PARTIAL | Covered only by global limit (200/min) — consider adding `authRateLimit` |
| 3.4 | IDOR: ownership check on `:id` routes | PASS | Orders/addresses filter by `customerId` from JWT |
| 3.5 | Mollie webhook fetches fresh status from API | PASS | `mollie.payments.get(id)` called before any DB write |

### Section 4 — Security Headers & CORS

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 4.1 | Helmet installed and applied | PASS | Fixed 2026-03-18 — `app.use(helmet())` after trust proxy |
| 4.2 | CORS uses `ALLOWED_ORIGINS` (no wildcard) | PASS | Origin callback checks against allowlist |
| 4.2b | CORS `credentials: true` | PASS | Allows auth header with cross-origin requests |
| 4.3 | Cookie security (httpOnly/secure/sameSite) | NA | No cookies set server-side; tokens in localStorage (see 11.1) |

### Section 5 — Rate Limiting & Abuse Prevention

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 5.1 | Auth endpoints rate-limited | PASS | `authRateLimit` (10/15min) on login, register, refresh |
| 5.2 | Global rate limit applied | PASS | `globalRateLimit` (200/min) on all routes |
| 5.3 | `standardHeaders: true` (Retry-After) | PASS | Both limiters send RFC-compliant headers |
| 5.4 | Forgot-password / reset-password strict limit | PASS | Fixed 2026-03-18 — `passwordResetRateLimit` (5/hour) |
| 5.5 | Account lockout after repeated failures | FAIL | Not implemented — BACKLOG item (MEDIUM risk) |

### Section 6 — Sensitive Data & Logging

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 6.1 | No passwords/tokens logged | PASS | No sensitive fields passed to logger |
| 6.2 | Stack traces suppressed in production | PASS | error.middleware.ts omits `err` object in production |
| 6.3 | Global error handler uses Pino | PASS | All paths log via `logger.error` / `logger.warn` |
| 6.4 | `/health` returns minimal data | PASS | Returns `{ status, service }` only |

### Section 7 — Dependency Security

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 7.1 | Backend: `npm audit` | PASS | 0 vulnerabilities |
| 7.2 | Storefront: `npm audit` | FAIL | 1 HIGH — Next.js 14 has 4 CVEs (GHSA-3x4c, GHSA-ggv3, GHSA-9g9p, GHSA-h25m). Fix requires upgrade to Next.js 15/16 — BREAKING CHANGE. Track in backlog. |
| 7.3 | Admin: `npm audit` | FAIL | Same Next.js 14 vulnerability as storefront |

**Next.js CVE details:**
- GHSA-3x4c-7xq6-9pq8 — Unbounded next/image disk cache growth (DoS)
- GHSA-ggv3-7p47-pfv8 — HTTP request smuggling in rewrites
- GHSA-9g9p-9gw9-jx7f — DoS via Image Optimizer remotePatterns
- GHSA-h25m-26qc-wcjf — HTTP request deserialization DoS (RSC)

Fix: upgrade to Next.js 15+ when ready. This is a significant breaking change — add to backlog with HIGH priority.

### Section 8 — Environment & Secrets

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 8.1 | `.gitignore` covers `.env` files | PASS | `.env`, `.env.local`, `.env.*.local` all excluded |
| 8.1b | No `.env` in git history | PASS | No env file commits found |
| 8.2 | No hardcoded secrets in source | PASS | No `sk_live`/`sk_test`/hardcoded passwords found |
| 8.3 | Required vs optional vars documented | PASS | `JWT_SECRET` required (throws); others optional with defaults |
| 8.4 | `ANTHROPIC_API_KEY` server-side only | PASS | Not in any `NEXT_PUBLIC_*` variable |
| 8.5 | `MOLLIE_API_KEY` server-side only | PASS | Not in any `NEXT_PUBLIC_*` variable |

### Section 9 — GDPR & EU Law

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 9.1 | Privacy page exists | PASS | `/privacy/page.tsx` exists in storefront |
| 9.2 | Cookie banner exists | PASS | `CookieBanner.tsx` exists in storefront |
| 9.3 | OrderEvent notes contain no PII | NA | Notes contain Mollie payment IDs only |
| 9.4 | Resend usage | PASS | Transactional email only; no marketing without consent |
| 9.5 | Password reset tokens hashed + short-lived | PASS | SHA-256 hash; 15-min TTL; single-use (deleted on use) |
| 9.6 | Account deletion endpoint | FAIL | Not implemented — GDPR right-to-erasure gap. Add to backlog. |

### Section 10 — Payment Security

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 10.1 | Webhook idempotency | PASS | `order.status === PENDING` guard prevents double-processing |
| 10.2 | Server-side totals (not from client) | PASS | `order.totalEuroCents` used from DB; webhook amount not trusted |
| 10.3 | Atomic stock decrement | PASS | `prisma.$transaction` wraps stock decrement + order/payment update |
| 10.4 | Stock goes negative prevented | PASS | Throws `AppError(400)` if `stockQuantity < line.quantity` |

### Section 11 — Frontend Security

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 11.1 | JWT NOT in localStorage | FAIL | Tokens in localStorage — XSS risk. **HIGH**. Migration to httpOnly cookies is a larger refactor. Add to backlog. |
| 11.2 | Admin auth guard protects all admin routes | PASS | `AdminGuard` in root layout; re-queries `customer.isAdmin` |
| 11.3 | No console.log of tokens/passwords | PASS | No sensitive data in console.log calls |
| 11.4 | Next.js security headers configured | PARTIAL | `next.config.mjs` is empty — consider adding CSP/X-Frame-Options |
| 11.5 | CSRF protection | PARTIAL | SameSite not applicable (no cookies); localStorage tokens mean CSRF is not a risk for API calls, but XSS is (see 11.1) |

### Section 12 — Infrastructure

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 12.1 | Dockerfile: non-root user | PASS | Fixed 2026-03-18 — `USER node` added to runner stage |
| 12.1b | Dockerfile: no `.env` copied | PASS | Only source files and compiled output copied |
| 12.1c | Dockerfile: specific Node version | PASS | `node:20-alpine` pinned |
| 12.1d | Dockerfile: multi-stage build | PASS | `base` + `runner` stages; dev deps excluded from runner |
| 12.2 | PostgreSQL not exposed publicly | PASS | Port 5433 is local dev only; production uses Railway internal networking |

---

## Backlog Items (from this audit)

| Priority | Item | Section |
|----------|------|---------|
| HIGH | Upgrade Next.js to 15+ (4 CVEs including HTTP smuggling) | 7.2/7.3 |
| HIGH | Migrate tokens from localStorage to httpOnly cookies | 11.1 |
| MEDIUM | Account lockout after N failed login attempts | 5.5 |
| MEDIUM | GDPR right-to-erasure (account deletion endpoint) | 9.6 |
| MEDIUM | Add CSP/X-Frame-Options to next.config.mjs | 11.4 |
| LOW | Add authRateLimit to bootstrap endpoint | 3.3c |
| LOW | Hash refresh tokens in DB (currently plaintext 40-byte random) | 1.3 |
| LOW | Explicit max-length validation on string inputs | 2.1 |

---

## Last Audited

| Date | By | Findings | Fixed |
|------|----|----------|-------|
| 2026-03-18 | Claude Code (claude-sonnet-4-6) | 8 FAIL/PARTIAL items; 6 CRITICAL/HIGH fixed | JWT algo confusion, helmet, 32-char JWT_SECRET check, timing-safe dummy compare, password-reset rate limit (5/hour), Dockerfile non-root user |

---

## Recurring Checks

Run these before every production release:

```bash
# From project root:
npm audit --workspace=packages/backend
npm audit --workspace=packages/storefront
npm audit --workspace=packages/admin

cd packages/backend && npx tsc --noEmit
cd packages/storefront && npx tsc --noEmit
cd packages/admin && npx tsc --noEmit

npm run test --workspace=packages/backend
```

Also check:
- No new `NEXT_PUBLIC_` vars exposing server secrets
- No new routes added without `requireAuth` / `requireAdmin`
- No new `:id` param routes without ownership checks
- Any new file upload endpoints have MIME + size limits

---

## Update This Document When

- New API endpoints are added
- New database models are added (check PII, ownership)
- New third-party integrations are added (check API key handling)
- Dependencies are upgraded (re-run `npm audit`)
- Auth flow changes (check JWT, cookie, token handling)
