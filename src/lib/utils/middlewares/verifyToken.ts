import { NextFunction, Request, Response } from 'express'
import { AppError } from '../appError'

const getTokenFromHeaders = (req: Request) => {
  const authHeader = req.headers?.authorization

  if (!authHeader) return null

  const token = authHeader && authHeader.split(' ')[1]
  return token
}

const getTokenFromCookies = (req: Request) => {
  return req.cookies?.token || null
}

export const verifyTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Get token from headers
  const token = getTokenFromHeaders(req) || getTokenFromCookies(req)

  if (!token) {
    return next(new AppError('UNAUTHORIZED', 'No token provided'))
  }

  // 2. Verify token (dummy verification for example purposes)
  if (token === 'valid-token') {
    return true
  } else {
    return next(new AppError('UNAUTHORIZED', 'Invalid token'))
  }
}
