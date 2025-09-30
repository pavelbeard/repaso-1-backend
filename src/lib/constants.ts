export const MONGODB_URL =
  process.env.MONGODB_URL || 'mongodb://localhost:27017/todoapp'
export const PORT = process.env.PORT || 3000
export const JWT_SECRET_ACCESS =
  process.env.JWT_SECRET_ACCESS || 'your_jwt_secret_access'
export const JWT_SECRET_REFRESH =
  process.env.JWT_SECRET_REFRESH || 'your_jwt_secret_refresh'
export const API_PREFIX = '/api/v1'
