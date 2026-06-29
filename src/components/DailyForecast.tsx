import React from 'react'
import type { DailyForecast as DailyForecastType } from '../hooks/useWeather'

interface Props {
  forecasts: DailyForecastType[]
}

const DailyForecast: React.FC<Props> = ({ forecasts }) => {
  return (
    <div style={{ paddingTop: 10 }}>
      <div className="nokia-section-title">FORECAST</div>
      {forecasts.map((day, i) => (
        <React.Fragment key={day.date}>
          {i > 0 && <div className="nokia-forecast-divider" />}
          <div className="nokia-forecast-row">
            {/* 日期 */}
            <div className="nokia-day">{day.date}</div>

            {/* 天气图标 */}
            <div className="nokia-day-icon">{day.weatherIcon}</div>

            {/* 低温 */}
            <div style={{ flex: '0 0 40px', textAlign: 'right', paddingRight: 6 }}>
              <span className="nokia-lo nokia-temp-value">{day.tempMin}°</span>
            </div>

            {/* 温度条 */}
            <div style={{
              flex: 1,
              margin: '0 8px',
              height: 2,
              background: '#1a1a1a',
              borderRadius: 1,
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: `${(day.tempMin / 40) * 100}%`,
                width: `${Math.max(((day.tempMax - day.tempMin) / 40) * 100, 8)}%`,
                height: '100%',
                background: day.tempMax > 30 ? '#ff8c00' : day.tempMax < 15 ? '#4a90d9' : '#7ec850',
                borderRadius: 1,
                opacity: 0.8,
              }} />
            </div>

            {/* 高温 */}
            <div style={{ flex: '0 0 40px', textAlign: 'left', paddingLeft: 6 }}>
              <span className="nokia-hi nokia-temp-value">{day.tempMax}°</span>
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}

export default DailyForecast
