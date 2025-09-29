enum AppErrorType {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

export class AppError extends Error {
  public readonly statusCode: number = AppErrorType.BAD_REQUEST

  constructor(type: keyof typeof AppErrorType, message: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = Error.name
    this.statusCode = AppErrorType[type]
    Error.captureStackTrace(this)
  }
}
