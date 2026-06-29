import React from 'react'
import type { CurrentWeather as CurrentWeatherType } from '../hooks/useWeather'
import WeatherIcon from './WeatherIcon'

interface Props {
  data: CurrentWeatherType
  city: string
}

const CurrentWeather: React.FC<Props> = ({ data, city }) => {
  return (
    <div style={{ padding: '20px 16px 16px' }}>
      {/* 玻璃拟态卡片 */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        borderRadius: 16,
        padding: '24px 20px 20px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* 城市名 */}
        <div style={{
          fontSize: 13,
          letterSpacing: 6,
          color: 'rgba(255,255,255,0.5)',
          marginBottom: 14,
          fontWeight: 300,
        }}>
          {city}
        </div>

        {/* 天气图标 */}
        <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
          <WeatherIcon name={data.weatherIcon} size={72} />
        </div>

        {/* 天气描述 */}
        <div style={{
          fontSize: 14,
          color: 'rgba(255,255,255,0.7)',
          marginBottom: 14,
          letterSpacing: 4,
          fontWeight: 300,
        }}>
          {data.weatherLabel}
        </div>

        {/* 超大温度 */}
        <div style={{ marginBottom: 22 }}>
          <span style={{
            fontSize: 96,
            fontWeight: 200,
            lineHeight: 1,
            fontFamily: '"Noto Sans SC", "Segoe UI Light", sans-serif',
            color: '#fff',
            letterSpacing: -3,
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>{data.temperature}</span>
          <span style={{
            fontSize: 32,
            fontWeight: 200,
            color: 'rgba(255,255,255,0.5)',
            verticalAlign: 'super',
          }}>°</span>
        </div>

        {/* 详细信息 - 横排 + 分隔线 */}
        <div style={{
          display: 'flex',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: 14,
        }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4, letterSpacing: 2 }}>体感</div>
            <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', fontWeight: 300 }}>
              {data.apparentTemperature}°
            </div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4, letterSpacing: 2 }}>湿度</div>
            <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', fontWeight: 300 }}>
              {data.humidity}%
            </div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4, letterSpacing: 2 }}>风速</div>
            <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', fontWeight: 300 }}>
              {data.windSpeed}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CurrentWeather
