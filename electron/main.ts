import { app, BrowserWindow, ipcMain, dialog, screen, shell } from 'electron'
import path from 'path'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 100,
    height: 158,
    resizable: false,
    // 关掉 Windows 的厚边框（WS_THICKFRAME），否则无边框透明窗口顶部/边缘
    // 仍残留不可见的缩放/最大化热区，双击标题栏会被系统最大化 → 窗口变大
    thickFrame: false,
    maximizable: false,
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
    mainWindow?.focus()
  })
  // 双保险：运行时再强制关一次缩放/最大化，确保双击标题栏不会触发系统最大化
  mainWindow.setResizable(false)
  mainWindow.setMaximizable(false)
  // 双击标题栏（-webkit-app-region: drag → HTCAPTION）时，
  // Windows 会触发 WM_NCLBUTTONDBLCLK 尝试最大化。
  // maximizable: false 已移除 WS_MAXIMIZEBOX，正常不会最大化，
  // 但加一层保险：如果窗口意外进入最大化状态，立即恢复。
  mainWindow.on('maximize', () => mainWindow.unmaximize())
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

// JS 拖拽：渲染进程设置窗口位置（异步版本，用于非拖动场景）
ipcMain.on('window-set-position', (_e, x: number, y: number) => {
  if (!mainWindow) return
  mainWindow.setPosition(Math.round(x), Math.round(y))
})

ipcMain.on('window-get-position', (event) => {
  event.returnValue = mainWindow ? mainWindow.getPosition() : [0, 0]
})

// 渲染进程（如原生 confirm 关闭后）主动夺回窗口焦点，避免输入框失焦导致点击无反应
ipcMain.on('window-focus', () => {
  mainWindow?.focus()
})

// 课表导出为 PDF：复用打印样式（@media print + @page A4 纵向），
// 生成矢量 PDF（文字可选中），拷到其他电脑打开即可直接打印。
// 弹对话框让用户选位置；所选位置写入失败时自动兜底（下载文件夹）。
//
// 【重大 BUG 修复】绝不能直接在 mainWindow 上 printToPDF：
// 主窗口是 transparent: true 的透明无边框窗口，透明窗口 + 打印合成
// 会打崩 GPU 进程（曾连带系统显卡驱动 TDR，用户桌面消失"死机"）。
// 改为：后台开一个隐藏的"非透明"打印窗口，加载同一应用的 #print-timetable
// 视图（App 检测该 hash 后直接渲染课表总览），在它上面生成 PDF，
// 完成后立即销毁。主窗口全程不参与打印。
ipcMain.handle('export-timetable-pdf', async () => {
  if (!mainWindow) return { ok: false, error: '窗口未就绪' }
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: '课表导出为 PDF',
      defaultPath: path.join(app.getPath('desktop'), '课表总览.pdf'),
      filters: [{ name: 'PDF 文件', extensions: ['pdf'] }],
    })
    if (result.canceled || !result.filePath) return { ok: false, canceled: true }

    // 隐藏的非透明打印窗口（show:false + 不设 transparent）
    const printWin = new BrowserWindow({
      show: false,
      width: 800,
      height: 1000,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    })
    try {
      if (process.env.VITE_DEV_SERVER_URL) {
        await printWin.loadURL(`${process.env.VITE_DEV_SERVER_URL}#print-timetable`)
      } else {
        await printWin.loadFile(path.join(__dirname, '../dist/index.html'), { hash: 'print-timetable' })
      }
      // 等渲染稳定（课表数据从 localStorage 同步读取很快，留足字体加载时间）
      await new Promise((r) => setTimeout(r, 500))
      const pdf = await printWin.webContents.printToPDF({ preferCSSPageSize: true, printBackground: true })
      const fs = await import('fs')
      const write = (p: string) => {
        fs.mkdirSync(path.dirname(p), { recursive: true })
        fs.writeFileSync(p, pdf)
      }
      try {
        write(result.filePath)
        shell.showItemInFolder(result.filePath)
        return { ok: true, path: result.filePath }
      } catch {
        // 所选位置不可写：自动兜底到"下载"文件夹
        const fallback = path.join(app.getPath('downloads'), '课表总览.pdf')
        write(fallback)
        shell.showItemInFolder(fallback)
        return { ok: true, path: fallback, fallbackFrom: result.filePath }
      }
    } finally {
      printWin.destroy()
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
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
