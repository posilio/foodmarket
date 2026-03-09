FROM node:20-alpine AS base
WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/storefront/package.json ./packages/storefront/

RUN npm ci --workspace=packages/storefront

COPY packages/storefront ./packages/storefront

# NEXT_PUBLIC_* vars must be present at build time (baked into JS bundles)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN cd packages/storefront && npx next build

# ── Production image ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=base /app/package.json ./
COPY --from=base /app/package-lock.json ./
COPY --from=base /app/packages/storefront/package.json ./packages/storefront/

RUN npm ci --workspace=packages/storefront --omit=dev

COPY --from=base /app/packages/storefront/.next ./packages/storefront/.next
COPY --from=base /app/packages/storefront/public ./packages/storefront/public

EXPOSE 3000
CMD ["sh", "-c", "cd packages/storefront && npx next start -p 3000"]
