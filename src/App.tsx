import React from 'react'
import TitleBar from './components/TitleBar'
import CurrentWeather from './components/CurrentWeather'
import DailyForecast from './components/DailyForecast'
import WeatherIcon from './components/WeatherIcon'
import { useWeather } from './hooks/useWeather'

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
      <div style={{ height: '100vh', background: '#000', display: 'flex', flexDirection: 'column' }}>
        <TitleBar onMinimize={handleMinimize} onClose={handleClose} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
          <WeatherIcon name="partly-cloudy" size={56} color="#333" />
          <span style={{ fontSize: 12, color: '#444', letterSpacing: 4 }}>加载中…</span>
        </div>
      </div>
    )
  }

  // 加载失败
  if (weather.error) {
    return (
      <div style={{ height: '100vh', background: '#000', display: 'flex', flexDirection: 'column' }}>
        <TitleBar onMinimize={handleMinimize} onClose={handleClose} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 13, color: '#555', letterSpacing: 4 }}>无法更新天气</div>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'transparent',
              border: '1px solid #222',
              color: '#777',
              padding: '6px 24px',
              fontSize: 11,
              cursor: 'pointer',
              letterSpacing: 4,
              fontFamily: '"Segoe UI Light", sans-serif',
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
    <div style={{
      height: '100vh',
      background: '#000000',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <TitleBar onMinimize={handleMinimize} onClose={handleClose} />

      <div style={{
        flex: 1,
        overflowY: 'auto',
      }}>
        {weather.current && (
          <>
            <CurrentWeather data={weather.current} city={weather.city} />
            <div style={{ height: 1, background: '#1a1a1a', margin: '0 20px' }} />
          </>
        )}
        {weather.daily.length > 0 && (
          <DailyForecast forecasts={weather.daily} />
        )}
      </div>
    </div>
  )
}

export default App
