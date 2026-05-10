import { config } from 'dotenv'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '../../..')

config({ path: resolve(root, '.env') })
config({ path: resolve(root, '.env.test'), override: true })
