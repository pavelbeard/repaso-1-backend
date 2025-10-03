import { Server } from 'http'
import supertest from 'supertest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { createServer } from '../../src/lib/createServer'
import * as db from './database'

const app = createServer()

let server: Server
let request: ReturnType<typeof supertest>

beforeAll(async () => {
  await db.connect()
  server = app.listen(0) // Listen on a random available port
  request = supertest(server)
})

afterEach(async () => {
  await db.clearDatabase()
})

afterAll(async () => {
  server.close()
  await db.closeDatabase()
})

export { request }
