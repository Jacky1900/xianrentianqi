/// <reference types="vite/client" />

interface ElectronAPI {
  minimize: () => void
  close: () => void
  collapse: () => void
  expand: () => void
  restoreIcon: () => void
  selectICSFile: () => Promise<string | null>
  exportTimetablePDF: () => Promise<{ ok: boolean; path?: string; fallbackFrom?: string; error?: string; canceled?: boolean }>
  setPosition: (x: number, y: number) => void
  getPosition: () => number[]
  focus: () => void
  setAutoLaunch: (enable: boolean) => Promise<boolean>
  getAutoLaunch: () => Promise<boolean>
  setAlwaysOnTop: (enable: boolean) => Promise<boolean>
}

interface Window {
  electronAPI: ElectronAPI
}
