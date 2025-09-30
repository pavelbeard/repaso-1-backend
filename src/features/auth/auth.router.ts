import { Router } from 'express'
import { schemaValidationMiddleware } from '../../lib/utils/middlewares/schemaValidationMiddleware.ts'
import { AuthController } from './auth.controller.ts'
import { createUserSchema, loginSchema } from './auth.schemas.ts'

export const authRouter = Router()

authRouter.post(
  '/login',
  schemaValidationMiddleware(loginSchema),
  AuthController.login
)

authRouter.post(
  '/register',
  schemaValidationMiddleware(createUserSchema),
  AuthController.register
)
