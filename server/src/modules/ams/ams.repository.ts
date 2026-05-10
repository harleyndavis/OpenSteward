import type { Pool } from 'pg'
import type { Asset, AssetStatus, CreateAssetInput, UpdateAssetInput } from '@opensteward/shared'

interface AssetRow {
  id: string
  name: string
  description: string | null
  status: AssetStatus
  location: string | null
  custom_attributes: Record<string, unknown> | null
  created_at: Date
  updated_at: Date
}

function toAsset(row: AssetRow): Asset {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    status: row.status,
    location: row.location ?? undefined,
    customAttributes: row.custom_attributes ?? undefined,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }
}

export function createAmsRepository(db: Pool) {
  return {
    async findAll(): Promise<Asset[]> {
      const result = await db.query<AssetRow>(
        'SELECT * FROM assets ORDER BY created_at DESC',
      )
      return result.rows.map(toAsset)
    },

    async findById(id: string): Promise<Asset | null> {
      const result = await db.query<AssetRow>(
        'SELECT * FROM assets WHERE id = $1',
        [id],
      )
      return result.rows[0] ? toAsset(result.rows[0]) : null
    },

    async create(input: CreateAssetInput): Promise<Asset> {
      const result = await db.query<AssetRow>(
        `INSERT INTO assets (name, description, status, location, custom_attributes)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          input.name,
          input.description ?? null,
          input.status ?? 'available',
          input.location ?? null,
          input.customAttributes !== undefined ? JSON.stringify(input.customAttributes) : null,
        ],
      )
      return toAsset(result.rows[0])
    },

    async update(id: string, input: UpdateAssetInput): Promise<Asset | null> {
      const result = await db.query<AssetRow>(
        `UPDATE assets
         SET name              = COALESCE($1, name),
             description       = COALESCE($2, description),
             status            = COALESCE($3, status),
             location          = COALESCE($4, location),
             custom_attributes = COALESCE($5, custom_attributes),
             updated_at        = NOW()
         WHERE id = $6
         RETURNING *`,
        [
          input.name ?? null,
          input.description ?? null,
          input.status ?? null,
          input.location ?? null,
          input.customAttributes !== undefined ? JSON.stringify(input.customAttributes) : null,
          id,
        ],
      )
      return result.rows[0] ? toAsset(result.rows[0]) : null
    },

    async delete(id: string): Promise<boolean> {
      const result = await db.query('DELETE FROM assets WHERE id = $1', [id])
      return (result.rowCount ?? 0) > 0
    },
  }
}

export type AmsRepository = ReturnType<typeof createAmsRepository>
