import { idParamsSchema } from '../../shared/schemas.js'

export const createAssetSchema = {
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string' },
      description: { type: 'string' },
      status: { type: 'string', enum: ['available', 'checked-out', 'maintenance', 'retired'] },
      location: { type: 'string' },
      customAttributes: { type: 'object' },
    },
    additionalProperties: false,
  },
} as const

export const getAssetSchema = {
  params: idParamsSchema,
} as const

export const updateAssetSchema = {
  params: idParamsSchema,
  body: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      description: { type: 'string' },
      status: { type: 'string', enum: ['available', 'checked-out', 'maintenance', 'retired'] },
      location: { type: 'string' },
      customAttributes: { type: 'object' },
    },
    additionalProperties: false,
  },
} as const

export const deleteAssetSchema = {
  params: idParamsSchema,
} as const
