# TypeScript & Naming Conventions

---

## TypeScript

- **Strict mode is on.** `tsconfig.json` has `"strict": true`. No exceptions.
- Avoid `any`. If you must use it, add a comment explaining why.
- Prefer `interface` over `type` for object shapes; use `type` for unions, aliases, and utilities.
- Shared types (used by both client and server) live in `/shared/types/` — never duplicated.
- All Fastify route handlers must have typed request and reply generics.
- Use runtime validation at API boundaries (TypeScript types are compile-time only). The validation library is TBD — update this document once decided between Fastify JSON Schema and Zod.

---

## Naming

| Context | Convention | Example |
|---|---|---|
| Files (all) | kebab-case | `inventory-item.ts`, `use-stock-level.ts` |
| Vue components | PascalCase | `InventoryList.vue`, `AssetCard.vue` |
| TypeScript types / interfaces | PascalCase | `InventoryItem`, `ApiResponse<T>` |
| Variables and functions | camelCase | `getItemById`, `stockLevel` |
| Database tables | snake_case | `inventory_items`, `asset_records` |
| Database columns | snake_case | `created_at`, `unit_of_measure` |
| API endpoints | kebab-case, plural nouns | `/api/v1/ims/inventory-items` |
| Environment variables | SCREAMING_SNAKE_CASE | `DATABASE_URL`, `APP_PORT` |
