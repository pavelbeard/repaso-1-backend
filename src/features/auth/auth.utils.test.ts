import { describe, expect, it, vi } from 'vitest'
import { verifyRefreshToken } from './auth.utils'

vi.mock('jsonwebtoken', () => {
  return {
    default: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      verify: vi.fn((token: string, secret: string) => {
        if (token === 'valid_refresh_token') {
          return { id: 'user_id', email: 'user@example.com' }
        }
        throw new Error('Invalid token')
      }),
    },
  }
})

describe('Verify Refresh Token', () => {
  it('should return user data for valid refresh token', () => {
    const result = verifyRefreshToken('valid_refresh_token')
    expect(result).toEqual({ id: 'user_id', email: 'user@example.com' })
  })

  it('should return false for invalid refresh token', () => {
    const result = verifyRefreshToken('invalid_refresh_token')
    expect(result).toBe(false)
  })

  it('should return false for empty token', () => {
    const result = verifyRefreshToken('')
    expect(result).toBe(false)
  })
})
