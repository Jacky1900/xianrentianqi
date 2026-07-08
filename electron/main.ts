import { app, BrowserWindow, ipcMain, dialog, screen } from 'electron'
import path from 'path'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 100,
    height: 158,
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
    // 透明置顶窗口启动后显式聚焦，确保输入框可立即接收键盘输入
    mainWindow?.focus()
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

// 收起为小图标：窗口缩小到只包住图标
// 记住收起前小图标的位置，展开时基于此计算
let collapsedX = 0
let collapsedY = 0

ipcMain.on('window-collapse', () => {
  if (!mainWindow) return
  const [x, y] = mainWindow.getPosition()
  collapsedX = x
  collapsedY = y
  // 缩小到 100x158，保持左上角位置不变
  mainWindow.setBounds({ x, y, width: 100, height: 158 })
})

// 展开：窗口恢复到 400x700，自动调整位置确保完全在屏幕内
ipcMain.on('window-expand', () => {
  if (!mainWindow) return

  const EXPAND_W = 400
  const EXPAND_H = 700
  const COLLAPSE_W = 100
  const COLLAPSE_H = 158

  // 小图标当前左上角位置
  const [iconX, iconY] = mainWindow.getPosition()

  // 展开前保存小图标位置，以便收起时恢复到此位置
  collapsedX = iconX
  collapsedY = iconY

  // 获取小图标所在显示器的工作区（排除任务栏）
  const display = screen.getDisplayMatching({ x: iconX, y: iconY, width: COLLAPSE_W, height: COLLAPSE_H })
  const workArea = display.workArea // { x, y, width, height }

  // 默认：展开窗口左上角 = 小图标左上角
  let newX = iconX
  let newY = iconY

  // 右边界：如果展开后右边缘超出屏幕右侧，向左平移
  if (newX + EXPAND_W > workArea.x + workArea.width) {
    newX = workArea.x + workArea.width - EXPAND_W
  }
  // 左边界：如果超出屏幕左侧，贴左边缘
  if (newX < workArea.x) {
    newX = workArea.x
  }
  // 下边界：如果展开后下边缘超出屏幕底部，向上平移
  if (newY + EXPAND_H > workArea.y + workArea.height) {
    newY = workArea.y + workArea.height - EXPAND_H
  }
  // 上边界：如果超出屏幕顶部，贴顶部
  if (newY < workArea.y) {
    newY = workArea.y
  }

  mainWindow.setBounds({ x: Math.round(newX), y: Math.round(newY), width: EXPAND_W, height: EXPAND_H })
  // 展开后显式聚焦窗口：透明置顶窗口 resize 后 Windows 会短暂转走焦点，
  // 导致输入框“点击不出现光标、要等一会才能输入”。注意 setBounds 同步调用后
  // Windows 实际 resize 是异步的，若在 resize 完成前 focus() 会被系统覆盖。
  // 因此在 resize 事件真正完成后（窗口尺寸稳定）再 focus() 一次，确保焦点不丢。
  mainWindow.focus()
  const onResized = () => mainWindow?.focus()
  mainWindow.once('resize', onResized)
})

// 收起回小图标：恢复到展开前的图标位置
ipcMain.on('window-restore-icon', () => {
  if (!mainWindow) return
  mainWindow.setBounds({ x: collapsedX, y: collapsedY, width: 100, height: 158 })
  mainWindow.focus()
})

// JS 拖拽：渲染进程通过 mousemove 增量设置窗口位置
ipcMain.on('window-set-position', (_e, x: number, y: number) => {
  if (mainWindow) mainWindow.setPosition(Math.round(x), Math.round(y))
})
// 注意：preload 用 sendSync 同步获取，必须用 ipcMain.on + event.returnValue，
// 不能用 ipcMain.handle（那是给 invoke 异步用的，sendSync 拿不到返回值）
ipcMain.on('window-get-position', (event) => {
  event.returnValue = mainWindow ? mainWindow.getPosition() : [0, 0]
})

// 渲染进程（如原生 confirm 关闭后）主动夺回窗口焦点，避免输入框失焦导致点击无反应
ipcMain.on('window-focus', () => {
  mainWindow?.focus()
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
