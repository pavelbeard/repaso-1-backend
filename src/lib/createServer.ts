import express from 'express'
import apiRouter from '../features/api.ts'
import { errorFallback } from './utils/middlewares/errorFallbackMiddleware.ts'
import { logger } from './utils/middlewares/loggerMiddleware.ts'
import { verifyToken } from './utils/middlewares/verifyTokenMiddleware.ts'
import { notFound } from './utils/notFound.ts'

export const createServer = () => {
  const app = express()

  app
    .disable('x-powered-by')
    .use(logger)
    .use(express.json())
    .use(verifyToken)
    // All Routes!
    .use(apiRouter)
    // Error handling middleware
    .use(errorFallback)
    .use(notFound)

  return app
}
