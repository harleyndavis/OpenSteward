# Module Anatomy

Every feature module follows the same internal structure on both client and server. New modules must conform to this pattern — consistency is what makes the codebase navigable.

---

## Server Module

```
server/src/modules/ims/
├── ims.routes.ts         # Route definitions and handler wiring
├── ims.service.ts        # Business logic (no direct DB calls)
├── ims.repository.ts     # All database queries
├── ims.schema.ts         # JSON Schema for Fastify request validation
└── ims.test.ts           # Integration tests for this module's routes
```

**Route handlers are thin wiring only.** They receive a request, call a service method, and return a response. Business logic belongs in the service. DB access belongs in the repository.

---

## Client Module

```
client/src/modules/ims/
├── views/                # Page-level components (mapped to routes)
│   ├── ImsListView.vue
│   └── ImsDetailView.vue
├── components/           # Module-specific UI components
├── composables/          # Vue composables (e.g. useInventoryItem)
├── api.ts                # All API calls for this module
└── index.ts              # Module barrel export
```

**Business logic belongs in composables — not in Vue templates.** Views and components should be declarative; composables own the state and behaviour.

---

## Module README

Each module folder should contain a `README.md` that explains:
- What the module does
- Any non-obvious design decisions
- Key data models or state it owns
