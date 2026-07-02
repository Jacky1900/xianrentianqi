import React, { useState } from 'react'
import TitleBar from './components/TitleBar'
import CurrentWeather from './components/CurrentWeather'
import HourlyForecast from './components/HourlyForecast'
import DailyForecast from './components/DailyForecast'
import CalendarView from './components/CalendarView'
import WeatherIcon from './components/WeatherIcon'
import { useWeather } from './hooks/useWeather'

const App: React.FC = () => {
  const weather = useWeather()
  const [expanded, setExpanded] = useState(false)
  const [viewMode, setViewMode] = useState<'weather' | 'calendar'>('weather')

  const handleMinimize = () => {
    window.electronAPI?.minimize()
  }

  const handleClose = () => {
    window.electronAPI?.close()
  }

  const handleCollapse = () => {
    setExpanded(false)
    // 收起：窗口恢复到小图标原来的位置
    window.electronAPI?.restoreIcon()
  }

  const handleExpand = () => {
    setExpanded(true)
    setViewMode('weather')
    // 展开：窗口恢复到完整大小
    window.electronAPI?.expand()
  }

  const handleOpenCalendar = () => {
    setExpanded(true)
    setViewMode('calendar')
    window.electronAPI?.expand()
  }

  const handleBackToWeather = () => {
    setViewMode('weather')
  }

  const handleBackFromCalendar = () => {
    setExpanded(false)
    setViewMode('weather')
    window.electronAPI?.restoreIcon()
  }

  // 加载中
  if (weather.loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
      }}>
        <div style={{ textAlign: 'center', opacity: 0.4 }}>
          <WeatherIcon name="partly-cloudy" size={48} />
        </div>
      </div>
    )
  }

  // === 收起状态：小图标 + 日历入口 ===
  if (!expanded && weather.current) {
    return (
      <div
        className="weather-widget-drag"
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          background: 'transparent',
        }}
      >
        {/* 天气卡片 - 独立窗口外观 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            padding: '10px 14px 8px',
            borderRadius: 16,
            background: 'rgba(13, 27, 42, 0.1)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          {/* 小图标顶部按钮栏 - 透明背景 */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 4,
            width: '100%',
            marginBottom: 2,
          }}>
            {/* 展开按钮 */}
            <button
              className="mini-icon-btn"
              onClick={handleExpand}
              title="展开详情"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            </button>
            {/* 刷新按钮 */}
            <button
              className="mini-icon-btn"
              onClick={() => weather.refresh()}
              title="刷新"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </button>
            {/* 最小化按钮 */}
            <button
              className="mini-icon-btn"
              onClick={handleMinimize}
              title="最小化"
            >
              &#x2500;
            </button>
            {/* 关闭按钮 */}
            <button
              className="mini-icon-btn close"
              onClick={handleClose}
              title="关闭"
            >
              &#x2715;
            </button>
          </div>
          <WeatherIcon name={weather.current.weatherIcon} size={44} />
          <div style={{
            fontSize: 18,
            fontWeight: 200,
            color: '#fff',
            fontFamily: '"Noto Sans SC", "Segoe UI Light", sans-serif',
            lineHeight: 1,
          }}>
            {weather.current.temperature}°
          </div>
          <div style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: 2,
          }}>
            {weather.current.weatherLabel}
          </div>
        </div>

        {/* 日历入口 - 独立卡片外观 */}
        <button
          onClick={handleOpenCalendar}
          title="打开日历"
          className="mini-icon-btn"
          style={{
            width: 72,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            borderRadius: 10,
            background: 'rgba(13, 27, 42, 0.1)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.04)',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 11,
            cursor: 'pointer',
            padding: 0,
            fontFamily: '"Noto Sans SC", "Segoe UI", sans-serif',
            fontWeight: 300,
            letterSpacing: 1,
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#fff' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          日历
        </button>
      </div>
    )
  }

  // === 展开状态：日历视图 ===
  if (expanded && viewMode === 'calendar') {
    return <CalendarView onBack={handleBackFromCalendar} />
  }

  // === 展开状态：天气完整界面 ===
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 14,
        background: 'linear-gradient(180deg, #0D1B2A 0%, #1B263B 50%, #243447 100%)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        animation: 'expandIn 0.3s ease',
      }}
    >
      <TitleBar
        onMinimize={handleMinimize}
        onClose={handleClose}
        onCollapse={handleCollapse}
        onRefresh={() => weather.refresh()}
      />

      <div style={{
        flex: 1,
        overflowY: 'auto',
        paddingBottom: 12,
      }}>
        {weather.current && (
          <CurrentWeather data={weather.current} city={weather.city} />
        )}
        {weather.hourly.length > 0 && (
          <HourlyForecast forecasts={weather.hourly} />
        )}
        {weather.daily.length > 0 && (
          <DailyForecast forecasts={weather.daily} />
        )}
      </div>

      {/* 右下角标识 */}
      <div style={{
        textAlign: 'right',
        padding: '0 12px 4px',
        fontSize: 11,
        opacity: 0.2,
        letterSpacing: 1,
      }}>
        闲人天气
      </div>
    </div>
  )
}

export default App
