import React from 'react'
import type { DailyForecast as DailyForecastType } from '../hooks/useWeather'

interface Props {
  forecasts: DailyForecastType[]
}

const DailyForecast: React.FC<Props> = ({ forecasts }) => {
  return (
    <div className="lumia-panel" style={{ padding: '12px 0' }}>
      <div style={{ fontSize: 12, color: '#888', padding: '0 12px', marginBottom: 8 }}>
        未来 7 天
      </div>
      {forecasts.map((day, i) => (
        <div
          key={day.date}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '6px 12px',
            borderBottom: i < forecasts.length - 1 ? '1px solid #333' : 'none',
          }}
        >
          {/* 日期 */}
          <div style={{ flex: '0 0 80px', fontSize: 12, color: '#aaa' }}>
            {day.date}
          </div>

          {/* 天气图标 */}
          <div style={{ flex: '0 0 36px', fontSize: 20, textAlign: 'center' }}>
            {day.weatherIcon}
          </div>

          {/* 天气描述 */}
          <div style={{ flex: 1, fontSize: 11, color: '#777' }}>
            {day.weatherLabel}
          </div>

          {/* 温度 */}
          <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
            <span className="temp-low">{day.tempMin}°</span>
            <span className="temp-high">{day.tempMax}°</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default DailyForecast
