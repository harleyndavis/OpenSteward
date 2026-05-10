import type { AmsRepository } from './ams.repository.js'
import type { CreateAssetInput, UpdateAssetInput } from '@opensteward/shared'
import { HttpError } from '../../shared/errors.js'

export function createAmsService(repo: AmsRepository) {
  return {
    async listAssets() {
      return repo.findAll()
    },

    async getAsset(id: string) {
      const asset = await repo.findById(id)
      if (!asset) throw new HttpError(404, 'NOT_FOUND', `Asset '${id}' not found.`)
      return asset
    },

    async createAsset(input: CreateAssetInput) {
      return repo.create(input)
    },

    async updateAsset(id: string, input: UpdateAssetInput) {
      const asset = await repo.update(id, input)
      if (!asset) throw new HttpError(404, 'NOT_FOUND', `Asset '${id}' not found.`)
      return asset
    },

    async deleteAsset(id: string) {
      const deleted = await repo.delete(id)
      if (!deleted) throw new HttpError(404, 'NOT_FOUND', `Asset '${id}' not found.`)
    },
  }
}

export type AmsService = ReturnType<typeof createAmsService>
