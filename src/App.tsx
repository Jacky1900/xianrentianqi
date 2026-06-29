import React from 'react'
import TitleBar from './components/TitleBar'
import CurrentWeather from './components/CurrentWeather'
import DailyForecast from './components/DailyForecast'
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
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 13, opacity: 0.3 }}>loading…</span>
        </div>
      </div>
    )
  }

  // 加载失败
  if (weather.error) {
    return (
      <div style={{ height: '100vh', background: '#000', display: 'flex', flexDirection: 'column' }}>
        <TitleBar onMinimize={handleMinimize} onClose={handleClose} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13, opacity: 0.4 }}>UNABLE TO UPDATE</div>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'transparent',
              border: '1px solid #333',
              color: '#888',
              padding: '6px 20px',
              fontSize: 11,
              cursor: 'pointer',
              letterSpacing: 2,
              fontFamily: 'Segoe UI Light, sans-serif',
            }}
          >
            RETRY
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
        paddingBottom: 20,
      }}>
        {weather.current && (
          <>
            <CurrentWeather data={weather.current} city={weather.city} />
            <div className="nokia-section-divider" />
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
