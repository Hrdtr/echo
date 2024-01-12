import path from 'node:path'
import net from 'node:net'
import { pathToFileURL } from 'node:url'
import { BrowserWindow, app } from 'electron'

process.env.ROOT = path.join(process.resourcesPath)

async function findAvailablePort(startPort, endPort) {
  for (let port = startPort; port <= endPort; port++) {
    const isPortAvailable = await isPortFree(port)
    if (isPortAvailable) return port
  }
  throw new Error('No available ports in the specified range.')
}
function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') resolve(false)
      else throw err
    })
    server.once('listening', () => {
      server.close()
      resolve(true)
    })
    server.listen(port, '127.0.0.1')
  })
}

// Ports in the range 49152 to 65535 are often referred to as "private" or "ephemeral" ports -
// and are less likely to be used by other applications.
const startPort = 49152
const endPort = 65535

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
    autoHideMenuBar: true,
  })
  win.loadURL(`http://127.0.0.1:${process.env.PORT || 3000}`)
}

app.whenReady()
  .then(async () => {
    try {
      console.info('finding available port for app service')
      const port = await findAvailablePort(startPort, endPort)
      process.env.PORT = port
      console.info(`starting app service on port ${port}`)

      const modulePath = path.join(process.env.ROOT, '.output/server/index.mjs')
      const moduleUrl = pathToFileURL(modulePath).href
      const { default: startServer } = await import(moduleUrl)
      if (typeof startServer === 'function') startServer()
    }
    catch (error) {
      throw new Error('failed to start app service')
    }
  })
  .then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
