import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  close: () => ipcRenderer.send('window-close'),
  collapse: () => ipcRenderer.send('window-collapse'),
  expand: () => ipcRenderer.send('window-expand'),
  restoreIcon: () => ipcRenderer.send('window-restore-icon'),
  selectICSFile: () => ipcRenderer.invoke('select-ics-file'),
  exportTimetablePDF: () => ipcRenderer.invoke('export-timetable-pdf'),
  setPosition: (x: number, y: number) => ipcRenderer.send('window-set-position', x, y),
  getPosition: () => ipcRenderer.sendSync('window-get-position'),
  focus: () => ipcRenderer.send('window-focus'),
})
