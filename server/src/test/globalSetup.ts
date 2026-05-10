import { config } from 'dotenv'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '../../..')

export async function setup() {
  config({ path: resolve(root, '.env') })
  config({ path: resolve(root, '.env.test'), override: true })

  const { migrate } = await import('../core/migrate.js')
  await migrate('up')
}
