const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  'phecda-client:send': (...args) => ipcRenderer.send('phecda-server:send', ...args),
  'phecda-client:invoke': (...args) => ipcRenderer.invoke('phecda-server:invoke', ...args),

})
