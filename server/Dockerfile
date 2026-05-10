# ---- Base: install all workspace deps ----
FROM node:22-alpine AS base
RUN npm install -g pnpm
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/
COPY client/package.json ./client/
RUN pnpm install --frozen-lockfile

COPY shared/ ./shared/
COPY server/ ./server/

# ---- Dev: hot reload via volume mounts ----
FROM base AS dev
WORKDIR /app/server
CMD ["pnpm", "dev"]

# ---- Build: compile TypeScript ----
FROM base AS build
WORKDIR /app/server
RUN pnpm build

# ---- Production: minimal image ----
FROM node:22-alpine AS prod
WORKDIR /app
COPY server/package.json ./
RUN npm install --production --ignore-scripts
COPY --from=build /app/server/dist ./dist
COPY server/migrations ./migrations
EXPOSE 6736
CMD ["sh", "-c", "node dist/core/migrate.js && node dist/core/app.js"]
