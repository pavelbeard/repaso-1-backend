import bcrypt from 'bcrypt'
import { beforeAll, describe, expect, it } from 'vitest'
import { User } from '../../src/lib/db/models/auth.models'
import { request } from '../helpers/setup'

describe('Auth Cookies Tests', () => {
  describe('Test auth/logout with cookies', () => {
    beforeAll(async () => {
      const newUser = new User({
        username: 'testuser',
        email: 'testuser@example.com',
        password: bcrypt.hashSync('Password@!123', 10),
      })
      await newUser.save()
    })

    it('should login and set refresh token in cookies', async () => {
      const response = await request.post('/api/v1/auth/login').send({
        email: 'testuser@example.com',
        password: 'Password@!123',
      })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('user')
      // Cookies are not setting in the response, because of isCookieBasedAuth doesn't mock properly
      // It needs to set .env.file before the server start
      console.log(response.headers)

      expect(response.headers['set-cookie'][0]).toMatch(/refreshToken=/)
      expect(response.headers['set-cookie'][1]).toMatch(/accessToken=/)
    })

    it('should logout and blacklist the refresh token from cookies', async () => {
      // First, login to get cookies
      const loginResponse = await request.post('/api/v1/auth/login').send({
        email: 'testuser@example.com',
        password: 'Password@!123',
      })

      const cookies = loginResponse.headers['set-cookie'] as unknown as string[]
      expect(cookies[0]).toMatch(/refreshToken=/)
      expect(cookies[1]).toMatch(/accessToken=/)

      // Now, logout using the cookies
      const logoutResponse = await request
        .post('/api/v1/auth/logout')
        .set('Cookie', cookies)
        .send()

      expect(logoutResponse.status).toBe(200)
      expect(logoutResponse.body).toHaveProperty(
        'message',
        'Logged out successfully'
      )

      // Try to refresh tokens with the blacklisted token
      const refreshResponse = await request
        .post('/api/v1/auth/refresh-token')
        .set('Cookie', cookies)
        .send()

      expect(refreshResponse.status).toBe(401)
      expect(refreshResponse.body).toHaveProperty(
        'message',
        'Token is blacklisted'
      )
    })
  })
})
