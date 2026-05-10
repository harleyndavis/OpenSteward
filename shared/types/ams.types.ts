export type AssetStatus = 'available' | 'checked-out' | 'maintenance' | 'retired'

export interface Asset {
  id: string
  name: string
  description?: string
  status: AssetStatus
  location?: string
  customAttributes?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface CreateAssetInput {
  name: string
  description?: string
  status?: AssetStatus
  location?: string
  customAttributes?: Record<string, unknown>
}

export interface UpdateAssetInput {
  name?: string
  description?: string
  status?: AssetStatus
  location?: string
  customAttributes?: Record<string, unknown>
}
