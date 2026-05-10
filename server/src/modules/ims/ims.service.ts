import type { ImsRepository } from './ims.repository.js'
import type { CreateInventoryItemInput, UpdateInventoryItemInput } from '@opensteward/shared'
import { HttpError } from '../../shared/errors.js'

export function createImsService(repo: ImsRepository) {
  return {
    async listItems() {
      return repo.findAll()
    },

    async getItem(id: string) {
      const item = await repo.findById(id)
      if (!item) throw new HttpError(404, 'NOT_FOUND', `Inventory item '${id}' not found.`)
      return item
    },

    async createItem(input: CreateInventoryItemInput) {
      return repo.create(input)
    },

    async updateItem(id: string, input: UpdateInventoryItemInput) {
      const item = await repo.update(id, input)
      if (!item) throw new HttpError(404, 'NOT_FOUND', `Inventory item '${id}' not found.`)
      return item
    },

    async adjustItem(id: string, delta: number) {
      const item = await repo.adjust(id, delta)
      if (item) return item
      const existing = await repo.findById(id)
      if (!existing) throw new HttpError(404, 'NOT_FOUND', `Inventory item '${id}' not found.`)
      throw new HttpError(400, 'INSUFFICIENT_QUANTITY', `Adjustment would result in negative quantity. Current: ${existing.quantity}.`)
    },

    async deleteItem(id: string) {
      const deleted = await repo.delete(id)
      if (!deleted) throw new HttpError(404, 'NOT_FOUND', `Inventory item '${id}' not found.`)
    },
  }
}

export type ImsService = ReturnType<typeof createImsService>
