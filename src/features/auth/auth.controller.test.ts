import bcrypt from 'bcrypt'
import type { Request, Response } from 'express'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createUserQuery,
  findUserByIdOrUsernameOrEmailQuery,
  isRefreshTokenBlacklistedQuery,
} from '../../lib/db/queries/auth.queries'
import { AppError } from '../../lib/utils/appError'
import { AuthController } from './auth.controller'
import { UserRegisterRequest } from './auth.types'
import { verifyRefreshToken } from './auth.utils'

vi.mock('../../lib/db/queries/auth.queries', () => ({
  createUserQuery: vi.fn(),
  findUserByIdOrUsernameOrEmailQuery: vi.fn(),
  isRefreshTokenBlacklistedQuery: vi.fn(),
  blacklistRefreshTokenQuery: vi.fn(),
}))

vi.mock('./auth.utils', async () => {
  const actual = await vi.importActual<typeof import('./auth.utils')>(
    './auth.utils'
  )
  return {
    ...actual,
    verifyRefreshToken: vi.fn(),
  }
})

vi.mock('bcrypt', async () => {
  const actual = await vi.importActual<typeof import('bcrypt')>('bcrypt')
  return {
    ...actual,
    compareSync: vi.fn(
      (password: string, hash: string) =>
        password === 'password123' && hash === '$2b$10$hashedpassword'
    ),
    hashSync: vi.fn((password: string) => '$2b$10$hashed' + password),
  }
})

