import { PORT } from './lib/constants.ts'
import { createServer } from './lib/createServer.ts'

const server = createServer()

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
