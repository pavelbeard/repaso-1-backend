import type { NextFunction, Request, Response } from 'express'

export const notFound = (
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: NextFunction
) => {
  res.status(404).json({ message: 'Resource not found' })
}
