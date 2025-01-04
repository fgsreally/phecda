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
      title: '董员外',
      width: 1000,
      height: 800,
      webPreferences: {
        webSecurity: false,
        nodeIntegration: true,
        contextIsolation: true,
        webviewTag: true,
        preload: join(__dirname, '../preload.cjs'),
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
