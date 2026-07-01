import React, { useRef, useState, useCallback, useEffect } from 'react'
import type { HourlyForecast as HourlyForecastType } from '../hooks/useWeather'
import WeatherIcon from './WeatherIcon'

interface Props {
  forecasts: HourlyForecastType[]
}

const HourlyForecast: React.FC<Props> = ({ forecasts }) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [scrollRatio, setScrollRatio] = useState(0) // 0~1
  const [thumbRatio, setThumbRatio] = useState(0.4) // 滑块占比
  const dragStartX = useRef(0)
  const dragStartRatio = useRef(0)

  // 更新滑块位置和大小
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    if (maxScroll <= 0) {
      setScrollRatio(0)
      setThumbRatio(1)
      return
    }
    setScrollRatio(el.scrollLeft / maxScroll)
    setThumbRatio(Math.min(1, el.clientWidth / el.scrollWidth))
  }, [])

  // 滚动时更新
  const handleScroll = () => {
    updateScrollState()
  }

  // 拖动进度条
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const el = scrollRef.current
    if (!el) return
    setIsDragging(true)
    dragStartX.current = e.clientX
    dragStartRatio.current = scrollRatio
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    const el = scrollRef.current
    const maxScroll = el.scrollWidth - el.clientWidth
    if (maxScroll <= 0) return
    // 拖动距离转为比例
    const trackWidth = el.clientWidth
    const dx = e.clientX - dragStartX.current
    const ratioDelta = dx / trackWidth
    const newRatio = Math.max(0, Math.min(1, dragStartRatio.current + ratioDelta))
    el.scrollLeft = newRatio * maxScroll
  }, [isDragging])

  useEffect(() => {
    if (!isDragging) return
    const onMove = (e: MouseEvent) => handleMouseMove(e)
    const onUp = () => setIsDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [isDragging, handleMouseMove])

  // 初始化和窗口变化时更新
  useEffect(() => {
    updateScrollState()
  }, [forecasts, updateScrollState])

  if (forecasts.length === 0) return null

  const trackWidth = scrollRef.current?.clientWidth ?? 300
  const thumbWidth = thumbRatio * 100
  const thumbLeft = scrollRatio * (1 - thumbRatio) * 100

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
          逐时预报
        </span>
        <span style={{
          fontSize: 9,
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: 1,
        }}>
          未来24小时
        </span>
      </div>

      {/* 玻璃拟态卡片 */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        borderRadius: 16,
        padding: '12px 8px 8px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* 横向列表 - 隐藏滚动条 */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            display: 'flex',
            overflowX: 'auto',
            overflowY: 'hidden',
            gap: 2,
            scrollbarWidth: 'none',
            paddingBottom: 2,
          }}
        >
          {forecasts.map((h, i) => (
            <div
              key={i}
              style={{
                flex: '0 0 auto',
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
                color: i === 0 ? '#4FC3F7' : 'rgba(255,255,255,0.55)',
                fontWeight: i === 0 ? 400 : 300,
              }}>
                {i === 0 ? '现在' : h.hour}
              </div>

              {/* 天气图标 */}
              <div style={{ height: 28, display: 'flex', alignItems: 'center' }}>
                <WeatherIcon name={h.weatherIcon} size={26} />
              </div>

              {/* 降水概率 */}
              <div style={{
                fontSize: 9,
                color: h.precipitationProb >= 50 ? '#4FC3F7' : 'rgba(255,255,255,0.25)',
                minHeight: 12,
                fontWeight: 300,
              }}>
                {h.precipitationProb > 0 ? `${h.precipitationProb}%` : ''}
              </div>

              {/* 温度 */}
              <div style={{
                fontSize: 14,
                color: '#fff',
                fontWeight: 300,
              }}>
                {h.temperature}°
              </div>
            </div>
          ))}
        </div>

        {/* 拖动进度条 */}
        <div
          onMouseDown={handleMouseDown}
          style={{
            marginTop: 8,
            height: 4,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 2,
            cursor: isDragging ? 'grabbing' : 'grab',
            position: 'relative',
            userSelect: 'none',
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: `${thumbLeft}%`,
            width: `${thumbWidth}%`,
            height: '100%',
            background: 'rgba(255,255,255,0.4)',
            borderRadius: 2,
            transition: isDragging ? 'none' : 'left 0.05s',
          }} />
        </div>
      </div>
    </div>
  )
}

export default HourlyForecast
