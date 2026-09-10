import { useState, useEffect } from 'react'

// ============ 界面主题 ============
// 主题作用于：天气展开页、日历、课表、调课、设置页。
// 收起态的天气小图标是透明桌面挂件，保持原有青蓝色系，不参与主题切换。

export type ThemeKey = 'classic' | 'pink' | 'mint'

export interface ThemeDef {
  key: ThemeKey
  label: string
  swatch: string   // 主题选择卡片上的色块
  bg: string       // 页面大背景渐变
  panel: string    // 弹窗/卡片面板背景渐变
  accent: string   // 主强调色（hex）
  rgb: string      // accent 的 rgb 分量，用于拼 rgba(r,g,b,alpha)
}

export const THEMES: ThemeDef[] = [
  {
    key: 'classic',
    label: '经典黑',
    swatch: '#4FC3F7',
    bg: 'linear-gradient(180deg, #0D1B2A 0%, #1B263B 50%, #243447 100%)',
    panel: 'linear-gradient(135deg, #1B263B 0%, #243447 100%)',
    accent: '#4FC3F7',
    rgb: '79,195,247',
  },
  {
    key: 'pink',
    label: '少女粉',
    swatch: '#F48FB1',
    bg: 'linear-gradient(180deg, #2A1526 0%, #3B1E38 50%, #472745 100%)',
    panel: 'linear-gradient(135deg, #3B1E38 0%, #472745 100%)',
    accent: '#F48FB1',
    rgb: '244,143,177',
  },
  {
    key: 'mint',
    label: '薄荷绿',
    swatch: '#69F0AE',
    bg: 'linear-gradient(180deg, #0D2420 0%, #1A3330 50%, #23423B 100%)',
    panel: 'linear-gradient(135deg, #1A3330 0%, #23423B 100%)',
    accent: '#69F0AE',
    rgb: '105,240,174',
  },
]

const THEME_STORAGE = 'xianren-theme'
const THEME_EVENT = 'xianren-theme-changed'

export function getThemeKey(): ThemeKey {
  try {
    const v = localStorage.getItem(THEME_STORAGE)
    if (v === 'pink' || v === 'mint' || v === 'classic') return v
  } catch { /* ignore */ }
  return 'classic'
}

export function getTheme(): ThemeDef {
  const k = getThemeKey()
  return THEMES.find((t) => t.key === k) ?? THEMES[0]
}

export function setThemeKey(k: ThemeKey) {
  try { localStorage.setItem(THEME_STORAGE, k) } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent(THEME_EVENT))
}

// 组件内使用：返回主题定义 + 半透明强调色拼装函数。
// 切换主题时通过自定义事件广播，所有 useTheme 的组件自动重渲染。
export function useTheme(): { theme: ThemeDef; ac: (alpha: number) => string } {
  const [theme, setTheme] = useState<ThemeDef>(() => getTheme())
  useEffect(() => {
    const handler = () => setTheme(getTheme())
    window.addEventListener(THEME_EVENT, handler)
    return () => window.removeEventListener(THEME_EVENT, handler)
  }, [])
  const ac = (alpha: number) => `rgba(${theme.rgb},${alpha})`
  return { theme, ac }
}
