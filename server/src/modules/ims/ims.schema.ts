import { idParamsSchema } from '../../shared/schemas.js'

export const createInventoryItemSchema = {
  body: {
    type: 'object',
    required: ['name', 'quantity', 'unit'],
    properties: {
      name: { type: 'string' },
      quantity: { type: 'number', minimum: 0 },
      unit: { type: 'string' },
      description: { type: 'string' },
      category: { type: 'string' },
    },
    additionalProperties: false,
  },
} as const

export const getInventoryItemSchema = {
  params: idParamsSchema,
} as const

export const updateInventoryItemSchema = {
  params: idParamsSchema,
  body: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      quantity: { type: 'number', minimum: 0 },
      unit: { type: 'string' },
      description: { type: 'string' },
      category: { type: 'string' },
    },
    additionalProperties: false,
  },
} as const

export const adjustInventoryItemSchema = {
  params: idParamsSchema,
  body: {
    type: 'object',
    required: ['delta'],
    properties: {
      delta: { type: 'number' },
    },
    additionalProperties: false,
  },
} as const

export const deleteInventoryItemSchema = {
  params: idParamsSchema,
} as const
