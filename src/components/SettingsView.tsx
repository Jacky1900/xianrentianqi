import React, { useState, useEffect } from 'react'
import { THEMES, ThemeKey, getThemeKey, setThemeKey, useTheme } from '../theme'

interface Props {
  onBack: () => void
}

// iOS 风格小开关
const Toggle: React.FC<{ on: boolean; onChange: (v: boolean) => void; ac: (a: number) => string }> = ({ on, onChange, ac }) => (
  <div
    onClick={() => onChange(!on)}
    style={{
      width: 36,
      height: 20,
      borderRadius: 10,
      cursor: 'pointer',
      position: 'relative',
      background: on ? ac(0.5) : 'rgba(255,255,255,0.12)',
      border: `1px solid ${on ? ac(0.8) : 'rgba(255,255,255,0.2)'}`,
      transition: 'background 0.2s',
      flexShrink: 0,
    }}
  >
    <div style={{
      position: 'absolute',
      top: 2,
      left: on ? 18 : 2,
      width: 14,
      height: 14,
      borderRadius: '50%',
      background: on ? '#fff' : 'rgba(255,255,255,0.5)',
      transition: 'left 0.2s',
    }} />
  </div>
)

const SettingsView: React.FC<Props> = ({ onBack }) => {
  const { theme, ac } = useTheme()
  const [autoLaunch, setAutoLaunch] = useState(false)
  const [alwaysOnTop, setAlwaysOnTop] = useState<boolean>(() => {
    try { return localStorage.getItem('xianren-always-on-top') !== '0' } catch { return true }
  })
  const [themeKeyState, setThemeKeyState] = useState<ThemeKey>(() => getThemeKey())

  // 开机自启状态以系统注册项为准，打开设置页时读取
  useEffect(() => {
    window.electronAPI?.getAutoLaunch?.().then((v) => setAutoLaunch(!!v)).catch(() => {})
  }, [])

  const handleAutoLaunch = (v: boolean) => {
    setAutoLaunch(v)
    window.electronAPI?.setAutoLaunch?.(v)
  }

  const handleAlwaysOnTop = (v: boolean) => {
    setAlwaysOnTop(v)
    try { localStorage.setItem('xianren-always-on-top', v ? '1' : '0') } catch { /* ignore */ }
    window.electronAPI?.setAlwaysOnTop?.(v)
  }

  const handleTheme = (k: ThemeKey) => {
    setThemeKeyState(k)
    setThemeKey(k) // 持久化 + 广播，所有 useTheme 组件自动换肤
  }

  const groupLabel: React.CSSProperties = { fontSize: 11, color: ac(0.8), letterSpacing: 2, margin: '12px 2px 4px' }
  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 8,
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      borderRadius: 14,
      background: theme.bg,
      boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
      WebkitAppRegion: 'no-drag',
    }}>
      {/* 标题栏 */}
      <div className="nokia-titlebar">
        <button className="nokia-titlebar-btn" onClick={onBack} title="返回" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, marginLeft: 4 }}>设置</span>
        <span style={{ flex: 1 }} />
      </div>

      {/* 内容 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '4px 12px 8px' }}>
        {/* 启动 */}
        <div style={groupLabel}>启动</div>
        <div style={rowStyle}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>开机自动启动</span>
          <Toggle on={autoLaunch} onChange={handleAutoLaunch} ac={ac} />
        </div>

        {/* 窗口 */}
        <div style={groupLabel}>窗口</div>
        <div style={rowStyle}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>小图标窗口置顶</span>
          <Toggle on={alwaysOnTop} onChange={handleAlwaysOnTop} ac={ac} />
        </div>
        {!alwaysOnTop && (
          <div style={{ fontSize: 10, color: '#FFB74D', margin: '4px 4px 0', letterSpacing: 1, lineHeight: 1.5 }}>
            ⚠ 已关闭置顶，课程提醒闪烁可能被其他窗口遮挡
          </div>
        )}

        {/* 主题 */}
        <div style={groupLabel}>界面主题</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {THEMES.map((t) => {
            const active = t.key === themeKeyState
            return (
              <div
                key={t.key}
                onClick={() => handleTheme(t.key)}
                style={{
                  flex: 1,
                  cursor: 'pointer',
                  borderRadius: 8,
                  padding: 8,
                  background: 'rgba(255,255,255,0.04)',
                  border: active ? `1.5px solid ${t.swatch}` : '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {/* 迷你窗口预览 */}
                <div style={{
                  width: '100%',
                  height: 36,
                  borderRadius: 6,
                  background: t.bg,
                  border: '1px solid rgba(255,255,255,0.12)',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', left: 6, top: 6, width: 14, height: 14, borderRadius: '50%', background: t.swatch }} />
                  <div style={{ position: 'absolute', right: 6, top: 7, width: 18, height: 4, borderRadius: 2, background: `rgba(${t.rgb},0.4)` }} />
                  <div style={{ position: 'absolute', right: 6, top: 15, width: 12, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.25)' }} />
                </div>
                <span style={{ fontSize: 11, color: active ? '#fff' : 'rgba(255,255,255,0.6)' }}>{t.label}</span>
              </div>
            )
          })}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', margin: '6px 4px 0', letterSpacing: 1, lineHeight: 1.5 }}>
          主题作用于天气详情、日历、课表、调课和设置页；桌面小图标保持青蓝色
        </div>

        {/* 版本号 - 右下角 */}
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: 1, padding: '8px 2px 0', textAlign: 'right' }}>
          闲人天气 1.0.0
        </div>
      </div>
    </div>
  )
}

export default SettingsView
