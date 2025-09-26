import Router from 'express'
import { API_PREFIX } from '../lib/constants.ts'
import { healthRouter } from './health.ts'

export const apiRouter = Router()

apiRouter.use(API_PREFIX, [healthRouter])

export default apiRouter
