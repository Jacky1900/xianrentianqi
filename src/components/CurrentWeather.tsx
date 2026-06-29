import React from 'react'
import type { CurrentWeather as CurrentWeatherType } from '../hooks/useWeather'

interface Props {
  data: CurrentWeatherType
  city: string
}

const CurrentWeather: React.FC<Props> = ({ data, city }) => {
  return (
    <div className="lumia-panel" style={{ textAlign: 'center', padding: '20px 12px' }}>
      {/* 城市名 */}
      <div style={{ fontSize: 14, color: '#888', marginBottom: 6 }}>{city}</div>

      {/* 天气图标和描述 */}
      <div style={{ fontSize: 56, marginBottom: 4 }}>{data.weatherIcon}</div>
      <div style={{ fontSize: 13, color: '#aaa', marginBottom: 12 }}>{data.weatherLabel}</div>

      {/* 温度 */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', marginBottom: 16 }}>
        <span className="weather-value">{data.temperature}</span>
        <span className="weather-unit">°C</span>
      </div>

      {/* 详细信息 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <div>
          <div style={{ fontSize: 10, color: '#666', marginBottom: 2 }}>体感温度</div>
          <div style={{ fontSize: 16, color: '#e0e0e0' }}>{data.apparentTemperature}°</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: '#666', marginBottom: 2 }}>湿度</div>
          <div style={{ fontSize: 16, color: '#e0e0e0' }}>{data.humidity}%</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: '#666', marginBottom: 2 }}>风速</div>
          <div style={{ fontSize: 16, color: '#e0e0e0' }}>{data.windSpeed} km/h</div>
        </div>
      </div>
    </div>
  )
}

export default CurrentWeather
