import pg from 'pg'
import { readdir, readFile } from 'fs/promises'
import { join, dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { config } from './config.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const migrationsDir = resolve(__dirname, '../../migrations')

export async function migrate(direction: 'up' | 'down') {
  const db = new pg.Pool({ connectionString: config.databaseUrl })

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id          SERIAL      PRIMARY KEY,
        filename    TEXT        UNIQUE NOT NULL,
        applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    if (direction === 'up') {
      const files = (await readdir(migrationsDir))
        .filter(f => f.endsWith('.up.sql'))
        .sort()

      const { rows } = await db.query<{ filename: string }>('SELECT filename FROM _migrations')
      const applied = new Set(rows.map(r => r.filename))

      for (const file of files) {
        if (applied.has(file)) continue
        const sql = await readFile(join(migrationsDir, file), 'utf8')
        const client = await db.connect()
        try {
          await client.query('BEGIN')
          await client.query(sql)
          await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file])
          await client.query('COMMIT')
          console.log(`applied: ${file}`)
        } catch (err) {
          await client.query('ROLLBACK')
          throw err
        } finally {
          client.release()
        }
      }

      console.log('migrations up to date')
    } else {
      const { rows } = await db.query<{ filename: string }>(
        'SELECT filename FROM _migrations ORDER BY id DESC LIMIT 1',
      )
      if (rows.length === 0) {
        console.log('nothing to roll back')
        return
      }

      const upFile = rows[0].filename
      const downFile = upFile.replace('.up.sql', '.down.sql')

      let sql: string
      try {
        sql = await readFile(join(migrationsDir, downFile), 'utf8')
      } catch {
        throw new Error(`Down migration file '${downFile}' not found. Cannot roll back.`)
      }

      const client = await db.connect()
      try {
        await client.query('BEGIN')
        await client.query(sql)
        await client.query('DELETE FROM _migrations WHERE filename = $1', [upFile])
        await client.query('COMMIT')
        console.log(`rolled back: ${upFile}`)
      } catch (err) {
        await client.query('ROLLBACK')
        throw err
      } finally {
        client.release()
      }
    }
  } finally {
    await db.end()
  }
}

if (process.argv[1] != null && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const direction = process.argv[2] === 'down' ? 'down' : 'up'
  migrate(direction).catch(err => {
    console.error(err)
    process.exit(1)
  })
}
