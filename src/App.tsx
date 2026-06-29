import React, { useState } from 'react'
import TitleBar from './components/TitleBar'
import CurrentWeather from './components/CurrentWeather'
import DailyForecast from './components/DailyForecast'
import WeatherIcon from './components/WeatherIcon'
import { useWeather } from './hooks/useWeather'

const App: React.FC = () => {
  const weather = useWeather()
  const [expanded, setExpanded] = useState(false)

  const handleMinimize = () => {
    window.electronAPI?.minimize()
  }

  const handleClose = () => {
    window.electronAPI?.close()
  }

  const handleCollapse = () => {
    setExpanded(false)
    // 收起：窗口缩小到只包住小图标
    window.electronAPI?.collapse()
  }

  const handleExpand = () => {
    setExpanded(true)
    // 展开：窗口恢复到完整大小
    window.electronAPI?.expand()
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

  // === 收起状态：只显示小图标 ===
  // 只在鼠标进入小图标区域时才展开
  if (!expanded && weather.current) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        {/* 透明 3D 天气图标 - 可拖动 + 鼠标悬停展开 */}
        <div
          className="weather-widget-drag"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            padding: '10px 14px',
            borderRadius: 16,
            background: 'rgba(13, 27, 42, 0.1)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.04)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={handleExpand}
          title="悬停查看详情"
        >
          <WeatherIcon name={weather.current.weatherIcon} size={56} />
          <div style={{
            fontSize: 22,
            fontWeight: 200,
            color: '#fff',
            fontFamily: '"Noto Sans SC", "Segoe UI Light", sans-serif',
            lineHeight: 1,
          }}>
            {weather.current.temperature}°
          </div>
          <div style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: 2,
          }}>
            {weather.current.weatherLabel}
          </div>
        </div>
      </div>
    )
  }

  // === 展开状态：完整界面 ===
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
      />

      <div style={{
        flex: 1,
        overflowY: 'auto',
        paddingBottom: 12,
      }}>
        {weather.current && (
          <CurrentWeather data={weather.current} city={weather.city} />
        )}
        {weather.daily.length > 0 && (
          <DailyForecast forecasts={weather.daily} />
        )}
      </div>
    </div>
  )
}

export default App
