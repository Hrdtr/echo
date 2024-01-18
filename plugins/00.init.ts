export default defineNuxtPlugin(async () => {
  if (process.server) {
    let databasePath = 'app.db'
    let migrationsFolder = 'db/migrations'
    if (!process.dev && isElectron()) {
      const [electron, path] = await Promise.all([import('electron'), import('node:path')])
      databasePath = path.join(electron.app.getPath('userData'), 'app.db')
      migrationsFolder = path.join(electron.app.getAppPath(), 'db/migrations')
      import('electron-updater').then(({ default: { autoUpdater } }) => {
        autoUpdater.checkForUpdatesAndNotify()
      })
    }
    const [
      { drizzle },
      { migrate },
      { default: Database },
    ] = await Promise.all([
      import('drizzle-orm/better-sqlite3'),
      import('drizzle-orm/better-sqlite3/migrator'),
      import('better-sqlite3'),
    ])

    const betterSqlite = new Database(databasePath)
    const db = drizzle(betterSqlite)
    migrate(db, { migrationsFolder })
    betterSqlite.close()
  }

  const hosts = await $fetch('/api/hosts')
  const groups = await $fetch('/api/groups')
  const tags = await $fetch('/api/tags')

  return {
    provide: {
      hosts,
      groups,
      tags,
    },
  }
})
