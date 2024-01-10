import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { BrowserWindow, app } from 'electron'

process.env.ROOT = path.join(process.resourcesPath)

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
    autoHideMenuBar: true,
  })
  win.loadURL('http://localhost:3000')
}

app.whenReady()
  .then(async () => {
    const modulePath = path.join(process.env.ROOT, '.output/server/index.mjs')
    const moduleUrl = pathToFileURL(modulePath).href
    const { default: startServer } = await import(moduleUrl)
    if (typeof startServer === 'function') startServer()
  })
  .then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
