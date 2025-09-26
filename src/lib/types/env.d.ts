declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string
    MONGODB_URL: string
    JWT_SECRET: string
  }
}
