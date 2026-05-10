import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Asset } from '@opensteward/shared'
import { useAssets } from './useAssets'
import * as api from '../api'

vi.mock('../api')

const mockAssets: Asset[] = [
  { id: '1', name: 'Laptop', status: 'available', createdAt: '', updatedAt: '' },
  { id: '2', name: 'Printer', status: 'maintenance', createdAt: '', updatedAt: '' },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useAssets', () => {
  describe('load', () => {
    it('sets assets on success and clears loading', async () => {
      vi.mocked(api.listAssets).mockResolvedValue(mockAssets)
      const { assets, loading, error, load } = useAssets()

      const p = load()
      expect(loading.value).toBe(true)

      await p

      expect(loading.value).toBe(false)
      expect(assets.value).toEqual(mockAssets)
      expect(error.value).toBeNull()
    })

    it('sets error message on failure', async () => {
      vi.mocked(api.listAssets).mockRejectedValue(new Error('Network error'))
      const { assets, error, load } = useAssets()

      await load()

      expect(assets.value).toEqual([])
      expect(error.value).toBe('Failed to load assets.')
    })
  })

  describe('create', () => {
    it('prepends the new asset to the list', async () => {
      const newAsset = mockAssets[0]
      vi.mocked(api.createAsset).mockResolvedValue(newAsset)
      const { assets, create } = useAssets()

      await create({ name: 'Laptop', status: 'available' })

      expect(assets.value).toHaveLength(1)
      expect(assets.value[0]).toEqual(newAsset)
    })
  })

  describe('update', () => {
    it('replaces the asset in the list by id', async () => {
      vi.mocked(api.listAssets).mockResolvedValue([...mockAssets])
      const { assets, load, update } = useAssets()
      await load()

      const updated = { ...mockAssets[0], status: 'checked-out' as const }
      vi.mocked(api.updateAsset).mockResolvedValue(updated)
      await update('1', { status: 'checked-out' })

      expect(assets.value[0].status).toBe('checked-out')
      expect(assets.value[1]).toEqual(mockAssets[1])
    })
  })

  describe('remove', () => {
    it('removes the asset from the list by id', async () => {
      vi.mocked(api.listAssets).mockResolvedValue([...mockAssets])
      const { assets, load, remove } = useAssets()
      await load()

      vi.mocked(api.deleteAsset).mockResolvedValue(undefined)
      await remove('1')

      expect(assets.value).toHaveLength(1)
      expect(assets.value[0].id).toBe('2')
    })
  })
})
