import jwt from 'jsonwebtoken'
import { JWT_SECRET_ACCESS, JWT_SECRET_REFRESH } from '../../lib/constants'

export const generateTokens = (data: object) => {
  const accessToken = jwt.sign(data, JWT_SECRET_ACCESS, { expiresIn: '15m' })
  const refreshToken = jwt.sign(data, JWT_SECRET_REFRESH, { expiresIn: '7d' })

  return [accessToken, refreshToken]
}
