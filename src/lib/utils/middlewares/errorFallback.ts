import type { NextFunction, Request, Response } from 'express'
import morgan from 'morgan'
import { AppError } from '../appError.ts'

export const errorFallback = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: NextFunction
) => {
  morgan(err.name)

  res.status('statusCode' in err ? (err.statusCode as number) : 500).json({
    message: err instanceof AppError ? err.message : 'Internal Server Error',
  })
}
