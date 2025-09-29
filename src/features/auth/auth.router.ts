import { Router } from 'express'
import { schemaValidationMiddleware } from '../../lib/utils/middlewares/schemaValidationMiddleware.ts'
import { AuthController } from './auth.controller.ts'
import { createUserSchema, loginSchema } from './auth.schemas.ts'

const router = Router()
const authRouter = Router()

router.post(
  '/login',
  schemaValidationMiddleware(loginSchema),
  AuthController.login
)

router.post(
  '/register',
  schemaValidationMiddleware(createUserSchema),
  AuthController.register
)

authRouter.use('/auth', router)

export { authRouter }
