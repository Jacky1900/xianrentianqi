import React, { useState, useRef, useEffect } from 'react'

export type SelectTheme = 'purple' | 'blue' | 'red'

export interface SelectOption {
  value: string | number
  label: string
}

interface Props<T extends string | number> {
  value: T
  onChange: (value: T) => void
  options: SelectOption[]
  theme?: SelectTheme
  style?: React.CSSProperties
}

// 各区块配色：边框/底色（收起态） + 弹窗面板底色 + 选中/悬浮底色
const themeColors: Record<SelectTheme, { border: string; bg: string; panel: string; active: string }> = {
  purple: { border: 'rgba(186,104,200,0.3)', bg: 'rgba(186,104,200,0.1)', panel: '#3D2A4D', active: 'rgba(186,104,200,0.3)' },
  blue: { border: 'rgba(79,195,247,0.3)', bg: 'rgba(79,195,247,0.1)', panel: '#1B3A4D', active: 'rgba(79,195,247,0.3)' },
  red: { border: 'rgba(255,82,82,0.3)', bg: 'rgba(255,82,82,0.1)', panel: '#4D2529', active: 'rgba(255,82,82,0.3)' },
}

function ColoredSelect<T extends string | number>({
  value,
  onChange,
  options,
  theme = 'blue',
  style,
}: Props<T>) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const c = themeColors[theme]

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = options.find((o) => o.value === value)

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1, ...style }}>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          background: c.bg,
          border: `1px solid ${c.border}`,
          borderRadius: 4,
          padding: '4px 6px',
          color: '#fff',
          fontSize: 12,
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          userSelect: 'none',
        }}
      >
        <span>{current ? current.label : ''}</span>
        <span style={{ fontSize: 10, opacity: 0.6 }}>{open ? '▴' : '▾'}</span>
      </div>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 2,
            background: c.panel,
            border: `1px solid ${c.border}`,
            borderRadius: 4,
            maxHeight: 168,
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
          }}
        >
          {options.map((o) => {
            const selected = o.value === value
            return (
              <div
                key={o.value}
                onClick={() => {
                  onChange(o.value as T)
                  setOpen(false)
                }}
                style={{
                  padding: '4px 6px',
                  fontSize: 12,
                  color: selected ? '#fff' : 'rgba(255,255,255,0.75)',
                  background: selected ? c.active : 'transparent',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = c.active
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = selected ? c.active : 'transparent'
                }}
              >
                {o.label}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ColoredSelect
