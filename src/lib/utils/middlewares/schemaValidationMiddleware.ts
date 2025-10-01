import type { NextFunction, Request, Response } from 'express'
import { ZodError, ZodObject } from 'zod'
import { AppError } from '../appError'

export const schemaValidation =
  (schema: ZodObject) =>
  async (req: Request<unknown>, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
      })

      return next()
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((issue) => issue.path.pop())
        const message = `Invalid or missing field${
          issues?.length > 1 ? 's' : ''
        } provided for: ${issues?.join(', ')}`
        next(new AppError('BAD_REQUEST', message))
      } else {
        return next(new AppError('BAD_REQUEST', 'Invalid request'))
      }
    }
  }
