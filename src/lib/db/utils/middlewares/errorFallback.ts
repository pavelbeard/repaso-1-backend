import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../appError.ts'

export const errorFallback = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: NextFunction
) => {
  console.error(err.name)

  console.log(res)

  res.status('statusCode' in err ? (err.statusCode as number) : 500).json({
    message: err instanceof AppError ? err.message : 'Internal Server Error',
  })
}
