import { ref } from 'vue'
import type { InventoryItem, CreateInventoryItemInput, UpdateInventoryItemInput } from '@opensteward/shared'
import * as api from '../api'

export function useInventoryItems() {
  const items = ref<InventoryItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function load() {
    loading.value = true
    error.value = null
    try {
      items.value = await api.listInventoryItems()
    } catch {
      error.value = 'Failed to load inventory items.'
    } finally {
      loading.value = false
    }
  }

  async function create(input: CreateInventoryItemInput) {
    const item = await api.createInventoryItem(input)
    items.value.unshift(item)
    return item
  }

  async function update(id: string, input: UpdateInventoryItemInput) {
    const item = await api.updateInventoryItem(id, input)
    const idx = items.value.findIndex(i => i.id === id)
    if (idx !== -1) items.value[idx] = item
    return item
  }

  async function adjust(id: string, delta: number) {
    const item = await api.adjustInventoryItem(id, delta)
    const idx = items.value.findIndex(i => i.id === id)
    if (idx !== -1) items.value[idx] = item
    return item
  }

  async function remove(id: string) {
    await api.deleteInventoryItem(id)
    items.value = items.value.filter(i => i.id !== id)
  }

  return { items, loading, error, load, create, update, adjust, remove }
}
