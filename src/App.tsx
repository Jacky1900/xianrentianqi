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
      <div style={{
        height: '100vh',
        background: '#1a1a1a',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <TitleBar onMinimize={handleMinimize} onClose={handleClose} />
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            <div style={{ fontSize: 13, color: '#888' }}>加载天气数据中...</div>
          </div>
        </div>
      </div>
    )
  }

  // 加载失败
  if (weather.error) {
    return (
      <div style={{
        height: '100vh',
        background: '#1a1a1a',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <TitleBar onMinimize={handleMinimize} onClose={handleClose} />
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>😢</div>
            <div style={{ fontSize: 13, color: '#e53935', marginBottom: 8 }}>数据加载失败</div>
            <div style={{ fontSize: 11, color: '#777' }}>{weather.error}</div>
          </div>
        </div>
      </div>
    )
  }

  // 正常显示
  return (
    <div style={{
      height: '100vh',
      background: '#1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <TitleBar onMinimize={handleMinimize} onClose={handleClose} />

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '10px 12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
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
