import React, { useEffect, useRef } from 'react'
import { useTheme } from '../theme'

interface Props {
  message: string
  onOk: () => void
  onCancel: () => void
}

// 应用内确认弹层：替代 window.confirm。
// 原生 confirm 是系统模态对话框，弹出/关闭会夺走透明置顶窗口的键盘焦点，
// 关闭后输入框长时间点击不出光标；此组件纯 DOM 实现，焦点始终不离开窗口。
const ConfirmDialog: React.FC<Props> = ({ message, onOk, onCancel }) => {
  const { theme, ac } = useTheme()
  // 默认焦点放在"取消"上，防误触（Enter 直接确认删除较危险）
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    cancelRef.current?.focus()
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        WebkitAppRegion: 'no-drag',
      } as React.CSSProperties}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div style={{
        width: 240,
        maxWidth: '80%',
        background: theme.panel,
        border: `1px solid ${ac(0.5)}`,
        borderRadius: 10,
        boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        padding: 14,
      }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, whiteSpace: 'pre-line', textAlign: 'center', marginBottom: 14 }}>
          {message}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            ref={cancelRef}
            onClick={onCancel}
            style={{ flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '6px 0', cursor: 'pointer', letterSpacing: 1 }}
          >
            取消
          </button>
          <button
            onClick={onOk}
            style={{ flex: 1, fontSize: 12, color: '#fff', background: 'rgba(255,82,82,0.35)', border: '1px solid rgba(255,82,82,0.6)', borderRadius: 6, padding: '6px 0', cursor: 'pointer', letterSpacing: 1 }}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
