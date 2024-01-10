import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { BrowserWindow, app } from 'electron'

process.env.ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../')

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
  .then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
