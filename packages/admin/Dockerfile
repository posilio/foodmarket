FROM node:20-alpine AS base
WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/admin/package.json ./packages/admin/

RUN npm ci --workspace=packages/admin

COPY packages/admin ./packages/admin

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN cd packages/admin && npx next build

# ── Production image ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=base /app/package.json ./
COPY --from=base /app/package-lock.json ./
COPY --from=base /app/packages/admin/package.json ./packages/admin/

RUN npm ci --workspace=packages/admin --omit=dev

COPY --from=base /app/packages/admin/.next ./packages/admin/.next
# public/ may not exist in the admin package — ignore if missing
COPY --from=base /app/packages/admin/public* ./packages/admin/public/ 2>/dev/null || true

EXPOSE 3001
CMD ["sh", "-c", "cd packages/admin && npx next start -p 3001"]
