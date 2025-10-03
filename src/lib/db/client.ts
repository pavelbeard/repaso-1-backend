import mongoose from 'mongoose'
import { config } from '../constants'

// Function to connect to MongoDB and start the app as a callback

export const client = ({
  connstring = config.MONGODB_URL,
  app,
}: {
  connstring?: string
  app: () => void
}) => {
  mongoose
    .connect(connstring)
    .then(() => {
      console.log('Connected to MongoDB')

      app()
    })
    .catch((err) => {
      console.error('Error connecting to MongoDB: ' + err)
      process.exit(1)
    })
}
