import { Request, Response } from 'express'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createUserSchema,
  loginSchema,
  refreshTokenSchemaRouter,
} from '../../../features/auth/auth.schemas'
import { AppError } from '../appError'
import { schemaValidation } from './schemaValidationMiddleware'

describe('Schema Validation Middleware', () => {
  let request: Request
  let response: Response
  const next = vi.fn()

  beforeEach(() => {
    vi.resetAllMocks()
    vi.useFakeTimers()
    request = {
      body: {},
    } as unknown as Request

    response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Auth Schemas', () => {
    describe('Login Schema', () => {
      // Let's start with invalid cases
      it('should invalidate empty body', async () => {
        request.body = {}

        await schemaValidation(loginSchema)(request, response, next)

        expect(next).toHaveBeenCalledWith(
          new AppError(
            'BAD_REQUEST',
            'Invalid or missing fields provided for: email, password'
          )
        )
      })

      it('should invalidate missing email', async () => {
        request.body = { password: 'password123' }

        await schemaValidation(loginSchema)(request, response, next)

        expect(next).toHaveBeenCalledWith(
          new AppError(
            'BAD_REQUEST',
            'Invalid or missing fields provided for: email, password'
          )
        )
      })

      it('should invalidate missing password', async () => {
        request.body = { email: 'test@example.com' }

        await schemaValidation(loginSchema)(request, response, next)

        expect(next).toHaveBeenCalledWith(
          new AppError(
            'BAD_REQUEST',
            'Invalid or missing field provided for: password'
          )
        )
      })

      it('should invalidate invalid email format', async () => {
        request.body = { email: 'invalid-email', password: 'Password@!123' }

        await schemaValidation(loginSchema)(request, response, next)

        expect(next).toHaveBeenCalledWith(
          new AppError(
            'BAD_REQUEST',
            'Invalid or missing field provided for: email'
          )
        )
      })

      it('should invalidate short password', async () => {
        request.body = { email: 'newuser@gmail.com', password: 'short' }

        await schemaValidation(loginSchema)(request, response, next)

        expect(next).toHaveBeenCalledWith(
          new AppError(
            'BAD_REQUEST',
            'Invalid or missing fields provided for: password, password'
          )
        )
      })

      it('should invalidate password without symbols, numbers, uppercase', async () => {
        request.body = {
          email: 'newuser@gmail.com',
          password: 'normallengthpassword',
        }

        await schemaValidation(loginSchema)(request, response, next)

        expect(next).toHaveBeenCalledWith(
          new AppError(
            'BAD_REQUEST',
            'Invalid or missing field provided for: password'
          )
        )
      })

      // Now valid cases
      it('should validate correct body and return response', async () => {
        request.body = {
          email: 'newuser@gmail.com',
          password: 'Password@!123',
        }

        await schemaValidation(loginSchema)(request, response, next)

        expect(next).not.toHaveBeenCalledWith(AppError)
      })
    })

    describe('Register Schema', () => {
      it('should invalidate empty body', async () => {
        request.body = {}

        await schemaValidation(createUserSchema)(request, response, next)

        expect(next).toHaveBeenCalledWith(
          new AppError(
            'BAD_REQUEST',
            'Invalid or missing fields provided for: username, email, password, confirmPassword'
          )
        )
      })

      it('should invalidate missing fields', async () => {
        request.body = { username: 'newuser', email: '' }

        await schemaValidation(createUserSchema)(request, response, next)

        expect(next).toHaveBeenCalledWith(
          new AppError(
            'BAD_REQUEST',
            'Invalid or missing fields provided for: email, password, confirmPassword'
          )
        )
      })

      it('should invalidate invalid email format', async () => {
        request.body = {
          username: 'newuser',
          email: 'invalid-email',
          password: 'Password@!123',
          confirmPassword: 'Password@!123',
        }

        await schemaValidation(createUserSchema)(request, response, next)

        expect(next).toHaveBeenCalledWith(
          new AppError(
            'BAD_REQUEST',
            'Invalid or missing field provided for: email'
          )
        )
      })

      it('should invalidate short password', async () => {
        request.body = {
          username: 'newuser',
          email: 'newuser@gmail.com',
          password: 'short',
          confirmPassword: 'short',
        }

        await schemaValidation(createUserSchema)(request, response, next)

        expect(next).toHaveBeenCalledWith(
          new AppError(
            'BAD_REQUEST',
            'Invalid or missing fields provided for: password, password, confirmPassword'
          )
        )
      })

      it('should invalidate password without symbols, numbers, uppercase', async () => {
        request.body = {
          username: 'newuser',
          email: 'newuser@gmail.com',
          password: 'normallengthpassword',
          confirmPassword: 'normallengthpassword',
        }

        await schemaValidation(createUserSchema)(request, response, next)

        expect(next).toHaveBeenCalledWith(
          new AppError(
            'BAD_REQUEST',
            'Invalid or missing field provided for: password'
          )
        )
      })
    })

    describe('Refresh Token Schema', () => {
      afterEach(() => {
        vi.resetAllMocks()
      })

      it('should invalidate empty body when JWT_SAVE_TO_COOKIE is false', async () => {
        process.env.JWT_SAVE_TO_COOKIE = 'false'
        vi.resetModules()
        request.body = {}

        await schemaValidation(refreshTokenSchemaRouter())(
          request,
          response,
          next
        )

        expect(next).toHaveBeenCalledWith(
          new AppError(
            'BAD_REQUEST',
            'Invalid or missing field provided for: refreshToken'
          )
        )
      })

      it('should validate empty body when JWT_SAVE_TO_COOKIE is true', async () => {
        vi.resetModules()
        request.cookies = { refreshToken: 'valid-refresh-token-12345' }

        await schemaValidation(refreshTokenSchemaRouter(true))(
          request,
          response,
          next
        )

        expect(next).not.toHaveBeenCalledWith(
          new AppError(
            'BAD_REQUEST',
            'Invalid or missing field provided for: refreshToken'
          )
        )
      })

      it('should invalidate short refresh token', async () => {
        process.env.JWT_SAVE_TO_COOKIE = 'false'
        vi.resetModules()
        const { refreshTokenSchema } = await import(
          '../../../features/auth/auth.schemas'
        )
        request.body = { refreshToken: 'short' }

        await schemaValidation(refreshTokenSchema)(request, response, next)

        expect(next).toHaveBeenCalledWith(
          new AppError(
            'BAD_REQUEST',
            'Invalid or missing field provided for: refreshToken'
          )
        )
      })

      it('should validate correct body and return response', async () => {
        process.env.JWT_SAVE_TO_COOKIE = 'false'
        vi.resetModules()
        request.body = { refreshToken: 'valid-refresh-token-12345' }

        await schemaValidation(refreshTokenSchemaRouter())(
          request,
          response,
          next
        )

        expect(next).not.toHaveBeenCalledWith(AppError)
      })
    })
  })
})
