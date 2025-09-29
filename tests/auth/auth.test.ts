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
      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('user')
    })
  })
})
