import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { bind } from 'phecda-server/electron'
import { BrowserWindow, app, ipcMain } from 'electron'
import { TestRpc } from './test.rpc'

const __dirname = dirname(fileURLToPath(import.meta.url))

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'
app.commandLine.appendSwitch('disable-web-security')
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors') // 允许跨域
app.commandLine.appendSwitch('--ignore-certificate-errors', 'true') // 忽略证书相关错误

async function start() {
  const data = await Factory([TestRpc], {
    generators: [new RPCGenerator()],
  })

  await bind(ipcMain, data)

  app.whenReady().then(() => {
    const win = new BrowserWindow({
      title: 'phecda',
      width: 1000,
      height: 800,
      webPreferences: {
        preload: join(__dirname, '../preload.mjs'),
      },
    })
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  })
  app.on('window-all-closed', () => {
    app.exit()
  })
}

start()
