import React from 'react'
import type { DailyForecast as DailyForecastType } from '../hooks/useWeather'
import WeatherIcon from './WeatherIcon'

interface Props {
  forecasts: DailyForecastType[]
}

const DailyForecast: React.FC<Props> = ({ forecasts }) => {
  return (
    <div style={{ padding: '2px 16px 0' }}>
      {/* 标题 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 4px 6px',
      }}>
        <span style={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: 6,
          fontWeight: 300,
        }}>
          未来七天
        </span>
        <span style={{
          fontSize: 9,
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: 1,
        }}>
          当日综合
        </span>
      </div>

      {/* 玻璃拟态卡片 */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        borderRadius: 16,
        padding: '14px 8px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* 横排布局 */}
        <div style={{ display: 'flex' }}>
          {forecasts.map((day, i) => (
            <div
              key={i}
              style={{
                flex: '1 1 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 5,
                padding: '4px 2px',
              }}
            >
              {/* 星期 */}
              <div style={{
                fontSize: 11,
                color: i === 0 ? '#fff' : 'rgba(255,255,255,0.6)',
                fontWeight: i === 0 ? 400 : 300,
              }}>
                {day.weekday}
              </div>

              {/* 日期 */}
              <div style={{
                fontSize: 9,
                color: 'rgba(255,255,255,0.3)',
              }}>
                {day.date}
              </div>

              {/* 天气图标 */}
              <div style={{ height: 26, display: 'flex', alignItems: 'center' }}>
                <WeatherIcon name={day.weatherIcon} size={24} />
              </div>

              {/* 天气描述 */}
              <div style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.6)',
                textAlign: 'center',
                lineHeight: 1.2,
                minHeight: 24,
                fontWeight: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {day.weatherLabel}
              </div>

              {/* 高温 */}
              <div style={{
                fontSize: 13,
                color: '#fff',
                fontWeight: 300,
              }}>
                {day.tempMax}°
              </div>

              {/* 低温 */}
              <div style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.35)',
                fontWeight: 300,
              }}>
                {day.tempMin}°
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DailyForecast
