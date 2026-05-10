import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { InventoryItem } from '@opensteward/shared'
import { useInventoryItems } from './useInventoryItems'
import * as api from '../api'

vi.mock('../api')

const mockItems: InventoryItem[] = [
  { id: '1', name: 'Apples', quantity: 10, unit: 'kg', createdAt: '', updatedAt: '' },
  { id: '2', name: 'Milk', quantity: 2, unit: 'L', createdAt: '', updatedAt: '' },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useInventoryItems', () => {
  describe('load', () => {
    it('sets items on success and clears loading', async () => {
      vi.mocked(api.listInventoryItems).mockResolvedValue(mockItems)
      const { items, loading, error, load } = useInventoryItems()

      const p = load()
      expect(loading.value).toBe(true)

      await p

      expect(loading.value).toBe(false)
      expect(items.value).toEqual(mockItems)
      expect(error.value).toBeNull()
    })

    it('sets error message on failure', async () => {
      vi.mocked(api.listInventoryItems).mockRejectedValue(new Error('Network error'))
      const { items, error, load } = useInventoryItems()

      await load()

      expect(items.value).toEqual([])
      expect(error.value).toBe('Failed to load inventory items.')
    })
  })

  describe('create', () => {
    it('prepends the new item to the list', async () => {
      const newItem = mockItems[0]
      vi.mocked(api.createInventoryItem).mockResolvedValue(newItem)
      const { items, create } = useInventoryItems()

      await create({ name: 'Apples', quantity: 10, unit: 'kg' })

      expect(items.value).toHaveLength(1)
      expect(items.value[0]).toEqual(newItem)
    })
  })

  describe('update', () => {
    it('replaces the item in the list by id', async () => {
      vi.mocked(api.listInventoryItems).mockResolvedValue([...mockItems])
      const { items, load, update } = useInventoryItems()
      await load()

      const updated = { ...mockItems[0], name: 'Updated Apples' }
      vi.mocked(api.updateInventoryItem).mockResolvedValue(updated)
      await update('1', { name: 'Updated Apples' })

      expect(items.value[0].name).toBe('Updated Apples')
      expect(items.value[1]).toEqual(mockItems[1])
    })
  })

  describe('adjust', () => {
    it('replaces the item in the list with the updated quantity', async () => {
      vi.mocked(api.listInventoryItems).mockResolvedValue([...mockItems])
      const { items, load, adjust } = useInventoryItems()
      await load()

      const adjusted = { ...mockItems[0], quantity: 7 }
      vi.mocked(api.adjustInventoryItem).mockResolvedValue(adjusted)
      await adjust('1', -3)

      expect(items.value[0].quantity).toBe(7)
      expect(items.value[1]).toEqual(mockItems[1])
    })
  })

  describe('remove', () => {
    it('removes the item from the list by id', async () => {
      vi.mocked(api.listInventoryItems).mockResolvedValue([...mockItems])
      const { items, load, remove } = useInventoryItems()
      await load()

      vi.mocked(api.deleteInventoryItem).mockResolvedValue(undefined)
      await remove('1')

      expect(items.value).toHaveLength(1)
      expect(items.value[0].id).toBe('2')
    })
  })
})
