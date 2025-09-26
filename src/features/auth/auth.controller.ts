import type { NextFunction, Request, Response } from 'express'

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    // Aquí iría la lógica para autenticar al usuario
    res.status(200).json({ message: 'Login successful' })
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    // Aquí iría la lógica para registrar al usuario
    res.status(201).json({ message: 'User registered successfully' })
  }
}
