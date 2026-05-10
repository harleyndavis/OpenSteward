# Testing

---

## Practice: Test-Driven Development

Write tests **before** the implementation. The cycle is:

1. **Red** — Write a failing test that describes the behaviour you want.
2. **Green** — Write the minimum code to make it pass.
3. **Refactor** — Clean up without breaking the tests.

Tests that follow existing code are a safety net, not a substitute. When adding any new feature or fixing a bug, start with the test.

---

## Philosophy

- Test behaviour, not implementation. Tests should survive refactors.
- Integration tests for API routes must hit a real database (a dedicated test DB), not mocks. Mock/prod divergence has caused real bugs.
- Unit tests for pure business logic in service files.

---

## Structure

- Test files are co-located with source: `ims.service.ts` → `ims.service.test.ts`
- Integration tests live in the module folder: `ims.test.ts`
- Use a dedicated test database — never the development database

---

## What to Test

| Layer | Test type | What to cover |
|---|---|---|
| Repository | Integration | Queries return expected shapes, filters work correctly |
| Service | Unit | Business logic, edge cases, error conditions |
| Routes | Integration | HTTP status codes, response shapes, validation rejection |
| Composables | Unit | State transitions, computed values |

---

## Test Database Setup

Integration tests connect to a real PostgreSQL database. A dedicated Docker Compose file spins up a test instance on port `5433` so it never touches development data.

**First-time setup:**

```sh
# Copy the example env file
cp .env.test.example .env.test

# Start the test database
docker compose -f docker-compose.test.yml up -d
```

Vitest automatically loads `.env.test` before tests run, overriding the `DATABASE_URL` from `.env`. The `migrate()` call in each integration test's `beforeAll` ensures the schema is up to date before the suite runs.

**Teardown:**

```sh
docker compose -f docker-compose.test.yml down
```

The test container uses no named volume, so stopping it discards all data — each `up` starts clean.

---

## Running Tests

```sh
# Server — unit + integration tests
cd server && pnpm test

# Server — watch mode
cd server && pnpm test --watch

# Server — with coverage
cd server && pnpm test --coverage

# Client — composable and component tests
cd client && pnpm test:unit

# Client — watch mode
cd client && pnpm test:unit --watch
```
