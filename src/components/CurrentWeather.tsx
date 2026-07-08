import React, { useRef, useState, useEffect } from 'react'
import type { CurrentWeather as CurrentWeatherType, WeatherAlert } from '../hooks/useWeather'
import WeatherIcon from './WeatherIcon'

function getAlertColor(level: string): string {
  const l = level || ''
  if (l.includes('红')) return '#FF5252'
  if (l.includes('橙')) return '#FFB74D'
  if (l.includes('黄')) return '#FFD54F'
  if (l.includes('蓝')) return '#4FC3F7'
  return 'rgba(255,255,255,0.7)'
}

interface Props {
  data: CurrentWeatherType
  city: string
  alerts: WeatherAlert[]
  onChangeCity: () => void
}

const CurrentWeather: React.FC<Props> = ({ data, city, alerts, onChangeCity }) => {
  const alertRef = useRef<HTMLDivElement>(null)
  const [alertScrolling, setAlertScrolling] = useState(false)

  useEffect(() => {
    const el = alertRef.current
    if (!el || !alerts || alerts.length === 0) { setAlertScrolling(false); return }
    const text = `⚠ ${alerts[0].title}`
    const cs = getComputedStyle(el)
    const measure = document.createElement('span')
    measure.style.visibility = 'hidden'; measure.style.whiteSpace = 'nowrap'
    measure.style.font = cs.font; measure.textContent = text
    el.appendChild(measure)
    const textWidth = measure.offsetWidth
    el.removeChild(measure)
    setAlertScrolling(textWidth > el.clientWidth)
  }, [alerts])

  return (
    <div style={{ padding: '8px 16px 6px' }}>
      {/* 玻璃拟态卡片 */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        borderRadius: 16,
        padding: '12px 20px 10px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* 城市名 + 更改 + 实时标识 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          marginBottom: 6,
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

        {/* 左侧：图标+天气描述  右侧：温度+预警 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 40px',
          gap: 24,
          marginBottom: 8,
        }}>
          {/* 左侧：天气图标 + 描述 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <WeatherIcon name={data.weatherIcon} size={56} />
            <div style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.7)',
              letterSpacing: 4,
              fontWeight: 300,
              marginTop: 2,
            }}>
              {data.weatherLabel}
            </div>
          </div>

          {/* 右侧：温度 + 预警 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
            {/* 温度 */}
            <div style={{ marginBottom: 4 }}>
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

            {/* 预警条 */}
            {alerts && alerts.length > 0 ? (
              <div
                ref={alertRef}
                style={{
                  fontSize: 11,
                  color: getAlertColor(alerts[0].level),
                  letterSpacing: 1,
                  width: '100%',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textAlign: alertScrolling ? 'left' : 'center',
                  fontWeight: 300,
                }}
                title={alerts[0].text}
              >
                {alertScrolling ? (
                  <span className="alert-marquee-track">
                    <span>{`⚠ ${alerts[0].title}`}</span>
                    <span style={{ paddingLeft: 32 }}>{`⚠ ${alerts[0].title}`}</span>
                  </span>
                ) : (
                  <span style={{ display: 'inline-block' }}>{`⚠ ${alerts[0].title}`}</span>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* 详细信息 - 横排 + 分隔线 */}
        <div style={{
          display: 'flex',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: 10,
        }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 3, letterSpacing: 2 }}>体感</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 300 }}>
              {data.apparentTemperature}°
            </div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 3, letterSpacing: 2 }}>湿度</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 300 }}>
              {data.humidity}%
            </div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 3, letterSpacing: 2 }}>风力</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 300 }}>
              {data.windSpeed}
            </div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 3, letterSpacing: 2 }}>空气</div>
            {data.aqiCategory ? (
              <div style={{ fontSize: 12, fontWeight: 300, color: (() => {
                const c = ['','#81C784','#FFD54F','#FFB74D','#FF8A65','#E57373','#BA68C8']
                return c[data.aqiLevel] || 'rgba(255,255,255,0.85)'
              })() }}>{data.aqiCategory}</div>
            ) : (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>--</div>
            )}
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 3, letterSpacing: 2 }}>紫外线</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 300 }}>
              {data.uvIndex}/11
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>
              {data.uvIndex <= 2 ? '弱' : data.uvIndex <= 5 ? '中等' : data.uvIndex <= 7 ? '强' : data.uvIndex <= 10 ? '很强' : '极强'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CurrentWeather
