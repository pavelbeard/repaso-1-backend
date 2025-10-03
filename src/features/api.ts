import Router from 'express'
import { config } from '../lib/constants.ts'
import { authRouter } from './auth/auth.router.ts'
import { healthRouter } from './health.ts'

export const apiRouter = Router()

apiRouter.use(String(config.API_PREFIX).concat('/auth'), authRouter)
apiRouter.use(String(config.API_PREFIX).concat('/health'), healthRouter)

export default apiRouter
