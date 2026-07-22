# ─── ZYPHOR MULTI-STAGE DOCKERFILE ──────────────────────────────────────────
# Optimized for production deployment of Next.js 14 App Router

# 1. Base Stage
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# 2. Dependencies Stage
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# 3. Builder Stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time env vars
ENV DOCKER_BUILD=true
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# 4. Production Runner Stage
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
