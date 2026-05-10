# Database Conventions

---

## Schema Rules

- Every table has: `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`, `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at TIMESTAMPTZ DEFAULT NOW()`
- Use `TIMESTAMPTZ` (not `TIMESTAMP`) for all timestamps
- Foreign keys must have explicit `ON DELETE` behaviour defined
- Use `JSONB` (not `JSON`) for document columns — JSONB is indexed and queryable
- Never store calculated values — derive them at query time or in the service layer

---

## JSONB Usage

Use JSONB for data that is:
- Flexible or schema-varies-by-record (e.g., custom attributes per asset type)
- Document-like with no need for cross-row querying on internal fields
- Supplementary to the structured columns, not the primary identity of a record

Do not use JSONB as a way to avoid defining a proper schema. Structured, relational data belongs in columns.

---

## Migrations

- All schema changes go through migration files — never edit the database manually
- Migrations live in `server/migrations/` as plain SQL files
- Each migration is a pair: `{number}_{name}.up.sql` and `{number}_{name}.down.sql`
- Files are numbered sequentially (`0001_`, `0002_`, …) and never modified after being applied
- The runner is `server/src/core/migrate.ts` — a lightweight custom script using `pg` directly

**Commands (run from `server/`):**
```sh
pnpm migrate        # apply all pending up migrations
pnpm migrate:down   # roll back the most recently applied migration
```

**Creating a new migration:**
```sh
# Create the pair manually, incrementing the number
server/migrations/0002_your_change.up.sql
server/migrations/0002_your_change.down.sql
```

The runner tracks applied migrations in a `_migrations` table and wraps each in a transaction — a failed migration rolls back automatically.
