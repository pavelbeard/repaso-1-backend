import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { JWT_SECRET_ACCESS } from 'src/lib/constants'
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

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Get token from headers
  const token = getTokenFromHeaders(req) || getTokenFromCookies(req)

  if (!token) {
    return next(new AppError('UNAUTHORIZED', 'No token provided'))
  }

  req.session = { user: null }

  // 2. Verify token
  try {
    const verified = jwt.verify(token, JWT_SECRET_ACCESS)
    req.session.user = verified as {
      id: string
      email: string
      username: string
    }
  } catch {
    req.session = { user: null }
    return next(new AppError('UNAUTHORIZED', 'Invalid token'))
  }

  next()
}
