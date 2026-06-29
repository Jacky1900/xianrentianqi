import React from 'react'
import type { CurrentWeather as CurrentWeatherType } from '../hooks/useWeather'
import WeatherIcon from './WeatherIcon'

interface Props {
  data: CurrentWeatherType
  city: string
}

const CurrentWeather: React.FC<Props> = ({ data, city }) => {
  return (
    <div style={{ padding: '24px 20px 16px', textAlign: 'center' }}>
      {/* 城市名 */}
      <div style={{
        fontSize: 12,
        letterSpacing: 8,
        color: '#666',
        marginBottom: 18,
      }}>
        {city}
      </div>

      {/* 天气图标 */}
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
        <WeatherIcon name={data.weatherIcon} size={72} />
      </div>

      {/* 天气描述 */}
      <div style={{
        fontSize: 14,
        color: '#999',
        marginBottom: 16,
        letterSpacing: 4,
      }}>
        {data.weatherLabel}
      </div>

      {/* 超大温度 */}
      <div style={{ marginBottom: 28 }}>
        <span style={{
          fontSize: 96,
          fontWeight: 200,
          lineHeight: 1,
          fontFamily: '"Segoe UI Light", "Segoe UI", sans-serif',
          color: '#fff',
          letterSpacing: -3,
        }}>{data.temperature}</span>
        <span style={{
          fontSize: 32,
          fontWeight: 200,
          color: '#555',
          verticalAlign: 'super',
          marginLeft: 2,
        }}>°</span>
      </div>

      {/* 详细信息 - 横排 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 0,
        borderTop: '1px solid #1a1a1a',
        paddingTop: 16,
      }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#555', marginBottom: 4, letterSpacing: 2 }}>体感</div>
          <div style={{ fontSize: 15, color: '#ccc', fontWeight: 300, fontFamily: '"Segoe UI Light", sans-serif' }}>
            {data.apparentTemperature}°
          </div>
        </div>
        <div style={{ width: 1, background: '#1a1a1a' }} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#555', marginBottom: 4, letterSpacing: 2 }}>湿度</div>
          <div style={{ fontSize: 15, color: '#ccc', fontWeight: 300, fontFamily: '"Segoe UI Light", sans-serif' }}>
            {data.humidity}%
          </div>
        </div>
        <div style={{ width: 1, background: '#1a1a1a' }} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#555', marginBottom: 4, letterSpacing: 2 }}>风速</div>
          <div style={{ fontSize: 15, color: '#ccc', fontWeight: 300, fontFamily: '"Segoe UI Light", sans-serif' }}>
            {data.windSpeed}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CurrentWeather
