# OpenSteward

OpenSteward is a self-hosted knowledgebase and source of truth for organizations of any size — households, non-profits, small businesses, and beyond. It gives you a single place to track what you own, what you have on hand, and what's happening in your operation.

The platform is modular by design: each domain (inventory, assets, point of sale, recipes) is a self-contained module built on a shared foundation. Use only what you need. Built API-first so that future native clients can consume the same backend without a rewrite.

---

## Modules

### Core

| Module | Status | Description |
|---|---|---|
| **IMS** | In development | Inventory management: products, stock levels, suppliers, purchase orders |
| **AMS** | In development | Asset management: tracked assets, check-in/out, lifecycle, location |

### Built on top (examples of what the platform enables)

| Module | Status | Description |
|---|---|---|
| **POS** | Planned | Point of sale: sales transactions, receipts, payment flows — powered by IMS inventory |
| **Recipes** | Planned | Recipe management with live "what can I make?" queries against IMS stock |

---

## Tech Stack

- **Frontend** — Vue 3 + Vite + TypeScript
- **Backend** — Fastify + TypeScript
- **Database** — PostgreSQL
- **Shared types** — `/shared/types` consumed by both client and server

---

## Project Structure

```
/
├── client/                   # Vue 3 + Vite frontend
│   ├── src/
│   │   ├── modules/          # One folder per feature module
│   │   │   ├── ims/
│   │   │   ├── ams/
│   │   │   ├── pos/
│   │   │   └── recipes/
│   │   ├── shared/           # Shared UI components, composables, utilities
│   │   │   ├── components/
│   │   │   ├── composables/
│   │   │   └── utils/
│   │   └── core/             # App shell: routing, auth, layout, global state
│   ├── index.html
│   └── vite.config.ts
│
├── server/                   # Fastify backend
│   ├── src/
│   │   ├── modules/          # One folder per feature module (mirrors client)
│   │   │   ├── ims/
│   │   │   ├── ams/
│   │   │   ├── pos/
│   │   │   └── recipes/
│   │   ├── shared/           # Shared middleware, utilities, error types
│   │   └── core/             # App bootstrap, DB connection, config, plugin registration
│   └── tsconfig.json
│
├── shared/                   # Types shared between client and server
│   └── types/
│       ├── ims.types.ts
│       ├── ams.types.ts
│       ├── pos.types.ts
│       └── common.types.ts   # Pagination, API response envelope, etc.
│
├── docs/                     # Standards and architecture documentation
├── CLAUDE.md                 # AI coding assistant context
├── CONTRIBUTING.md           # Contribution guidelines
└── README.md
```

---

## Running with Docker

The recommended way to run OpenSteward. One command starts the database, server, and client with hot reload.

```sh
cp .env.example .env       # configure POSTGRES_PASSWORD and other vars
docker compose up --build  # first run builds images
docker compose up          # subsequent runs
```

- Client: http://localhost:5173
- API: http://localhost:6736

**Production:**
```sh
docker compose -f docker-compose.prod.yml up --build
```
The client is served by nginx on port 80, which also proxies `/api/` internally. The server is not exposed publicly.

---

## Getting Started (without Docker)

> Full setup instructions will be added once tooling is finalized. The steps below reflect the expected workflow.

**Prerequisites:** Node.js 22+, PostgreSQL, pnpm

```sh
# 1. Clone the repo
git clone <repo-url>
cd opensteward

# 2. Install dependencies
pnpm install

# 3. Set up environment config
cp .env.example .env
# Edit .env with your local database credentials

# 4. Run database migrations
cd server && pnpm migrate

# 5. Start the dev servers (each in its own terminal)
cd server && pnpm dev   # API on port 6736
cd client && pnpm dev   # UI on port 5173 (Vite default)
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branch naming, commit conventions, and the PR process.

## License

TBD — MIT recommended.
