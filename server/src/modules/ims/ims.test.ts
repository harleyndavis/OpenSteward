import { beforeAll, afterEach, afterAll, describe, it, expect } from 'vitest'
import type { AddressInfo } from 'net'
import pg from 'pg'
import { createImsRepository } from './ims.repository.js'
import { createImsService } from './ims.service.js'
import { buildTestApp } from '../../test/app.js'

const db = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const repo = createImsRepository(db)
const service = createImsService(repo)
const app = buildTestApp({ imsService: service })

const UNKNOWN_ID = '00000000-0000-0000-0000-000000000000'
const INVALID_ID = 'not-a-uuid'
let baseUrl: string

beforeAll(async () => {
  await app.listen({ port: 0, host: '127.0.0.1' })
  const addr = app.server.address() as AddressInfo
  baseUrl = `http://127.0.0.1:${addr.port}`
})

afterEach(async () => {
  await db.query('DELETE FROM inventory_items')
})

afterAll(async () => {
  await app.close()
  await db.end()
})

describe('GET /api/v1/ims/inventory-items', () => {
  it('returns 200 with an empty list', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ims/inventory-items`)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ data: [] })
  })

  it('returns all items', async () => {
    await repo.create({ name: 'Widget', quantity: 10, unit: 'pcs' })
    await repo.create({ name: 'Bolt', quantity: 100, unit: 'pcs' })
    const res = await fetch(`${baseUrl}/api/v1/ims/inventory-items`)
    expect(res.status).toBe(200)
    const { data } = await res.json()
    expect(data).toHaveLength(2)
  })
})

describe('GET /api/v1/ims/inventory-items/:id', () => {
  it('returns the item by id', async () => {
    const item = await repo.create({ name: 'Widget', quantity: 5, unit: 'kg' })
    const res = await fetch(`${baseUrl}/api/v1/ims/inventory-items/${item.id}`)
    expect(res.status).toBe(200)
    expect((await res.json()).data.name).toBe('Widget')
  })

  it('returns 404 for an unknown id', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ims/inventory-items/${UNKNOWN_ID}`)
    expect(res.status).toBe(404)
    expect((await res.json()).error).toBe('NOT_FOUND')
  })

  it('returns 400 for a non-UUID id', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ims/inventory-items/${INVALID_ID}`)
    expect(res.status).toBe(400)
  })
})

describe('POST /api/v1/ims/inventory-items', () => {
  it('creates an item and returns 201', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ims/inventory-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Widget', quantity: 5, unit: 'kg' }),
    })
    expect(res.status).toBe(201)
    const { data } = await res.json()
    expect(data.name).toBe('Widget')
    expect(data.quantity).toBe(5)
    expect(data.id).toBeDefined()
  })

  it('returns 400 when required fields are missing', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ims/inventory-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Widget' }),
    })
    expect(res.status).toBe(400)
  })
})

describe('PATCH /api/v1/ims/inventory-items/:id', () => {
  it('updates the item and returns the updated data', async () => {
    const item = await repo.create({ name: 'Original', quantity: 1, unit: 'L' })
    const res = await fetch(`${baseUrl}/api/v1/ims/inventory-items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated', quantity: 99 }),
    })
    expect(res.status).toBe(200)
    const { data } = await res.json()
    expect(data.name).toBe('Updated')
    expect(data.quantity).toBe(99)
  })

  it('returns 404 for an unknown id', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ims/inventory-items/${UNKNOWN_ID}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'X' }),
    })
    expect(res.status).toBe(404)
  })

  it('returns 400 for a non-UUID id', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ims/inventory-items/${INVALID_ID}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'X' }),
    })
    expect(res.status).toBe(400)
  })
})

describe('POST /api/v1/ims/inventory-items/:id/adjust', () => {
  it('decrements quantity and returns the updated item', async () => {
    const item = await repo.create({ name: 'Pizza dough', quantity: 10, unit: 'kg' })
    const res = await fetch(`${baseUrl}/api/v1/ims/inventory-items/${item.id}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta: -3 }),
    })
    expect(res.status).toBe(200)
    expect((await res.json()).data.quantity).toBe(7)
  })

  it('increments quantity and returns the updated item', async () => {
    const item = await repo.create({ name: 'Toilet paper', quantity: 2, unit: 'rolls' })
    const res = await fetch(`${baseUrl}/api/v1/ims/inventory-items/${item.id}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta: 6 }),
    })
    expect(res.status).toBe(200)
    expect((await res.json()).data.quantity).toBe(8)
  })

  it('returns 400 when the adjustment would result in negative quantity', async () => {
    const item = await repo.create({ name: 'Eggs', quantity: 3, unit: 'pcs' })
    const res = await fetch(`${baseUrl}/api/v1/ims/inventory-items/${item.id}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta: -10 }),
    })
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('INSUFFICIENT_QUANTITY')
  })

  it('returns 404 for an unknown id', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ims/inventory-items/${UNKNOWN_ID}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta: -1 }),
    })
    expect(res.status).toBe(404)
  })

  it('returns 400 when delta is missing', async () => {
    const item = await repo.create({ name: 'Salt', quantity: 5, unit: 'kg' })
    const res = await fetch(`${baseUrl}/api/v1/ims/inventory-items/${item.id}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    expect(res.status).toBe(400)
  })

  it('returns 400 for a non-UUID id', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ims/inventory-items/${INVALID_ID}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta: -1 }),
    })
    expect(res.status).toBe(400)
  })
})

describe('DELETE /api/v1/ims/inventory-items/:id', () => {
  it('returns 204 and removes the item', async () => {
    const item = await repo.create({ name: 'Temp', quantity: 1, unit: 'pcs' })
    const res = await fetch(`${baseUrl}/api/v1/ims/inventory-items/${item.id}`, { method: 'DELETE' })
    expect(res.status).toBe(204)
    expect(await repo.findById(item.id)).toBeNull()
  })

  it('returns 404 for an unknown id', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ims/inventory-items/${UNKNOWN_ID}`, { method: 'DELETE' })
    expect(res.status).toBe(404)
  })

  it('returns 400 for a non-UUID id', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ims/inventory-items/${INVALID_ID}`, { method: 'DELETE' })
    expect(res.status).toBe(400)
  })
})
