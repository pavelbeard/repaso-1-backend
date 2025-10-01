declare namespace Express {
  interface Request {
    session: {
      user: { username: string; email: string; id: string } | null
    }
  }
}
