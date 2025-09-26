import Router from 'express'
import { API_PREFIX } from '../lib/constants.ts'
import { authRouter } from './auth/auth.router.ts'
import { healthRouter } from './health.ts'

export const apiRouter = Router()

apiRouter.use(API_PREFIX, [authRouter, healthRouter])

export default apiRouter
