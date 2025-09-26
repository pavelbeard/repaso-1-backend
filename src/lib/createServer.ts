import express from 'express'
import apiRouter from '../features/api.ts'
import { errorFallback } from './db/utils/middlewares/errorFallback.ts'
import { logger } from './db/utils/middlewares/logger.ts'
import { notFound } from './db/utils/notFound.ts'

export const createServer = () => {
  const app = express()

  app
    .disable('x-powered-by')
    .use(logger)
    .use(express.json())
    // All Routes!
    .use(apiRouter)
    // Error handling middleware
    .use(errorFallback)
    .use(notFound)

  return app
}
