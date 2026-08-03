import { useEffect } from 'react'

// 拖动判定阈值（像素）：超过才视为拖动，避免误触影响点击
const DRAG_THRESHOLD = 4

/**
 * 用 JS 实现无边框透明窗口拖动，替代 -webkit-app-region: drag。
 *
 * 方案：用 e.screenX/Y（光标屏幕绝对坐标，DIP）做“位置差”。
 *   目标窗口位置 = 拖动起点窗口位置 + (当前 screenX - 起点 screenX)
 *
 * 为什么不用 e.movementX/Y 累加：
 *   movementX/Y 是“相对上一事件的位移”。当窗口被 setPosition 移动后，
 *   Chromium 在透明无边框窗口上发出的 mousemove 其 movementX/Y 会被污染/丢失
 *   （已知问题），累加后 totalDX 越来越偏 → 窗口越拖越飞（表现为“变大”）、
 *   且丢帧 → 不跟手。screenX 是光标屏幕绝对坐标，与窗口自身位置无关，
 *   setPosition 移动窗口不会改变它，因此位置差始终准确、跟手。
 *
 * 防“按住不动却滑动”：setPosition 移动窗口后系统会补发 mousemove，但此时
 *   screenX 未变，位置差不变，目标位置不变，不会形成正反馈；额外用
 *   “screenX===lastScreenX 则跳过”兜底。
 *
 * 防“双击触发异常”：双击/三击的后续按下（e.detail>=2）不发起拖动。
 *
 * rAF 节流：mousemove 高频触发，用 requestAnimationFrame 合并到每帧一次
 *   setPosition，避免 IPC 队列堆积导致滞后（进一步改善跟手）。
 *
 * 拖拽区域：.nokia-titlebar、.weather-widget-drag、[data-drag]
 * 排除元素：button / input / select / textarea / [data-no-drag]
 */
export function useWindowDrag() {
  useEffect(() => {
    let dragging = false
    let moved = false // 是否已越过阈值（一旦越过，后续都跟手移动）
    // mousedown 时光标的屏幕坐标
    let startScreenX = 0, startScreenY = 0
    // mousedown 时窗口左上角的屏幕坐标
    let startWinX = 0, startWinY = 0
    // 上一次 mousemove 的 screenX/Y，用于“光标没动就跳过”
    let lastScreenX = 0, lastScreenY = 0
    // rAF 节流
    let rafId = 0
    let pendingX = 0, pendingY = 0

    const isDragHandle = (el: HTMLElement | null) =>
      !!el?.closest('.nokia-titlebar, .weather-widget-drag, [data-drag]')

    const isInteractive = (el: HTMLElement | null) =>
      !!el?.closest('button, input, select, textarea, [data-no-drag]')

    const flush = () => {
      rafId = 0
      window.electronAPI?.setPositionSync?.(Math.round(pendingX), Math.round(pendingY))
    }

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      // 双击/三击的后续按下不发起拖动，避免“双击后按住”触发异常
      if (e.detail >= 2) return
      const target = e.target as HTMLElement
      if (isInteractive(target)) return
      if (!isDragHandle(target)) return
      dragging = true
      moved = false
      startScreenX = e.screenX
      startScreenY = e.screenY
      lastScreenX = e.screenX
      lastScreenY = e.screenY
      const pos = window.electronAPI?.getPosition?.()
      startWinX = Array.isArray(pos) ? pos[0] : 0
      startWinY = Array.isArray(pos) ? pos[1] : 0
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return
      // 光标没动（系统因窗口移动补发的 mousemove）就跳过，杜绝正反馈
      if (e.screenX === lastScreenX && e.screenY === lastScreenY) return
      lastScreenX = e.screenX
      lastScreenY = e.screenY

      const dx = e.screenX - startScreenX
      const dy = e.screenY - startScreenY
      // 阈值判定：未越过阈值前不移动窗口，避免点击被误判为拖动
      if (!moved) {
        if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return
        moved = true
      }
      pendingX = startWinX + dx
      pendingY = startWinY + dy
      if (!rafId) rafId = requestAnimationFrame(flush)
    }

    const onMouseUp = () => {
      if (rafId) {
        cancelAnimationFrame(rafId)
        rafId = 0
        // 松手前若有未刷新的目标位置，立即落盘，避免最后一点位移丢失
        if (moved) flush()
      }
      dragging = false
      moved = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousedown', onMouseDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])
}
