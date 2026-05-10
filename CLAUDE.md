# CLAUDE.md

Self-hosted knowledgebase and source of truth for households, non-profits, and small businesses. Modular by design — inventory, assets, point of sale, and recipes are each self-contained domains built on a shared foundation. Built API-first on Vue 3 + Fastify + PostgreSQL.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Vue 3 + Vite + TypeScript (Composition API, `<script setup>`) |
| Backend | Fastify + TypeScript |
| Database | PostgreSQL (JSONB for flexible data, relational for structured) |
| Shared types | `/shared/types` — imported by both client and server |

---

## Dev Commands

```sh
# Install dependencies
pnpm install

# Start server (from server/)
pnpm dev

# Start client (from client/)
pnpm dev

# Run migrations (from server/)
pnpm migrate
pnpm migrate:down   # roll back one

# Run tests (from server/ or client/)
pnpm test
```

---

## Key Rules

- **API-first.** The Vue frontend is the first client, not the only one. Design every endpoint as if external clients will consume it.
- **Thin edges.** Business logic belongs in services (server) and composables (client) — not in route handlers or Vue templates.
- **No `process.env` outside `core/config.ts`.** Config is loaded once at startup and exported from there.
- **Strict TypeScript everywhere.** `"strict": true`. No `any` without an explanatory comment.
- **No mock DBs in integration tests.** Tests must hit a real test database — mock/prod divergence has caused real bugs.
- **All schema changes via migrations.** Never touch the database manually. Every migration needs `up` and `down`.

---

## Module Pattern

IMS and AMS are the core modules. POS and Recipes are planned example modules that demonstrate what can be built on the platform — they are not the primary focus.

All modules follow the same internal structure on both client and server. See [docs/module-anatomy.md](docs/module-anatomy.md).

---

## Standards Reference

| Topic | Document |
|---|---|
| API design | [docs/api-conventions.md](docs/api-conventions.md) |
| Database conventions | [docs/database.md](docs/database.md) |
| TypeScript & naming | [docs/conventions.md](docs/conventions.md) |
| Testing approach | [docs/testing.md](docs/testing.md) |
| Module anatomy | [docs/module-anatomy.md](docs/module-anatomy.md) |
| Contributing workflow | [CONTRIBUTING.md](CONTRIBUTING.md) |

---

## What Not to Do

- Don't put business logic in Vue templates or Fastify route handlers
- Don't access `process.env` outside `core/config.ts`
- Don't use `any` without a comment explaining why
- Don't write migrations without a `down` function
- Don't mock the database in integration tests
- Don't duplicate types — shared types live in `/shared/types/` only
- Don't commit `.env` files
- Don't put client-only or server-only types in `/shared/types/`
