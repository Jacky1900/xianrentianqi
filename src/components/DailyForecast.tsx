import React from 'react'
import type { DailyForecast as DailyForecastType } from '../hooks/useWeather'
import WeatherIcon from './WeatherIcon'

interface Props {
  forecasts: DailyForecastType[]
}

const DailyForecast: React.FC<Props> = ({ forecasts }) => {
  return (
    <div style={{ padding: '16px 0 12px' }}>
      {/* 标题 */}
      <div style={{
        fontSize: 10,
        color: '#444',
        letterSpacing: 6,
        padding: '0 20px 14px',
      }}>
        未来七天
      </div>

      {/* 横排布局：每列一天，时间在上，天气在下 */}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        padding: '0 10px',
      }}>
        {forecasts.map((day, i) => (
          <div
            key={i}
            style={{
              flex: '1 0 auto',
              width: 52,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              padding: '10px 4px',
              borderRadius: 4,
            }}
          >
            {/* 第一排：星期 */}
            <div style={{
              fontSize: 12,
              color: i === 0 ? '#fff' : '#777',
              fontWeight: i === 0 ? 400 : 300,
            }}>
              {day.weekday}
            </div>

            {/* 第二排：日期 */}
            <div style={{
              fontSize: 10,
              color: '#444',
            }}>
              {day.date}
            </div>

            {/* 第三排：天气图标 */}
            <div style={{ margin: '4px 0' }}>
              <WeatherIcon name={day.weatherIcon} size={32} color={i === 0 ? '#fff' : '#999'} />
            </div>

            {/* 第四排：天气描述 */}
            <div style={{
              fontSize: 9,
              color: '#555',
              textAlign: 'center',
              lineHeight: 1.3,
              minHeight: 24,
            }}>
              {day.weatherLabel}
            </div>

            {/* 第五排：温度 */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              marginTop: 4,
            }}>
              <span style={{
                fontSize: 14,
                color: '#fff',
                fontWeight: 300,
                fontFamily: '"Segoe UI Light", sans-serif',
              }}>
                {day.tempMax}°
              </span>
              <span style={{
                fontSize: 12,
                color: '#444',
                fontWeight: 300,
                fontFamily: '"Segoe UI Light", sans-serif',
              }}>
                {day.tempMin}°
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DailyForecast
