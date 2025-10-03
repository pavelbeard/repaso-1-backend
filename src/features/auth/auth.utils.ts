import type { Request } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../../lib/constants'
import { JWTPayload } from './auth.types'

export const generateTokens = (data: JWTPayload) => {
  const accessToken = jwt.sign(data, config.JWT_SECRET_ACCESS, {
    expiresIn: '15m',
  })
  const refreshToken = jwt.sign(data, config.JWT_SECRET_REFRESH, {
    expiresIn: '7d',
  })

  return [accessToken, refreshToken]
}

export const getRefreshTokenFromBody = (req: Request) => {
  return req.body?.refreshToken || null
}

export const getRefreshTokenFromCookies = (req: Request) => {
  return req.cookies?.refreshToken || null
}

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, config.JWT_SECRET_REFRESH) as JWTPayload
  } catch {
    return false
  }
}

export const isCookieBasedAuth = () => {
  return config.JWT_SAVE_TO_COOKIE
}
