import { useEffect } from 'react'

// 拖动判定阈值（像素）：超过才视为拖动，避免误触影响点击
const DRAG_THRESHOLD = 4

/**
 * 用 JS 实现无边框透明窗口拖动，替代 -webkit-app-region: drag。
 *
 * 根因：Electron 透明窗口中 -webkit-app-region: drag 的命中位图在窗口 resize / DOM 切换后
 * 重算有延迟，期间旧 drag 区域会拦截鼠标事件，导致输入框“点不动、要等一会才能输入”。
 * 改为 JS 拖动后不再有原生 drag 区域，输入框始终可立即点击，不受 HMR/重载/resize 影响。
 *
 * 拖拽区域：.nokia-titlebar、.weather-widget-drag、[data-drag]
 * 排除元素：button / input / select / textarea / [data-no-drag]（点击它们不触发拖动）
 */
export function useWindowDrag() {
  useEffect(() => {
    let startX = 0, startY = 0, winX = 0, winY = 0
    let pending = false, dragging = false

    const isDragHandle = (el: HTMLElement | null) =>
      !!el?.closest('.nokia-titlebar, .weather-widget-drag, [data-drag]')

    const isInteractive = (el: HTMLElement | null) =>
      !!el?.closest('button, input, select, textarea, [data-no-drag]')

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      const target = e.target as HTMLElement
      if (isInteractive(target)) return
      if (!isDragHandle(target)) return
      pending = true
      dragging = false
      startX = e.screenX
      startY = e.screenY
      // 同步获取窗口当前位置（sendSync），拖动期间用 screenX/Y 增量计算新位置
      const pos = window.electronAPI?.getPosition?.()
      winX = Array.isArray(pos) ? pos[0] : 0
      winY = Array.isArray(pos) ? pos[1] : 0
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!pending) return
      if (!dragging) {
        if (Math.abs(e.screenX - startX) < DRAG_THRESHOLD && Math.abs(e.screenY - startY) < DRAG_THRESHOLD) return
        dragging = true
      }
      window.electronAPI?.setPosition?.(winX + (e.screenX - startX), winY + (e.screenY - startY))
    }

    const onMouseUp = () => {
      pending = false
      dragging = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousedown', onMouseDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [])
}
