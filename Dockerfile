# ─── Stage 1: Builder ────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (cache optimization)
COPY package.json package-lock.json* ./
COPY packages/shared-enums/package.json ./packages/shared-enums/
COPY packages/shared-constants/package.json ./packages/shared-constants/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-zod/package.json ./packages/shared-zod/
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY apps/api/package.json ./apps/api/

RUN npm install --frozen-lockfile

# Copy source files
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/
COPY tsconfig.base.json ./

# Generate Prisma client
RUN npm run db:generate --workspace=apps/api

# Build API
RUN npm run build --workspace=apps/api

# ─── Stage 2: Production ─────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S pathforge -u 1001

# Copy package files for production deps
COPY package.json package-lock.json* ./
COPY packages/shared-enums/package.json ./packages/shared-enums/
COPY packages/shared-constants/package.json ./packages/shared-constants/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-zod/package.json ./packages/shared-zod/
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY apps/api/package.json ./apps/api/

RUN npm install --frozen-lockfile --omit=dev

# Copy built assets
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages ./packages

# Copy Prisma files needed at runtime
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Set ownership
RUN chown -R pathforge:nodejs /app

USER pathforge

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/v1/health || exit 1

CMD ["node", "apps/api/dist/server.js"]
