import { ref } from 'vue'
import type { Asset, CreateAssetInput, UpdateAssetInput } from '@opensteward/shared'
import * as api from '../api'

export function useAssets() {
  const assets = ref<Asset[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function load() {
    loading.value = true
    error.value = null
    try {
      assets.value = await api.listAssets()
    } catch {
      error.value = 'Failed to load assets.'
    } finally {
      loading.value = false
    }
  }

  async function create(input: CreateAssetInput) {
    const asset = await api.createAsset(input)
    assets.value.unshift(asset)
    return asset
  }

  async function update(id: string, input: UpdateAssetInput) {
    const asset = await api.updateAsset(id, input)
    const idx = assets.value.findIndex(a => a.id === id)
    if (idx !== -1) assets.value[idx] = asset
    return asset
  }

  async function remove(id: string) {
    await api.deleteAsset(id)
    assets.value = assets.value.filter(a => a.id !== id)
  }

  return { assets, loading, error, load, create, update, remove }
}
