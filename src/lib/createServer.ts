import express from 'express'
import apiRouter from '../features/api.ts'
import { errorFallback } from './db/utils/middlewares/errorFallback.ts'
import { logger } from './db/utils/middlewares/logger.ts'
import { notFound } from './db/utils/notFound.ts'

export const createServer = () => {
  const app = express()

  app.disable('x-powered-by')

  app.use(logger)
  app.use(express.json())

  // All Routes!
  app.use(apiRouter)

  // Error handling middleware
  app.use(errorFallback)
  app.use(notFound)

  return app
}
