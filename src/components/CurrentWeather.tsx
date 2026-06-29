import React from 'react'
import type { CurrentWeather as CurrentWeatherType } from '../hooks/useWeather'

interface Props {
  data: CurrentWeatherType
  city: string
}

const CurrentWeather: React.FC<Props> = ({ data, city }) => {
  return (
    <div style={{ padding: '16px 0 8px', textAlign: 'center' }}>
      {/* 城市名 */}
      <div className="nokia-city">{city}</div>

      {/* 天气图标 */}
      <div style={{ fontSize: 52, marginBottom: 6, lineHeight: 1 }}>
        {data.weatherIcon}
      </div>

      {/* 天气描述 */}
      <div className="nokia-condition" style={{ marginBottom: 14 }}>
        {data.weatherLabel}
      </div>

      {/* 超大温度 */}
      <div style={{ marginBottom: 20 }}>
        <span className="nokia-temp">{data.temperature}</span>
        <span className="nokia-degree">°</span>
      </div>

      {/* 详细信息 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 40,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="nokia-detail">FEELS LIKE</div>
          <div className="nokia-detail-value">{data.apparentTemperature}°</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="nokia-detail">HUMIDITY</div>
          <div className="nokia-detail-value">{data.humidity}%</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="nokia-detail">WIND</div>
          <div className="nokia-detail-value">{data.windSpeed}</div>
        </div>
      </div>
    </div>
  )
}

export default CurrentWeather
