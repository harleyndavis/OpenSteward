# Contributing to OpenSteward

Thanks for contributing. This document covers the workflow for branches, commits, and pull requests. For coding standards, see the [`docs/`](docs/) folder.

---

## Commit Conventions

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(ims): add low-stock threshold alerts
fix(api): return 404 when item not found instead of 500
docs(ams): document asset lifecycle states
refactor(pos): extract payment logic into service
test(ims): add integration tests for stock filter
```

Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

---

## Branch Naming

```
feat/ims-low-stock-alerts
fix/api-404-handling
docs/ams-lifecycle
refactor/pos-payment-service
```

---

## Pull Requests

- One concern per PR — keep them focused
- Include a description of what changed and why
- No merging with failing tests
- All PRs must follow the standards in [`docs/`](docs/)

---

## Adding a New Module

When adding a new module, follow this checklist:

1. Add the module folder to both `client/src/modules/` and `server/src/modules/`
2. Create all required files per [docs/module-anatomy.md](docs/module-anatomy.md)
3. Add shared types to `/shared/types/{module}.types.ts`
4. Register the module routes in `server/src/core/` app bootstrap
5. Add the module routes to the Vue Router in `client/src/core/`
6. Write a `README.md` in the module folder explaining its purpose and any non-obvious design decisions
7. Add at least one integration test before opening a PR

---

## Standards Reference

| Topic | Document |
|---|---|
| API design | [docs/api-conventions.md](docs/api-conventions.md) |
| Database conventions | [docs/database.md](docs/database.md) |
| TypeScript & naming | [docs/conventions.md](docs/conventions.md) |
| Testing approach | [docs/testing.md](docs/testing.md) |
| Module anatomy | [docs/module-anatomy.md](docs/module-anatomy.md) |
