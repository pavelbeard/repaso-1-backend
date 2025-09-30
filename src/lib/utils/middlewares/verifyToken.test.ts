import type { Request, Response } from 'express'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppError } from '../appError'
import { verifyTokenMiddleware } from './verifyToken'

describe('Token verification', () => {
  let request: Request
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

  // Error cases first
  it('should return false for invalid token', async () => {
    request = {
      headers: {
        authorization: 'Bearer invalid-token',
      },
    } as unknown as Request

    await verifyTokenMiddleware(request, response, next)

    expect(next).toHaveBeenCalledWith(
      new AppError('UNAUTHORIZED', 'Invalid token')
    )
  })

  it('should return false for empty token', async () => {
    request = {
      headers: {
        authorization: 'Bearer ',
      },
    } as unknown as Request

    await verifyTokenMiddleware(request, response, next)

    expect(next).toHaveBeenCalledWith(
      new AppError('UNAUTHORIZED', 'No token provided')
    )
  })

  it('should return false for missing token', async () => {
    request = {
      headers: {},
    } as unknown as Request

    await verifyTokenMiddleware(request, response, next)

    expect(next).toHaveBeenCalledWith(
      new AppError('UNAUTHORIZED', 'No token provided')
    )
  })

  // Success cases
  it('should return true for valid token', async () => {
    request = {
      headers: {
        authorization: 'Bearer valid-token',
      },
    } as unknown as Request

    await verifyTokenMiddleware(request, response, next)

    expect(next).not.toHaveBeenCalled()
  })
})
