import type { Request } from 'express'
import { CreateUserInput, LoginInput } from './auth.schemas'

export type UserLoginRequest = Request<unknown, unknown, LoginInput['body']>

export type UserRegisterRequest = Request<
  unknown,
  unknown,
  CreateUserInput['body']
>

export type JWTPayload = {
  id: string
  email: string
  username: string
}
