# FoodWebshop

A Netherlands-based online food e-commerce platform built as a monorepo.

## Packages

| Package | Description | Default port |
|---------|-------------|--------------|
| `packages/storefront` | Customer-facing Next.js 14 app | 3000 |
| `packages/admin` | Internal admin Next.js 14 app | 3001 |
| `packages/backend` | Express + Node.js REST API | 4000 |

The two frontends communicate exclusively with the backend API. Neither frontend connects to the database directly.

## Tech stack

- **Frontend**: Next.js 14, TypeScript, App Router
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL 16, Prisma ORM
- **Logging**: Pino (structured JSON logs)

## Getting started

### Prerequisites

- Node.js >= 20
- npm >= 10
- Docker + Docker Compose

### 1. Clone and install

```bash
git clone <repo-url> foodwebshop
cd foodwebshop
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
cp packages/backend/.env.example packages/backend/.env
cp packages/storefront/.env.local.example packages/storefront/.env.local
cp packages/admin/.env.local.example packages/admin/.env.local
```

Edit each `.env` file and fill in real values where needed.

### 3. Start the database

```bash
docker compose up -d
```

### 4. Run database migrations (once backend is set up)

```bash
cd packages/backend
npx prisma migrate dev
```

### 5. Start all packages in development mode

```bash
npm run dev
```
