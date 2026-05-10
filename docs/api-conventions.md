# API Conventions

The backend is API-first. The Vue frontend is the first client, not the only one. Design every endpoint as if external clients will consume it.

---

## Base URL

```
/api/v1/{module}/{resource}
```

Example: `/api/v1/ims/inventory-items`

---

## Response Envelope

All responses use a consistent shape.

**Success:**
```json
{
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 143 }
}
```

**Error:**
```json
{
  "error": "NOT_FOUND",
  "message": "Inventory item with id 'abc' was not found.",
  "details": {}
}
```

---

## Conventions

- Use plural nouns for resources: `/inventory-items`, not `/inventory-item`
- Use HTTP verbs correctly: `GET` (read), `POST` (create), `PUT` (full replace), `PATCH` (partial update), `DELETE`
- Paginate all list endpoints: `?page=1&limit=20` (default: 20, max: 100)
- Filter via query params: `?category=produce&inStock=true`
- Return `201 Created` with the created resource on `POST`
- Return `204 No Content` on successful `DELETE`
- Never expose raw database errors — always map to clean error responses

---

## Versioning

The API is versioned from day one (`/api/v1/`). Breaking changes require a new version prefix — no in-place changes to an existing version.
