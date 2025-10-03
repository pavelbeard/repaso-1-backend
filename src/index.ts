import { config } from './lib/constants.ts'
import { createServer } from './lib/createServer.ts'
import { client } from './lib/db/client.ts'

const server = createServer()

client({
  app: () =>
    server.listen(config.PORT, () => {
      console.log(`Server is running on port ${config.PORT}`)
    }),
})
