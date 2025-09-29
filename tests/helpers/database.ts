import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import morgan from 'morgan'

let mongoServer: MongoMemoryServer

export const connect = async () => {
  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())
  morgan('Connected to in-memory MongoDB')
}

export const closeDatabase = async () => {
  if (mongoServer) {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    await mongoServer?.stop()
    morgan('Disconnected from in-memory MongoDB')
  }
}

export const clearDatabase = async () => {
  const collections = mongoose.connection.collections
  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({}))
  )
  morgan('Cleared in-memory MongoDB')
}
