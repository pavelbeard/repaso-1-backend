import { Router } from 'express'
import { schemaValidation } from '../../lib/utils/middlewares/schemaValidationMiddleware.ts'
import { AuthController } from './auth.controller.ts'
import {
  createUserSchema,
  loginSchema,
  refreshTokenSchema,
} from './auth.schemas.ts'

export const authRouter = Router()

authRouter.post('/login', schemaValidation(loginSchema), AuthController.login)

authRouter.post(
  '/register',
  schemaValidation(createUserSchema),
  AuthController.register
)

authRouter.post(
  '/refresh-token',
  schemaValidation(refreshTokenSchema),
  AuthController.refreshToken
)
