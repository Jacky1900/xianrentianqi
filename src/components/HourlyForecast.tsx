import React from 'react'
import type { HourlyForecast as HourlyForecastType } from '../hooks/useWeather'
import WeatherIcon from './WeatherIcon'

interface Props {
  forecasts: HourlyForecastType[]
}

const HourlyForecast: React.FC<Props> = ({ forecasts }) => {
  return (
    <div style={{ padding: '0 16px 4px' }}>
      {/* 标题 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 4px 10px',
      }}>
        <span style={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: 6,
          fontWeight: 300,
        }}>
          逐时预报
        </span>
        <span style={{
          fontSize: 9,
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: 1,
        }}>
          未来12小时
        </span>
      </div>

      {/* 玻璃拟态卡片 */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        borderRadius: 16,
        padding: '12px 4px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          display: 'flex',
          overflowX: 'auto',
        }}>
          {forecasts.map((hour, i) => (
            <div
              key={i}
              style={{
                flex: '1 0 auto',
                width: 52,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '4px 2px',
              }}
            >
              {/* 时间 */}
              <div style={{
                fontSize: 11,
                color: i === 0 ? 'rgba(79,195,247,0.9)' : 'rgba(255,255,255,0.5)',
                fontWeight: 300,
              }}>
                {i === 0 ? '现在' : hour.time}
              </div>

              {/* 天气图标 */}
              <div style={{ margin: '2px 0' }}>
                <WeatherIcon name={hour.weatherIcon} size={28} />
              </div>

              {/* 温度 */}
              <div style={{
                fontSize: 13,
                color: '#fff',
                fontWeight: 300,
              }}>
                {hour.tempAvg}°
              </div>

              {/* 体感 */}
              <div style={{
                fontSize: 9,
                color: 'rgba(255,255,255,0.3)',
              }}>
                {hour.apparentTemp}°
              </div>

              {/* 风速 */}
              <div style={{
                fontSize: 9,
                color: 'rgba(255,255,255,0.25)',
              }}>
                {hour.windSpeed}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HourlyForecast
