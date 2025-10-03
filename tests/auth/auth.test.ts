import bcrypt from 'bcrypt'
import { beforeAll, describe, expect, it } from 'vitest'
import {
  refreshTokenCookieSchema,
  refreshTokenSchemaRouter,
} from '../../src/features/auth/auth.schemas'
import { User } from '../../src/lib/db/models/auth.models'
import { request } from '../helpers/setup'

describe('Auth Tests', () => {
  describe('Test auth/register', () => {
    it('should register a new user', async () => {
      const newUser = {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'Password@!123',
        confirmPassword: 'Password@!123',
      }

      const response = await request.post('/api/v1/auth/register').send(newUser)
      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('user')
    })
  })

  describe('Test auth/login', () => {
    beforeAll(async () => {
      const newUser = new User({
        username: 'testuser',
        email: 'testuser@example.com',
        password: bcrypt.hashSync('Password@!123', 10),
      })
      await newUser.save()
    })

    it('should login an existing user', async () => {
      const credentials = {
        email: 'testuser@example.com',
        password: 'Password@!123',
      }

      const response = await request
        .post('/api/v1/auth/login')
        .send(credentials)
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('accessToken')
      expect(response.body).toHaveProperty('refreshToken')
      expect(response.body).toHaveProperty('user')
    })
  })

  describe('Test auth/refresh-token', () => {
    let refreshToken: string

    beforeAll(async () => {
      const newUser = new User({
        username: 'testuser',
        email: 'testuser@example.com',
        password: bcrypt.hashSync('Password@!123', 10),
      })
      await newUser.save()

      const loginResponse = await request.post('/api/v1/auth/login').send({
        email: 'testuser@example.com',
        password: 'Password@!123',
      })
      refreshToken = loginResponse.body.refreshToken
    })

    it('should refresh tokens with a valid refresh token', async () => {
      const response = await request
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken })
      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('accessToken')
      expect(response.body).toHaveProperty('refreshToken')
    })
  })

  describe('Test auth/logout', () => {
    let refreshToken: string
    let accessToken: string

    beforeAll(async () => {
      const newUser = new User({
        username: 'testuser',
        email: 'testuser@example.com',
        password: bcrypt.hashSync('Password@!123', 10),
      })
      await newUser.save()

      const loginResponse = await request.post('/api/v1/auth/login').send({
        email: 'testuser@example.com',
        password: 'Password@!123',
      })
      refreshToken = loginResponse.body.refreshToken
      accessToken = loginResponse.body.accessToken
    })

    it('should logout and blacklist the refresh token', async () => {
      const response = await request
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'Logged out successfully')

      // Try to refresh tokens with the blacklisted token
      const refreshResponse = await request
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken })
      expect(refreshResponse.status).toBe(401)
      expect(refreshResponse.body).toHaveProperty(
        'message',
        'Token is blacklisted'
      )
    })
  })

  describe('Test auth/logout with cookies', () => {
    beforeAll(async () => {
      const newUser = new User({
        username: 'testuser',
        email: 'testuser@example.com',
        password: bcrypt.hashSync('Password@!123', 10),
      })
      await newUser.save()

      process.env.JWT_SAVE_TO_COOKIE = 'true'
    })

    it('schema should be correct', async () => {
      const schema = refreshTokenSchemaRouter(true)

      expect(schema).toBe(refreshTokenCookieSchema)
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

      // Extract refresh token from cookies
      const refreshToken = cookies[0].split(';')[0].split('=')[1]

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
        .send({ refreshToken })
      expect(refreshResponse.status).toBe(401)
      expect(refreshResponse.body).toHaveProperty(
        'message',
        'Token is blacklisted'
      )
    })
  })
})
