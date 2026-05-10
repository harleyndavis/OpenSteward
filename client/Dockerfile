# ---- Base: install all workspace deps ----
FROM node:22-alpine AS base
RUN npm install -g pnpm
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/
COPY client/package.json ./client/
RUN pnpm install --frozen-lockfile

COPY client/ ./client/

# ---- Dev: Vite dev server with hot reload via volume mounts ----
FROM base AS dev
WORKDIR /app/client
CMD ["pnpm", "dev", "--host", "0.0.0.0"]

# ---- Build: Vite production build ----
FROM base AS build
WORKDIR /app/client
RUN pnpm build

# ---- Production: serve with nginx ----
FROM nginx:alpine AS prod
COPY --from=build /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
