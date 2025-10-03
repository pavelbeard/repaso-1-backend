export const config = {
  MONGODB_URL: process.env.MONGODB_URL || 'mongodb://localhost:27017/todoapp',
  PORT: process.env.PORT || 3000,
  JWT_SECRET_ACCESS: process.env.JWT_SECRET_ACCESS || 'your_jwt_secret_access',
  JWT_SECRET_REFRESH:
    process.env.JWT_SECRET_REFRESH || 'your_jwt_secret_refresh',
  JWT_SAVE_TO_COOKIE: process.env.JWT_SAVE_TO_COOKIE === 'true',
  API_PREFIX: '/api/v1',
  TEST: () => 'test',
}
