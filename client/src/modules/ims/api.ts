import type { InventoryItem, CreateInventoryItemInput, UpdateInventoryItemInput } from '@opensteward/shared'
import { handleResponse } from '../../core/api'

const BASE = '/api/v1/ims/inventory-items'

export async function listInventoryItems(): Promise<InventoryItem[]> {
  return handleResponse(await fetch(BASE))
}

export async function createInventoryItem(input: CreateInventoryItemInput): Promise<InventoryItem> {
  return handleResponse(
    await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }),
  )
}

export async function updateInventoryItem(id: string, input: UpdateInventoryItemInput): Promise<InventoryItem> {
  return handleResponse(
    await fetch(`${BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }),
  )
}

export async function adjustInventoryItem(id: string, delta: number): Promise<InventoryItem> {
  return handleResponse(
    await fetch(`${BASE}/${id}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta }),
    }),
  )
}

export async function deleteInventoryItem(id: string): Promise<void> {
  return handleResponse(await fetch(`${BASE}/${id}`, { method: 'DELETE' }))
}
