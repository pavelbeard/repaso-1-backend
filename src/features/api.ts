import Router from 'express'
import { API_PREFIX } from '../lib/constants.ts'
import { authRouter } from './auth/auth.router.ts'
import { healthRouter } from './health.ts'

export const apiRouter = Router()

apiRouter.use(String(API_PREFIX).concat('/auth'), authRouter)
apiRouter.use(String(API_PREFIX).concat('/health'), healthRouter)

export default apiRouter
