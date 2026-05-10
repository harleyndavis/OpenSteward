import type { Pool } from 'pg'
import type { InventoryItem, CreateInventoryItemInput, UpdateInventoryItemInput } from '@opensteward/shared'

interface InventoryItemRow {
  id: string
  name: string
  description: string | null
  quantity: string
  unit: string
  category: string | null
  created_at: Date
  updated_at: Date
}

function toInventoryItem(row: InventoryItemRow): InventoryItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    quantity: Number(row.quantity),
    unit: row.unit,
    category: row.category ?? undefined,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }
}

export function createImsRepository(db: Pool) {
  return {
    async findAll(): Promise<InventoryItem[]> {
      const result = await db.query<InventoryItemRow>(
        'SELECT * FROM inventory_items ORDER BY created_at DESC',
      )
      return result.rows.map(toInventoryItem)
    },

    async findById(id: string): Promise<InventoryItem | null> {
      const result = await db.query<InventoryItemRow>(
        'SELECT * FROM inventory_items WHERE id = $1',
        [id],
      )
      return result.rows[0] ? toInventoryItem(result.rows[0]) : null
    },

    async create(input: CreateInventoryItemInput): Promise<InventoryItem> {
      const result = await db.query<InventoryItemRow>(
        `INSERT INTO inventory_items (name, description, quantity, unit, category)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [input.name, input.description ?? null, input.quantity, input.unit, input.category ?? null],
      )
      return toInventoryItem(result.rows[0])
    },

    async update(id: string, input: UpdateInventoryItemInput): Promise<InventoryItem | null> {
      const result = await db.query<InventoryItemRow>(
        `UPDATE inventory_items
         SET name        = COALESCE($1, name),
             description = COALESCE($2, description),
             quantity    = COALESCE($3, quantity),
             unit        = COALESCE($4, unit),
             category    = COALESCE($5, category),
             updated_at  = NOW()
         WHERE id = $6
         RETURNING *`,
        [
          input.name ?? null,
          input.description ?? null,
          input.quantity ?? null,
          input.unit ?? null,
          input.category ?? null,
          id,
        ],
      )
      return result.rows[0] ? toInventoryItem(result.rows[0]) : null
    },

    async adjust(id: string, delta: number): Promise<InventoryItem | null> {
      const result = await db.query<InventoryItemRow>(
        `UPDATE inventory_items
         SET quantity   = quantity + $1,
             updated_at = NOW()
         WHERE id = $2 AND quantity + $1 >= 0
         RETURNING *`,
        [delta, id],
      )
      return result.rows[0] ? toInventoryItem(result.rows[0]) : null
    },

    async delete(id: string): Promise<boolean> {
      const result = await db.query('DELETE FROM inventory_items WHERE id = $1', [id])
      return (result.rowCount ?? 0) > 0
    },
  }
}

export type ImsRepository = ReturnType<typeof createImsRepository>