describe('Auth Controller', () => {
  let request
  let response: Response
  const next = vi.fn()

  beforeEach(() => {
    vi.resetAllMocks()
    vi.useFakeTimers()

    response = {
      status: vi.fn().mockReturnThis(),
      cookie: vi.fn().mockReturnThis(),
      clearCookie: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('CreateUser', () => {
    // let's start with errors

    it('should not register user if body is empty', async () => {
      request = {
        body: {},
      } as unknown as UserRegisterRequest

      await AuthController.register(request, response, next)

      expect(next).toHaveBeenCalledWith(
        new AppError('BAD_REQUEST', 'Request body is empty')
      )
    })

    it('should not register user if already exists', async () => {
      request = {
        body: {
          username: 'existinguser',
          email: 'existinguser@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        },
      } as unknown as UserRegisterRequest

      vi.mocked(findUserByIdOrUsernameOrEmailQuery).mockResolvedValue({
        username: 'existinguser',
        email: 'existinguser@example.com',
        password: 'password123',
      } as unknown as Awaited<ReturnType<typeof findUserByIdOrUsernameOrEmailQuery>>)

      await AuthController.register(request, response, next)

      expect(next).toHaveBeenCalledWith(
        new AppError('CONFLICT', 'User already exists')
      )
    })

    it('should not register user if passwords do not match', async () => {
      request = {
        body: {
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'password123',
          confirmPassword: 'password124',
        },
      } as unknown as UserRegisterRequest

      vi.mocked(findUserByIdOrUsernameOrEmailQuery).mockResolvedValue(null)

      await AuthController.register(request, response, next)

      expect(next).toHaveBeenCalledWith(
        new AppError('BAD_REQUEST', 'Passwords do not match')
      )
    })

    it('should register a new user', async () => {
      request = {
        body: {
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        },
      } as unknown as UserRegisterRequest

      vi.mocked(findUserByIdOrUsernameOrEmailQuery).mockResolvedValue(null)
      vi.mocked(createUserQuery).mockResolvedValue({
        id: 'user-id-123',
        username: 'newuser',
        email: 'newuser@example.com',
      } as unknown as Awaited<ReturnType<typeof createUserQuery>>)

      await AuthController.register(request, response, next)

      expect(createUserQuery).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'newuser@example.com',
        password: expect.any(String),
        confirmPassword: 'password123',
      })
      expect(response.json).toHaveBeenCalledWith({
        user: {
          id: 'user-id-123',
          username: 'newuser',
          email: 'newuser@example.com',
        },
      })
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('LoginUser', () => {
    // errors first

    it('should not login if body is empty', async () => {
      request = {
        body: {},
      } as unknown as UserRegisterRequest

      await AuthController.login(request, response, next)

      expect(next).toHaveBeenCalledWith(
        new AppError('BAD_REQUEST', 'Request body is empty')
      )
    })

    it('should not login if user does not exist', async () => {
      request = {
        body: {
          email: 'nonexistentuser@example.com',
          password: 'password123',
        },
      } as unknown as UserRegisterRequest

      vi.mocked(findUserByIdOrUsernameOrEmailQuery).mockResolvedValue(null)

      await AuthController.login(request, response, next)

      expect(next).toHaveBeenCalledWith(
        new AppError('NOT_FOUND', 'User not found')
      )
    })

    it('should not login if password is incorrect', async () => {
      request = {
        body: {
          email: 'existinguser@example.com',
          password: 'wrongpassword',
        },
      } as unknown as UserRegisterRequest

      vi.mocked(findUserByIdOrUsernameOrEmailQuery).mockResolvedValue({
        id: 'user-id-123',
        email: 'existinguser@example.com',
        password: '$2b$10$hashedpassword', // bcrypt hash for 'password123'
      } as unknown as Awaited<ReturnType<typeof findUserByIdOrUsernameOrEmailQuery>>)

      await AuthController.login(request, response, next)

      expect(next).toHaveBeenCalledWith(
        new AppError('UNAUTHORIZED', 'Invalid credentials')
      )
    })

    it('should login an existing user', async () => {
      request = {
        body: {
          email: 'existinguser@example.com',
          password: 'password123',
        },
      } as unknown as UserRegisterRequest

      const hashedPassword = bcrypt.hashSync('password123', 10)

      vi.mocked(findUserByIdOrUsernameOrEmailQuery).mockResolvedValue({
        id: 'user-id-123',
        username: 'existinguser',
        email: 'existinguser@example.com',
        password: hashedPassword,
      } as unknown as Awaited<ReturnType<typeof findUserByIdOrUsernameOrEmailQuery>>)

      await AuthController.login(request, response, next)

      expect(response.json).toHaveBeenCalledWith({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        user: {
          id: 'user-id-123',
          email: 'existinguser@example.com',
          username: 'existinguser',
        },
      })

      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('RefreshToken', () => {
    // Error cases first
    it('should not refresh tokens if body is empty', async () => {
      request = {
        body: {},
      } as Request

      await AuthController.refreshToken(request, response, next)

      expect(next).toHaveBeenCalledWith(
        new AppError('UNAUTHORIZED', 'No token provided')
      )
    })

    it('should not refresh tokens if token is blacklisted', async () => {
      request = {
        body: {
          refreshToken: 'blacklisted-token',
        },
      } as Request

      vi.mocked(isRefreshTokenBlacklistedQuery).mockResolvedValueOnce(true)

      await AuthController.refreshToken(request, response, next)

      expect(next).toHaveBeenCalledWith(
        new AppError('UNAUTHORIZED', 'Token is blacklisted')
      )
    })

    // Success cases
    it('should refresh tokens with valid refresh token', async () => {
      request = {
        body: {
          refreshToken: 'valid-refresh-token',
        },
      } as Request

      vi.mocked(isRefreshTokenBlacklistedQuery).mockResolvedValueOnce(false)

      vi.mocked(verifyRefreshToken).mockReturnValue({
        id: 'user-id-123',
        email: 'existinguser@example.com',
        username: 'existinguser',
      })

      await AuthController.refreshToken(request, response, next)

      expect(next).not.toHaveBeenCalled()
      expect(response.json).toHaveBeenCalledWith({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      })
    })
  })

  describe('Logout', () => {
    it('should not logout if body is empty', async () => {
      request = {
        body: {},
      } as Request

      await AuthController.logout(request, response, next)

      expect(next).toHaveBeenCalledWith(
        new AppError('BAD_REQUEST', 'No token provided')
      )
    })

    it('should not logout if token is invalid', async () => {
      request = {
        body: {
          refreshToken: 'invalid-token',
        },
      } as Request

      vi.mocked(verifyRefreshToken).mockReturnValue(false)

      await AuthController.logout(request, response, next)

      expect(next).toHaveBeenCalledWith(
        new AppError('UNAUTHORIZED', 'Invalid refresh token')
      )
    })

    it('should not logout if there is not token in cookes', async () => {
      process.env.JWT_SAVE_TO_COOKIE = 'true'

      request = {
        cookies: {
          refreshToken: null,
        },
        body: {},
      } as unknown as Request

      await AuthController.logout(request, response, next)

      expect(next).toHaveBeenCalledWith(
        new AppError('BAD_REQUEST', 'No token provided')
      )
    })
  })
})
