import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: 'db/schema.ts',
  driver: 'better-sqlite',
  dbCredentials: {
    url: 'app.db',
  },
  out: 'db/migrations',
})
