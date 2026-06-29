import React from 'react'
import TitleBar from './components/TitleBar'
import CurrentWeather from './components/CurrentWeather'
import HourlyForecast from './components/HourlyForecast'
import DailyForecast from './components/DailyForecast'
import WeatherIcon from './components/WeatherIcon'
import { useWeather } from './hooks/useWeather'

// 窗口容器公共样式：圆角 + 渐变背景 + 阴影
const containerStyle: React.CSSProperties = {
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  borderRadius: 14,
  background: 'linear-gradient(180deg, #0D1B2A 0%, #1B263B 50%, #243447 100%)',
  boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
}

const App: React.FC = () => {
  const weather = useWeather()

  const handleMinimize = () => {
    window.electronAPI?.minimize()
  }

  const handleClose = () => {
    window.electronAPI?.close()
  }

  // 加载中
  if (weather.loading) {
    return (
      <div style={containerStyle}>
        <TitleBar onMinimize={handleMinimize} onClose={handleClose} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
          <WeatherIcon name="partly-cloudy" size={56} />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', letterSpacing: 4, fontWeight: 300 }}>加载中…</span>
        </div>
      </div>
    )
  }

  // 加载失败
  if (weather.error) {
    return (
      <div style={containerStyle}>
        <TitleBar onMinimize={handleMinimize} onClose={handleClose} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', letterSpacing: 4, fontWeight: 300 }}>无法更新天气</div>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.6)',
              padding: '6px 24px',
              fontSize: 11,
              cursor: 'pointer',
              letterSpacing: 4,
              fontWeight: 300,
              borderRadius: 6,
            }}
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  // 正常显示
  return (
    <div style={containerStyle}>
      <TitleBar onMinimize={handleMinimize} onClose={handleClose} />

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
    </div>
  )
}

export default App
