import path from 'node:path'
import electron from 'electron'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

let databasePath = 'app.db'
if (!process.dev && isElectron())
  databasePath = path.join(electron.app.getPath('userData'), 'app.db')

const sqlite = new Database(databasePath)
export const db = drizzle(sqlite, {
  schema,
  logger: true,
})

export { schema }
