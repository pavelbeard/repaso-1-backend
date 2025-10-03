import bcrypt from 'bcrypt'
import { beforeAll, describe, expect, it } from 'vitest'
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
})
