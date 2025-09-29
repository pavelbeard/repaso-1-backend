import bcrypt from 'bcrypt'
import type { NextFunction, Response } from 'express'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../../lib/constants'
import {
  createUserQuery,
  findUserByIdOrUsernameOrEmailQuery,
} from '../../lib/db/queries/auth.queries'
import { AppError } from '../../lib/utils/appError'
import { UserLoginRequest, UserRegisterRequest } from './auth.types'

export class AuthController {
  static async login(req: UserLoginRequest, res: Response, next: NextFunction) {
    if (Object.keys(req.body).length === 0) {
      return next(new AppError('BAD_REQUEST', 'Request body is empty'))
    }
    // 1. Validate email if exists
    const { email, password } = req.body

    const user = await findUserByIdOrUsernameOrEmailQuery({ email })

    if (!user) {
      return next(new AppError('NOT_FOUND', 'User not found'))
    }

    // 2. Check password
    if (!bcrypt.compareSync(password, user.password)) {
      return next(new AppError('UNAUTHORIZED', 'Invalid credentials'))
    }

    const userData = { id: user.id, email: user.email, username: user.username }

    // 3. Generate JWT or session
    const token = jwt.sign(userData, JWT_SECRET)

    res.status(200).json({ token, user: userData })
  }

  static async register(
    req: UserRegisterRequest,
    res: Response,
    next: NextFunction
  ) {
    if (Object.keys(req.body).length === 0) {
      return next(new AppError('BAD_REQUEST', 'Request body is empty'))
    }

    const { username, email, password, confirmPassword } = req.body

    // 1. Check if user exists
    const existingUser = await findUserByIdOrUsernameOrEmailQuery({
      username,
      email,
    })

    if (existingUser) {
      return next(new AppError('CONFLICT', 'User already exists'))
    }

    // 2. Check password match
    if (password !== confirmPassword) {
      return next(new AppError('BAD_REQUEST', 'Passwords do not match'))
    }

    // 3. Hash password
    const hashedPassword = bcrypt.hashSync(password, 10)

    // 4. Create user in DB
    const newUser = await createUserQuery({
      ...req.body,
      password: hashedPassword,
    })

    res.status(201).json({
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    })
  }
}
