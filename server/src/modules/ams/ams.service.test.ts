import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Asset } from '@opensteward/shared'
import { createAmsService } from './ams.service.js'
import { HttpError } from '../../shared/errors.js'

function makeAsset(overrides: Partial<Asset> = {}): Asset {
  return {
    id: 'asset-1',
    name: 'Test Laptop',
    status: 'available',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

function makeRepo() {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
}

describe('AmsService', () => {
  let repo: ReturnType<typeof makeRepo>
  let service: ReturnType<typeof createAmsService>

  beforeEach(() => {
    repo = makeRepo()
    service = createAmsService(repo)
  })

  describe('listAssets', () => {
    it('returns all assets from the repo', async () => {
      const assets = [makeAsset(), makeAsset({ id: 'asset-2', name: 'Printer' })]
      repo.findAll.mockResolvedValue(assets)
      await expect(service.listAssets()).resolves.toEqual(assets)
    })
  })

  describe('getAsset', () => {
    it('returns the asset when found', async () => {
      const asset = makeAsset()
      repo.findById.mockResolvedValue(asset)
      await expect(service.getAsset('asset-1')).resolves.toEqual(asset)
      expect(repo.findById).toHaveBeenCalledWith('asset-1')
    })

    it('throws 404 HttpError when not found', async () => {
      repo.findById.mockResolvedValue(null)
      const err = await service.getAsset('missing').catch(e => e)
      expect(err).toBeInstanceOf(HttpError)
      expect(err.statusCode).toBe(404)
      expect(err.code).toBe('NOT_FOUND')
    })
  })

  describe('createAsset', () => {
    it('delegates to the repo and returns the created asset', async () => {
      const input = { name: 'New Monitor', status: 'available' as const }
      const created = makeAsset(input)
      repo.create.mockResolvedValue(created)
      await expect(service.createAsset(input)).resolves.toEqual(created)
      expect(repo.create).toHaveBeenCalledWith(input)
    })
  })

  describe('updateAsset', () => {
    it('returns the updated asset', async () => {
      const updated = makeAsset({ status: 'maintenance' })
      repo.update.mockResolvedValue(updated)
      await expect(service.updateAsset('asset-1', { status: 'maintenance' })).resolves.toEqual(updated)
    })

    it('throws 404 HttpError when asset does not exist', async () => {
      repo.update.mockResolvedValue(null)
      const err = await service.updateAsset('missing', { name: 'X' }).catch(e => e)
      expect(err).toBeInstanceOf(HttpError)
      expect(err.statusCode).toBe(404)
    })
  })

  describe('deleteAsset', () => {
    it('resolves without a value on success', async () => {
      repo.delete.mockResolvedValue(true)
      await expect(service.deleteAsset('asset-1')).resolves.toBeUndefined()
    })

    it('throws 404 HttpError when asset does not exist', async () => {
      repo.delete.mockResolvedValue(false)
      const err = await service.deleteAsset('missing').catch(e => e)
      expect(err).toBeInstanceOf(HttpError)
      expect(err.statusCode).toBe(404)
    })
  })
})
