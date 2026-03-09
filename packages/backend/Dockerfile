FROM node:20-alpine AS base
WORKDIR /app

# Copy workspace root files needed for npm workspaces
COPY package.json package-lock.json tsconfig.base.json ./

# Copy backend package manifest so npm can resolve the workspace
COPY packages/backend/package.json ./packages/backend/

# Install all deps (workspace context required for npm ci)
RUN npm ci --workspace=packages/backend

# Copy backend source
COPY packages/backend ./packages/backend

# Generate Prisma client (must run before tsc so generated types are available)
RUN cd packages/backend && node_modules/.bin/prisma generate --schema=src/prisma/schema.prisma

# Compile TypeScript → dist/
RUN cd packages/backend && \
    node --max-old-space-size=4096 ../../node_modules/typescript/bin/tsc --project tsconfig.json

# ── Production image ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=base /app/package.json ./
COPY --from=base /app/package-lock.json ./
COPY --from=base /app/packages/backend/package.json ./packages/backend/

# Install production deps only
RUN npm ci --workspace=packages/backend --omit=dev

# Copy compiled output
COPY --from=base /app/packages/backend/dist ./packages/backend/dist

# Copy generated Prisma client binaries and schema
COPY --from=base /app/packages/backend/node_modules/.prisma ./packages/backend/node_modules/.prisma
COPY --from=base /app/packages/backend/src/prisma/schema.prisma ./packages/backend/src/prisma/schema.prisma
COPY --from=base /app/packages/backend/src/prisma/migrations ./packages/backend/src/prisma/migrations

ENV NODE_ENV=production
EXPOSE 4000

# Run pending migrations then start the server
CMD ["sh", "-c", "cd packages/backend && node_modules/.bin/prisma migrate deploy --schema=src/prisma/schema.prisma && node dist/index.js"]
