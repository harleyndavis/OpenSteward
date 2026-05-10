import Fastify from 'fastify'
import cors from '@fastify/cors'
import { db } from './db.js'
import { config } from './config.js'
import { registerErrorHandler } from './error-handler.js'
import { createImsRepository } from '../modules/ims/ims.repository.js'
import { createImsService } from '../modules/ims/ims.service.js'
import { registerImsRoutes } from '../modules/ims/ims.routes.js'
import { createAmsRepository } from '../modules/ams/ams.repository.js'
import { createAmsService } from '../modules/ams/ams.service.js'
import { registerAmsRoutes } from '../modules/ams/ams.routes.js'

const app = Fastify({ logger: true })

app.register(cors)

registerImsRoutes(app, createImsService(createImsRepository(db)))
registerAmsRoutes(app, createAmsService(createAmsRepository(db)))

registerErrorHandler(app)

async function start() {
  try {
    await app.listen({ port: config.port, host: '0.0.0.0' })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
