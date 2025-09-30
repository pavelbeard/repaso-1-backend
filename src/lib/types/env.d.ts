declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string
    MONGODB_URL: string
    JWT_SECRET_ACCESS: string
    JWT_SECRET_REFRESH: string
  }
}
