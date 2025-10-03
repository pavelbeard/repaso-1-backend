import { Router } from 'express'
import { schemaValidation } from '../../lib/utils/middlewares/schemaValidationMiddleware.ts'
import { verifyToken } from '../../lib/utils/middlewares/verifyTokenMiddleware.ts'
import { AuthController } from './auth.controller.ts'
import {
  createUserSchema,
  loginSchema,
  refreshTokenSchemaRouter,
} from './auth.schemas.ts'
import { isCookieBasedAuth } from './auth.utils.ts'

export const authRouter = Router()

authRouter.post('/login', schemaValidation(loginSchema), AuthController.login)

authRouter.post(
  '/register',
  schemaValidation(createUserSchema),
  AuthController.register
)

authRouter.post(
  '/refresh-token',
  schemaValidation(refreshTokenSchemaRouter(isCookieBasedAuth())),
  AuthController.refreshToken
)

authRouter.post(
  '/logout',
  [
    schemaValidation(refreshTokenSchemaRouter(isCookieBasedAuth())),
    verifyToken,
  ],
  AuthController.logout
)
