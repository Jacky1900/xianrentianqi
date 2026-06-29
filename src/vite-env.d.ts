/// <reference types="vite/client" />

interface ElectronAPI {
  minimize: () => void
  close: () => void
  selectICSFile: () => Promise<string | null>
}

interface Window {
  electronAPI: ElectronAPI
}
