export interface InventoryItem {
  id: string
  name: string
  description?: string
  quantity: number
  unit: string
  category?: string
  createdAt: string
  updatedAt: string
}

export interface CreateInventoryItemInput {
  name: string
  quantity: number
  unit: string
  description?: string
  category?: string
}

export interface UpdateInventoryItemInput {
  name?: string
  quantity?: number
  unit?: string
  description?: string
  category?: string
}

export interface AdjustInventoryItemInput {
  delta: number
}
