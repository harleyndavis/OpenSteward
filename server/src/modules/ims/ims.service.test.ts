import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { InventoryItem } from '@opensteward/shared'
import { createImsService } from './ims.service.js'
import { HttpError } from '../../shared/errors.js'

function makeItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: 'item-1',
    name: 'Test Widget',
    quantity: 10,
    unit: 'pcs',
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
    adjust: vi.fn(),
    delete: vi.fn(),
  }
}

describe('ImsService', () => {
  let repo: ReturnType<typeof makeRepo>
  let service: ReturnType<typeof createImsService>

  beforeEach(() => {
    repo = makeRepo()
    service = createImsService(repo)
  })

  describe('listItems', () => {
    it('returns all items from the repo', async () => {
      const items = [makeItem(), makeItem({ id: 'item-2', name: 'Second' })]
      repo.findAll.mockResolvedValue(items)
      await expect(service.listItems()).resolves.toEqual(items)
    })
  })

  describe('getItem', () => {
    it('returns the item when found', async () => {
      const item = makeItem()
      repo.findById.mockResolvedValue(item)
      await expect(service.getItem('item-1')).resolves.toEqual(item)
      expect(repo.findById).toHaveBeenCalledWith('item-1')
    })

    it('throws 404 HttpError when not found', async () => {
      repo.findById.mockResolvedValue(null)
      const err = await service.getItem('missing').catch(e => e)
      expect(err).toBeInstanceOf(HttpError)
      expect(err.statusCode).toBe(404)
      expect(err.code).toBe('NOT_FOUND')
    })
  })

  describe('createItem', () => {
    it('delegates to the repo and returns the created item', async () => {
      const input = { name: 'New Widget', quantity: 5, unit: 'kg' }
      const created = makeItem(input)
      repo.create.mockResolvedValue(created)
      await expect(service.createItem(input)).resolves.toEqual(created)
      expect(repo.create).toHaveBeenCalledWith(input)
    })
  })

  describe('updateItem', () => {
    it('returns the updated item', async () => {
      const updated = makeItem({ name: 'Renamed' })
      repo.update.mockResolvedValue(updated)
      await expect(service.updateItem('item-1', { name: 'Renamed' })).resolves.toEqual(updated)
    })

    it('throws 404 HttpError when item does not exist', async () => {
      repo.update.mockResolvedValue(null)
      const err = await service.updateItem('missing', { name: 'X' }).catch(e => e)
      expect(err).toBeInstanceOf(HttpError)
      expect(err.statusCode).toBe(404)
    })
  })

  describe('adjustItem', () => {
    it('returns the updated item when the adjustment succeeds', async () => {
      const updated = makeItem({ quantity: 7 })
      repo.adjust.mockResolvedValue(updated)
      await expect(service.adjustItem('item-1', -3)).resolves.toEqual(updated)
      expect(repo.adjust).toHaveBeenCalledWith('item-1', -3)
    })

    it('throws 404 when the item does not exist', async () => {
      repo.adjust.mockResolvedValue(null)
      repo.findById.mockResolvedValue(null)
      const err = await service.adjustItem('missing', -1).catch(e => e)
      expect(err).toBeInstanceOf(HttpError)
      expect(err.statusCode).toBe(404)
    })

    it('throws 400 when the adjustment would result in negative quantity', async () => {
      repo.adjust.mockResolvedValue(null)
      repo.findById.mockResolvedValue(makeItem({ quantity: 2 }))
      const err = await service.adjustItem('item-1', -5).catch(e => e)
      expect(err).toBeInstanceOf(HttpError)
      expect(err.statusCode).toBe(400)
      expect(err.code).toBe('INSUFFICIENT_QUANTITY')
    })
  })

  describe('deleteItem', () => {
    it('resolves without a value on success', async () => {
      repo.delete.mockResolvedValue(true)
      await expect(service.deleteItem('item-1')).resolves.toBeUndefined()
    })

    it('throws 404 HttpError when item does not exist', async () => {
      repo.delete.mockResolvedValue(false)
      const err = await service.deleteItem('missing').catch(e => e)
      expect(err).toBeInstanceOf(HttpError)
      expect(err.statusCode).toBe(404)
    })
  })
})
