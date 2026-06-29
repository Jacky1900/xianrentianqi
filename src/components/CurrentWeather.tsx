import React from 'react'
import type { CurrentWeather as CurrentWeatherType } from '../hooks/useWeather'
import WeatherIcon from './WeatherIcon'

interface Props {
  data: CurrentWeatherType
  city: string
}

const CurrentWeather: React.FC<Props> = ({ data, city }) => {
  return (
    <div style={{ padding: '20px 20px 16px', textAlign: 'center' }}>
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
      <div style={{ marginBottom: 24 }}>
        <span className="nokia-temp-large">{data.temperature}</span>
        <span className="nokia-temp-degree">°</span>
      </div>

      {/* 详细信息 - 横排 + 分隔线 */}
      <div style={{
        display: 'flex',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingTop: 14,
      }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div className="nokia-label-small" style={{ marginBottom: 4 }}>体感</div>
          <div className="nokia-value-small">{data.apparentTemperature}°</div>
        </div>
        <div className="nokia-divider" />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div className="nokia-label-small" style={{ marginBottom: 4 }}>湿度</div>
          <div className="nokia-value-small">{data.humidity}%</div>
        </div>
        <div className="nokia-divider" />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div className="nokia-label-small" style={{ marginBottom: 4 }}>风速</div>
          <div className="nokia-value-small">{data.windSpeed}</div>
        </div>
      </div>
    </div>
  )
}

export default CurrentWeather
