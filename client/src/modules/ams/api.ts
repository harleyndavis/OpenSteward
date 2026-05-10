import type { Asset, CreateAssetInput, UpdateAssetInput } from '@opensteward/shared'
import { handleResponse } from '../../core/api'

const BASE = '/api/v1/ams/assets'

export async function listAssets(): Promise<Asset[]> {
  return handleResponse(await fetch(BASE))
}

export async function createAsset(input: CreateAssetInput): Promise<Asset> {
  return handleResponse(
    await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }),
  )
}

export async function updateAsset(id: string, input: UpdateAssetInput): Promise<Asset> {
  return handleResponse(
    await fetch(`${BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }),
  )
}

export async function deleteAsset(id: string): Promise<void> {
  return handleResponse(await fetch(`${BASE}/${id}`, { method: 'DELETE' }))
}
