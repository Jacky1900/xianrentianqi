import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 100,
    height: 120,
    resizable: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC handlers
ipcMain.on('window-minimize', () => {
  mainWindow?.minimize()
})

ipcMain.on('window-close', () => {
  mainWindow?.close()
})

// 收起为小图标：窗口缩小到只包住图标，且点击穿透
ipcMain.on('window-collapse', () => {
  if (!mainWindow) return
  const [x, y] = mainWindow.getPosition()
  // 缩小到 100x120，保持左上角位置不变
  mainWindow.setBounds({ x, y, width: 100, height: 120 })
  mainWindow.setIgnoreMouseEvents(false)
})

// 展开：窗口恢复到 400x700
ipcMain.on('window-expand', () => {
  if (!mainWindow) return
  const [x, y] = mainWindow.getPosition()
  mainWindow.setBounds({ x, y, width: 400, height: 700 })
})

ipcMain.handle('select-ics-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    filters: [{ name: 'ICS 日历文件', extensions: ['ics'] }],
    properties: ['openFile'],
  })
  if (result.canceled || result.filePaths.length === 0) {
    return null
  }
  const fs = await import('fs')
  const content = fs.readFileSync(result.filePaths[0], 'utf-8')
  return content
})
