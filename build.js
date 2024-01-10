import { execSync } from 'node:child_process'
import { cpSync } from 'node:fs'

const web = process.argv.includes('--web')
const release = process.argv.includes('--release')
const prerelease = process.argv.includes('--prerelease')
if (release && prerelease) {
  console.error('Cannot have both --release and --prerelease')
  process.exit(1)
}

function run(cmd) {
  try {
    execSync(cmd, { stdio: 'inherit' })
  }
  catch (error) {
    console.error(error)
    process.exit(1)
  }
}

if (!web) {
  // Install app dependencies for Electron Builder
  run('electron-builder install-app-deps')
}

// Run Nuxt.js build
run('nuxt build')

// Copy migrations to output directory
const migrationsPath = 'db/migrations'
const outputMigrationsPath = '.output/server/db/migrations'
try {
  cpSync(migrationsPath, outputMigrationsPath, { recursive: true })
}
catch (error) {
  console.error(error)
  process.exit(1)
}

if (!web) {
  // Package (and Publish)
  run(`${prerelease ? 'EP_PRE_RELEASE=true ' : ''}electron-builder${release || prerelease ? ' --publish always' : ''}`)
}
