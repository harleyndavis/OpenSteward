import Fastify from 'fastify'
import { registerErrorHandler } from '../core/error-handler.js'
import { registerImsRoutes } from '../modules/ims/ims.routes.js'
import { registerAmsRoutes } from '../modules/ams/ams.routes.js'
import type { ImsService } from '../modules/ims/ims.service.js'
import type { AmsService } from '../modules/ams/ams.service.js'

interface TestAppOptions {
  imsService?: ImsService
  amsService?: AmsService
}

export function buildTestApp(options: TestAppOptions = {}) {
  const app = Fastify({ logger: false })

  if (options.imsService) registerImsRoutes(app, options.imsService)
  if (options.amsService) registerAmsRoutes(app, options.amsService)

  registerErrorHandler(app)

  return app
}
