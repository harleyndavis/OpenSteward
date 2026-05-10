import type { FastifyInstance } from 'fastify'
import type { AmsService } from './ams.service.js'
import type { CreateAssetInput, UpdateAssetInput } from '@opensteward/shared'
import { createAssetSchema, deleteAssetSchema, getAssetSchema, updateAssetSchema } from './ams.schema.js'

export function registerAmsRoutes(app: FastifyInstance, service: AmsService) {
  app.get('/api/v1/ams/assets', async () => {
    const data = await service.listAssets()
    return { data }
  })

  app.get<{ Params: { id: string } }>('/api/v1/ams/assets/:id', { schema: getAssetSchema }, async (req) => {
    const data = await service.getAsset(req.params.id)
    return { data }
  })

  app.post<{ Body: CreateAssetInput }>('/api/v1/ams/assets', { schema: createAssetSchema }, async (req, reply) => {
    const data = await service.createAsset(req.body)
    reply.code(201)
    return { data }
  })

  app.patch<{ Params: { id: string }; Body: UpdateAssetInput }>(
    '/api/v1/ams/assets/:id',
    { schema: updateAssetSchema },
    async (req) => {
      const data = await service.updateAsset(req.params.id, req.body)
      return { data }
    },
  )

  app.delete<{ Params: { id: string } }>('/api/v1/ams/assets/:id', { schema: deleteAssetSchema }, async (req, reply) => {
    await service.deleteAsset(req.params.id)
    reply.code(204)
  })
}
