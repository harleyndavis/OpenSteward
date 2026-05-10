import { beforeAll, afterEach, afterAll, describe, it, expect } from 'vitest'
import type { AddressInfo } from 'net'
import pg from 'pg'
import { createAmsRepository } from './ams.repository.js'
import { createAmsService } from './ams.service.js'
import { buildTestApp } from '../../test/app.js'

const db = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const repo = createAmsRepository(db)
const service = createAmsService(repo)
const app = buildTestApp({ amsService: service })

const UNKNOWN_ID = '00000000-0000-0000-0000-000000000000'
let baseUrl: string

beforeAll(async () => {
  await app.listen({ port: 0, host: '127.0.0.1' })
  const addr = app.server.address() as AddressInfo
  baseUrl = `http://127.0.0.1:${addr.port}`
})

afterEach(async () => {
  await db.query('DELETE FROM assets')
})

afterAll(async () => {
  await app.close()
  await db.end()
})

describe('GET /api/v1/ams/assets', () => {
  it('returns 200 with an empty list', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ams/assets`)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ data: [] })
  })

  it('returns all assets', async () => {
    await repo.create({ name: 'Laptop' })
    await repo.create({ name: 'Printer' })
    const res = await fetch(`${baseUrl}/api/v1/ams/assets`)
    expect(res.status).toBe(200)
    const { data } = await res.json()
    expect(data).toHaveLength(2)
  })
})

describe('GET /api/v1/ams/assets/:id', () => {
  it('returns the asset by id', async () => {
    const asset = await repo.create({ name: 'Laptop', status: 'available' })
    const res = await fetch(`${baseUrl}/api/v1/ams/assets/${asset.id}`)
    expect(res.status).toBe(200)
    expect((await res.json()).data.name).toBe('Laptop')
  })

  it('returns 404 for an unknown id', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ams/assets/${UNKNOWN_ID}`)
    expect(res.status).toBe(404)
    expect((await res.json()).error).toBe('NOT_FOUND')
  })
})

describe('POST /api/v1/ams/assets', () => {
  it('creates an asset and returns 201 with available as the default status', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ams/assets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Monitor' }),
    })
    expect(res.status).toBe(201)
    const { data } = await res.json()
    expect(data.name).toBe('Monitor')
    expect(data.status).toBe('available')
    expect(data.id).toBeDefined()
  })

  it('returns 400 when name is missing', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ams/assets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'available' }),
    })
    expect(res.status).toBe(400)
  })

  it('returns 400 for an invalid status value', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ams/assets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Monitor', status: 'broken' }),
    })
    expect(res.status).toBe(400)
  })
})

describe('PATCH /api/v1/ams/assets/:id', () => {
  it('updates the asset and returns the updated data', async () => {
    const asset = await repo.create({ name: 'Old Name', status: 'available' })
    const res = await fetch(`${baseUrl}/api/v1/ams/assets/${asset.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Name', status: 'maintenance' }),
    })
    expect(res.status).toBe(200)
    const { data } = await res.json()
    expect(data.name).toBe('New Name')
    expect(data.status).toBe('maintenance')
  })

  it('returns 404 for an unknown id', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ams/assets/${UNKNOWN_ID}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'X' }),
    })
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/v1/ams/assets/:id', () => {
  it('returns 204 and removes the asset', async () => {
    const asset = await repo.create({ name: 'Temp' })
    const res = await fetch(`${baseUrl}/api/v1/ams/assets/${asset.id}`, { method: 'DELETE' })
    expect(res.status).toBe(204)
    expect(await repo.findById(asset.id)).toBeNull()
  })

  it('returns 404 for an unknown id', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ams/assets/${UNKNOWN_ID}`, { method: 'DELETE' })
    expect(res.status).toBe(404)
  })
})
