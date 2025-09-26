import { MONGODB_URL } from '../constants.ts'

export const client = async (connstring: string) => {
  const mongoUrl = connstring ?? MONGODB_URL
}
