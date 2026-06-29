import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  close: () => ipcRenderer.send('window-close'),
  collapse: () => ipcRenderer.send('window-collapse'),
  expand: () => ipcRenderer.send('window-expand'),
  selectICSFile: () => ipcRenderer.invoke('select-ics-file'),
})
