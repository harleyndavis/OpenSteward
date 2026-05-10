import type { FastifyInstance } from 'fastify'
import type { ImsService } from './ims.service.js'
import type { AdjustInventoryItemInput, CreateInventoryItemInput, UpdateInventoryItemInput } from '@opensteward/shared'
import {
  adjustInventoryItemSchema,
  createInventoryItemSchema,
  deleteInventoryItemSchema,
  getInventoryItemSchema,
  updateInventoryItemSchema,
} from './ims.schema.js'

export function registerImsRoutes(app: FastifyInstance, service: ImsService) {
  app.get('/api/v1/ims/inventory-items', async () => {
    const data = await service.listItems()
    return { data }
  })

  app.get<{ Params: { id: string } }>('/api/v1/ims/inventory-items/:id', { schema: getInventoryItemSchema }, async (req) => {
    const data = await service.getItem(req.params.id)
    return { data }
  })

  app.post<{ Body: CreateInventoryItemInput }>('/api/v1/ims/inventory-items', { schema: createInventoryItemSchema }, async (req, reply) => {
    const data = await service.createItem(req.body)
    reply.code(201)
    return { data }
  })

  app.patch<{ Params: { id: string }; Body: UpdateInventoryItemInput }>(
    '/api/v1/ims/inventory-items/:id',
    { schema: updateInventoryItemSchema },
    async (req) => {
      const data = await service.updateItem(req.params.id, req.body)
      return { data }
    },
  )

  app.post<{ Params: { id: string }; Body: AdjustInventoryItemInput }>(
    '/api/v1/ims/inventory-items/:id/adjust',
    { schema: adjustInventoryItemSchema },
    async (req) => {
      const data = await service.adjustItem(req.params.id, req.body.delta)
      return { data }
    },
  )

  app.delete<{ Params: { id: string } }>('/api/v1/ims/inventory-items/:id', { schema: deleteInventoryItemSchema }, async (req, reply) => {
    await service.deleteItem(req.params.id)
    reply.code(204)
  })
}
