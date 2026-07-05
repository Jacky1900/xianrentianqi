import React from 'react'
import type { CurrentWeather as CurrentWeatherType } from '../hooks/useWeather'
import WeatherIcon from './WeatherIcon'

interface Props {
  data: CurrentWeatherType
  city: string
  onChangeCity: () => void
}

const CurrentWeather: React.FC<Props> = ({ data, city, onChangeCity }) => {
  return (
    <div style={{ padding: '8px 16px 6px' }}>
      {/* 玻璃拟态卡片 */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        borderRadius: 16,
        padding: '12px 20px 10px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* 城市名 + 更改 + 实时标识 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          marginBottom: 4,
        }}>
          <span style={{
            fontSize: 12,
            letterSpacing: 6,
            color: 'rgba(255,255,255,0.5)',
            fontWeight: 300,
          }}>
            {city}
          </span>
          <span
            onClick={onChangeCity}
            style={{
              fontSize: 10,
              color: 'rgba(79,195,247,0.7)',
              cursor: 'pointer',
              letterSpacing: 1,
              fontWeight: 300,
              WebkitAppRegion: 'no-drag',
            }}
          >
            更改
          </span>
          <span style={{
            fontSize: 9,
            color: 'rgba(79,195,247,0.7)',
            border: '1px solid rgba(79,195,247,0.3)',
            padding: '1px 5px',
            borderRadius: 3,
            letterSpacing: 1,
          }}>
            实时
          </span>
        </div>

        {/* 天气图标 */}
        <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'center' }}>
          <WeatherIcon name={data.weatherIcon} size={44} />
        </div>

        {/* 天气描述 */}
        <div style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.7)',
          marginBottom: 4,
          letterSpacing: 4,
          fontWeight: 300,
        }}>
          {data.weatherLabel}
        </div>

        {/* 温度 */}
        <div style={{ marginBottom: 10 }}>
          <span style={{
            fontSize: 48,
            fontWeight: 200,
            lineHeight: 1,
            fontFamily: '"Noto Sans SC", "Segoe UI Light", sans-serif',
            color: '#fff',
            letterSpacing: -2,
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>{data.temperature}</span>
          <span style={{
            fontSize: 20,
            fontWeight: 200,
            color: 'rgba(255,255,255,0.5)',
            verticalAlign: 'super',
          }}>°</span>
        </div>

        {/* 详细信息 - 横排 + 分隔线 */}
        <div style={{
          display: 'flex',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: 10,
        }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 3, letterSpacing: 2 }}>体感</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 300 }}>
              {data.apparentTemperature}°
            </div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 3, letterSpacing: 2 }}>湿度</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 300 }}>
              {data.humidity}%
            </div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 3, letterSpacing: 2 }}>风力</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 300 }}>
              {data.windSpeed}
            </div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 3, letterSpacing: 2 }}>紫外线</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 300 }}>
              {data.uvIndex}/11
            </div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>
              {data.uvIndex <= 2 ? '弱' : data.uvIndex <= 5 ? '中等' : data.uvIndex <= 7 ? '强' : data.uvIndex <= 10 ? '很强' : '极强'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CurrentWeather
