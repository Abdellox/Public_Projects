# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/web/package.json apps/web/
COPY packages/database/package.json packages/database/
COPY packages/types/package.json packages/types/
COPY packages/validation/package.json packages/validation/
COPY packages/auth/package.json packages/auth/
RUN npm ci --ignore-scripts

# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/database/node_modules ./packages/database/node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# DATABASE_URL is only needed at runtime; a placeholder keeps the build hermetic.
ENV DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder
RUN npm run build

# ---- runtime ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000
RUN addgroup -S supplyflow && adduser -S supplyflow -G supplyflow

COPY --from=build --chown=supplyflow:supplyflow /app/node_modules ./node_modules
COPY --from=build --chown=supplyflow:supplyflow /app/packages ./packages
COPY --from=build --chown=supplyflow:supplyflow /app/apps/web/.next ./apps/web/.next
COPY --from=build --chown=supplyflow:supplyflow /app/apps/web/public ./apps/web/public
COPY --from=build --chown=supplyflow:supplyflow /app/apps/web/package.json ./apps/web/

USER supplyflow
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "@supplyflow/web"]
