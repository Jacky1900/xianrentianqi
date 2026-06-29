import React from 'react'
import type { DailyForecast as DailyForecastType } from '../hooks/useWeather'
import WeatherIcon from './WeatherIcon'

interface Props {
  forecasts: DailyForecastType[]
}

const DailyForecast: React.FC<Props> = ({ forecasts }) => {
  return (
    <div style={{ padding: '14px 0 16px' }}>
      {/* 标题 */}
      <div style={{
        fontSize: 11,
        color: 'rgba(255,255,255,0.35)',
        letterSpacing: 6,
        padding: '0 20px 12px',
        fontWeight: 300,
      }}>
        未来七天
      </div>

      {/* 横排布局 */}
      <div style={{
        display: 'flex',
        padding: '0 8px',
      }}>
        {forecasts.map((day, i) => (
          <div
            key={i}
            style={{
              flex: '1 1 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              padding: '8px 2px',
            }}
          >
            {/* 星期 */}
            <div style={{
              fontSize: 12,
              color: i === 0 ? '#fff' : 'rgba(255,255,255,0.6)',
              fontWeight: i === 0 ? 400 : 300,
            }}>
              {day.weekday}
            </div>

            {/* 日期 */}
            <div style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.3)',
            }}>
              {day.date}
            </div>

            {/* 天气图标 */}
            <div style={{ margin: '2px 0' }}>
              <WeatherIcon name={day.weatherIcon} size={30} />
            </div>

            {/* 天气描述 */}
            <div style={{
              fontSize: 9,
              color: 'rgba(255,255,255,0.45)',
              textAlign: 'center',
              lineHeight: 1.3,
              minHeight: 22,
              fontWeight: 300,
            }}>
              {day.weatherLabel}
            </div>

            {/* 高温 */}
            <div style={{
              fontSize: 14,
              color: '#fff',
              fontWeight: 300,
              marginTop: 2,
            }}>
              {day.tempMax}°
            </div>

            {/* 低温 */}
            <div style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.35)',
              fontWeight: 300,
            }}>
              {day.tempMin}°
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DailyForecast
