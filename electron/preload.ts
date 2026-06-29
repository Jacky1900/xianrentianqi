import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  close: () => ipcRenderer.send('window-close'),
  collapse: () => ipcRenderer.send('window-collapse'),
  expand: () => ipcRenderer.send('window-expand'),
  restoreIcon: () => ipcRenderer.send('window-restore-icon'),
  selectICSFile: () => ipcRenderer.invoke('select-ics-file'),
})
