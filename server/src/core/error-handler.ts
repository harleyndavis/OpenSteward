import type { FastifyInstance, FastifyError } from 'fastify'
import { HttpError } from '../shared/errors.js'

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler<FastifyError>((error, _req, reply) => {
    if (error instanceof HttpError) {
      reply.code(error.statusCode).send({
        error: error.code,
        message: error.message,
        details: {},
      })
      return
    }
    if (error.statusCode === 400) {
      reply.code(400).send({
        error: 'VALIDATION_ERROR',
        message: error.message,
        details: {},
      })
      return
    }
    app.log.error(error)
    reply.code(500).send({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred.',
      details: {},
    })
  })
}
