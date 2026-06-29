/// <reference types="vite/client" />

interface ElectronAPI {
  minimize: () => void
  close: () => void
  collapse: () => void
  expand: () => void
  selectICSFile: () => Promise<string | null>
}

interface Window {
  electronAPI: ElectronAPI
}
