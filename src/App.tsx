import React, { useState, useEffect, useCallback, useRef } from 'react'
import TitleBar from './components/TitleBar'
import CurrentWeather from './components/CurrentWeather'
import HourlyForecast from './components/HourlyForecast'
import DailyForecast from './components/DailyForecast'
import CalendarView from './components/CalendarView'
import TimetableView from './components/TimetableView'
import WeatherIcon from './components/WeatherIcon'
import { useWeather } from './hooks/useWeather'
import { useSchedules, Urgency } from './hooks/useSchedules'
import { useWindowDrag } from './hooks/useWindowDrag'

const URGENCY_COLORS: Record<Urgency, string> = {
  urgent: 'rgba(255, 82, 82, 0.6)',
  important: 'rgba(255, 213, 79, 0.5)',
  normal: 'rgba(102, 187, 106, 0.4)',
}

function getTodayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getNowTimeStr(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 预警级别颜色：红 > 橙 > 黄 > 蓝
function getAlertColor(level: string): string {
  const l = level || ''
  if (l.includes('红')) return '#FF5252'
  if (l.includes('橙')) return '#FFB74D'
  if (l.includes('黄')) return '#FFD54F'
  if (l.includes('蓝')) return '#4FC3F7'
  return 'rgba(255,255,255,0.7)'
}

const ACK_STORAGE_KEY = 'xianren-ack-ids'

const App: React.FC = () => {
  const weather = useWeather()
  const { getTopUrgencyByDate, getDueSchedules } = useSchedules()
  const [expanded, setExpanded] = useState(false)
  const [viewMode, setViewMode] = useState<'weather' | 'calendar' | 'timetable'>('weather')
  const [refreshing, setRefreshing] = useState(false)
  const [showCityDialog, setShowCityDialog] = useState(false)
  const [cityInput, setCityInput] = useState('')
  const [isFlashing, setIsFlashing] = useState(false)
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(() => {
    try { const raw = localStorage.getItem(ACK_STORAGE_KEY); if (raw) return new Set(JSON.parse(raw)) } catch {}
    return new Set()
  })
  useEffect(() => {
    localStorage.setItem(ACK_STORAGE_KEY, JSON.stringify([...acknowledgedIds]))
  }, [acknowledgedIds])
  const alertRef = useRef<HTMLDivElement>(null)
  const [alertScrolling, setAlertScrolling] = useState(false)

  // JS 实现窗口拖动，替代 -webkit-app-region: drag，避免透明窗口输入框点击延迟
  useWindowDrag()

  const handleRefresh = () => {
    setRefreshing(true)
    weather.refresh()
    setTimeout(() => setRefreshing(false), 600)
  }

  const handleChangeCity = () => {
    setCityInput('')
    setShowCityDialog(true)
  }

  const handleConfirmCity = () => {
    if (cityInput.trim()) {
      weather.changeCity(cityInput.trim())
    }
    setShowCityDialog(false)
  }

  const handleCancelCity = () => {
    setShowCityDialog(false)
  }

  const handleMinimize = () => {
    window.electronAPI?.minimize()
  }

  const handleClose = () => {
    window.electronAPI?.close()
  }

  const handleCollapse = () => {
    setExpanded(false)
    // 收起：窗口恢复到小图标原来的位置
    window.electronAPI?.restoreIcon()
  }

  const handleExpand = () => {
    setExpanded(true)
    setViewMode('weather')
    // 展开：窗口恢复到完整大小
    window.electronAPI?.expand()
  }

  const handleOpenCalendar = () => {
    // 点击闪烁图标时，把当前到时间的日程标记为已确认
    const today = getTodayStr()
    const now = getNowTimeStr()
    const due = getDueSchedules(today, now)
    if (due.length > 0) {
      setAcknowledgedIds((prev) => {
        const next = new Set(prev)
        due.forEach((s) => next.add(s.id))
        return next
      })
    }
    setIsFlashing(false)
    setExpanded(true)
    setViewMode('calendar')
    window.electronAPI?.expand()
  }

  // 每30秒检测是否有新的已到时间日程，触发闪烁
  useEffect(() => {
    const checkDue = () => {
      const today = getTodayStr()
      const now = getNowTimeStr()
      const due = getDueSchedules(today, now)
      // 只有存在未确认的到期日程才闪烁
      const hasNew = due.some((s) => !acknowledgedIds.has(s.id))
      if (hasNew) {
        setIsFlashing(true)
      }
    }
    checkDue()
    const timer = setInterval(checkDue, 10000)
    return () => clearInterval(timer)
  }, [getDueSchedules, acknowledgedIds])

  // 预警文字过长时启用左右滚动
  useEffect(() => {
    const el = alertRef.current
    if (!el || !weather.alerts || weather.alerts.length === 0) {
      setAlertScrolling(false)
      return
    }
    const text = `⚠ ${weather.alerts[0].title}`
    const cs = getComputedStyle(el)
    const measure = document.createElement('span')
    measure.style.visibility = 'hidden'
    measure.style.whiteSpace = 'nowrap'
    measure.style.font = cs.font
    measure.textContent = text
    el.appendChild(measure)
    const textWidth = measure.offsetWidth
    el.removeChild(measure)
    setAlertScrolling(textWidth > el.clientWidth)
  }, [weather.alerts])

  const handleBackToWeather = () => {
    setViewMode('weather')
  }

  const handleBackFromCalendar = () => {
    setExpanded(false)
    setViewMode('weather')
    window.electronAPI?.restoreIcon()
  }

  const handleOpenTimetable = () => {
    setExpanded(true)
    setViewMode('timetable')
    window.electronAPI?.expand()
  }

  const handleBackFromTimetable = () => {
    setExpanded(false)
    setViewMode('weather')
    window.electronAPI?.restoreIcon()
  }

  // ===== 收起状态：闪烁入口计算 =====
  const flashToday = getTodayStr()
  const flashNow = getNowTimeStr()
  const dueSchedules = getDueSchedules(flashToday, flashNow)
  // 超过60分钟的到期日程不再闪烁
  const flashNowMin = parseInt(flashNow.split(':')[0]) * 60 + parseInt(flashNow.split(':')[1])
  const isRecentlyDue = (s: { time: string }) => {
    const [sh, sm] = s.time.split(':').map(Number)
    return flashNowMin - (sh * 60 + sm) <= 60
  }
  const unacknowledgedDue = dueSchedules.filter((s) => !acknowledgedIds.has(s.id) && isRecentlyDue(s))
  const topUnack = unacknowledgedDue.sort((a, b) => {
    const order = { urgent: 0, important: 1, normal: 2 } as Record<Urgency, number>
    return order[a.urgency] - order[b.urgency]
  })[0]
  const urgencyBg = topUnack ? URGENCY_COLORS[topUnack.urgency] : 'transparent'
  const hasUnacknowledged = unacknowledgedDue.length > 0
  const shouldFlash = isFlashing && hasUnacknowledged
  const flashIsSwap = shouldFlash && topUnack?.type === 'swap'
  const flashText = shouldFlash && topUnack ? (flashIsSwap ? '调课' : topUnack.title) : ''

  const flashRef = useRef<HTMLDivElement>(null)
  const [flashScrolling, setFlashScrolling] = useState(false)
  useEffect(() => {
    if (shouldFlash && !flashIsSwap && flashText) {
      const el = flashRef.current
      if (!el) { setFlashScrolling(false); return }
      const measure = document.createElement('span')
      measure.style.visibility = 'hidden'
      measure.style.whiteSpace = 'nowrap'
      measure.style.font = getComputedStyle(el).font
      measure.textContent = flashText
      el.appendChild(measure)
      const w = measure.offsetWidth
      el.removeChild(measure)
      setFlashScrolling(w > el.clientWidth - 8)
    } else {
      setFlashScrolling(false)
    }
  }, [shouldFlash, flashIsSwap, flashText])

  const vEntryStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.1 }
  const entryBtnStyle: React.CSSProperties = {
    WebkitAppRegion: 'no-drag',
    display: 'flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: 4,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontFamily: '"Noto Sans SC", "Segoe UI", sans-serif',
    fontWeight: 300,
    letterSpacing: 1,
    cursor: 'pointer',
  }

  // 加载中
  if (weather.loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
      }}>
        <div style={{ textAlign: 'center', opacity: 0.4 }}>
          <WeatherIcon name="partly-cloudy" size={48} />
        </div>
      </div>
    )
  }

  // === 收起状态：小图标 + 日历入口 ===
  if (!expanded && weather.current) {
    return (
      <div
        className="weather-widget-drag"
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        {/* 整体外壳 - 上下都是圆角 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            width: 100,
            borderRadius: 16,
            background: 'rgba(13, 27, 42, 0.1)',
            overflow: 'hidden',
          }}
        >
          {/* 天气内容 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              padding: '10px 14px 8px',
            }}
          >
          {/* 小图标顶部按钮栏 - 透明背景 */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 4,
            width: '100%',
            marginBottom: 2,
          }}>
            {/* 展开按钮 */}
            <button
              className="mini-icon-btn"
              onClick={handleExpand}
              title="展开详情"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            </button>
            {/* 刷新按钮 */}
            <button
              className="mini-icon-btn"
              onClick={handleRefresh}
              title="刷新"
            >
              <svg className={refreshing ? 'spin-refresh' : ''} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </button>
            {/* 最小化按钮 */}
            <button
              className="mini-icon-btn"
              onClick={handleMinimize}
              title="最小化"
            >
              &#x2500;
            </button>
            {/* 关闭按钮 */}
            <button
              className="mini-icon-btn close"
              onClick={handleClose}
              title="关闭"
            >
              &#x2715;
            </button>
          </div>
          <WeatherIcon name={weather.current.weatherIcon} size={44} />
          {weather.alerts && weather.alerts.length > 0 ? (
            <>
              {/* 有预警：晴 + 温度 合并一行，晴在前 */}
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'center',
                gap: 3,
                fontFamily: '"Noto Sans SC", "Segoe UI Light", sans-serif',
                lineHeight: 1,
              }}>
                <span style={{
                  fontSize: 12,
                  fontWeight: 300,
                  color: 'rgba(255,255,255,0.85)',
                  letterSpacing: 1,
                }}>
                  {weather.current.weatherLabel}
                </span>
                <span style={{
                  fontSize: 12,
                  fontWeight: 200,
                  color: '#fff',
                }}>
                  {weather.current.temperature}°
                </span>
              </div>
              {/* 预警行：过长左右滚动 */}
              {(() => {
                const alert = weather.alerts[0]
                const color = getAlertColor(alert.level)
                const content = `⚠ ${alert.title}`
                return (
                  <div
                    ref={alertRef}
                    style={{
                      fontSize: 11,
                      color,
                      letterSpacing: 1,
                      marginTop: 3,
                      width: '100%',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textAlign: alertScrolling ? 'left' : 'center',
                      fontWeight: 300,
                    }}
                    title={alert.text}
                  >
                    {alertScrolling ? (
                      <span className="alert-marquee-track">
                        <span>{content}</span>
                        <span style={{ paddingLeft: 32 }}>{content}</span>
                      </span>
                    ) : (
                      <span style={{ display: 'inline-block' }}>{content}</span>
                    )}
                  </div>
                )
              })()}
            </>
          ) : (
            <>
              {/* 无预警：恢复最初 各占一排（温度上、天气描述下） */}
              <div style={{
                fontSize: 18,
                fontWeight: 200,
                color: '#fff',
                fontFamily: '"Noto Sans SC", "Segoe UI Light", sans-serif',
                lineHeight: 1,
              }}>
                {weather.current.temperature}°
              </div>
              <div style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.55)',
                letterSpacing: 2,
              }}>
                {weather.current.weatherLabel}
              </div>
            </>
          )}
        </div>
          {/* 日历 / 调课 / 课表 入口 - 不闪时三块竖排；闪烁时整排横向显示内容，点击进日历 */}
          {shouldFlash ? (
            <div
              ref={flashRef}
              onClick={handleOpenCalendar}
              className="urgency-flash"
              data-no-drag
              style={{
                WebkitAppRegion: 'no-drag',
                display: 'flex',
                alignItems: 'center',
                justifyContent: flashIsSwap || !flashScrolling ? 'center' : 'flex-start',
                padding: '6px 14px',
                color: '#fff',
                fontSize: 12,
                fontFamily: '"Noto Sans SC", "Segoe UI", sans-serif',
                fontWeight: 400,
                letterSpacing: 1,
                cursor: 'pointer',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                background: urgencyBg,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              {flashIsSwap ? (
                <span>调课</span>
              ) : flashScrolling ? (
                <span className="alert-marquee-track">
                  <span>{flashText}</span>
                  <span style={{ paddingLeft: 32 }}>{flashText}</span>
                </span>
              ) : (
                <span>{flashText}</span>
              )}
            </div>
          ) : (
            <div
              data-no-drag
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
              }}>
              <div onClick={handleOpenCalendar} style={entryBtnStyle}>
                <div style={vEntryStyle}>
                  {'日历'.split('').map((ch, i) => <span key={i}>{ch}</span>)}
                </div>
              </div>
              <div onClick={handleOpenCalendar} style={entryBtnStyle}>
                <div style={vEntryStyle}>
                  {'调课'.split('').map((ch, i) => <span key={i}>{ch}</span>)}
                </div>
              </div>
              <div onClick={handleOpenTimetable} style={entryBtnStyle}>
                <div style={vEntryStyle}>
                  {'课表'.split('').map((ch, i) => <span key={i}>{ch}</span>)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // === 展开状态：日历视图 ===
  if (expanded && viewMode === 'calendar') {
    return <CalendarView onBack={handleBackFromCalendar} />
  }

  if (expanded && viewMode === 'timetable') {
    return <TimetableView onBack={handleBackFromTimetable} />
  }

  // === 展开状态：天气完整界面 ===
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 14,
        background: 'linear-gradient(180deg, #0D1B2A 0%, #1B263B 50%, #243447 100%)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        animation: 'expandIn 0.3s ease',
        position: 'relative',
        WebkitAppRegion: 'no-drag',
      }}
    >
      <TitleBar
        onMinimize={handleMinimize}
        onClose={handleClose}
        onCollapse={handleCollapse}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <div style={{
        flex: 1,
        overflowY: 'auto',
        paddingBottom: 12,
      }}>
        {weather.current && (
          <CurrentWeather data={weather.current} city={weather.city} alerts={weather.alerts} onChangeCity={handleChangeCity} />
        )}
        {weather.hourly.length > 0 && (
          <HourlyForecast forecasts={weather.hourly} />
        )}
        {weather.daily.length > 0 && (
          <DailyForecast forecasts={weather.daily} />
        )}
      </div>

      {/* 右下角标识 */}
      <div style={{
        textAlign: 'right',
        padding: '0 12px 4px',
        fontSize: 11,
        opacity: 0.2,
        letterSpacing: 1,
      }}>
        闲人天气
      </div>

      {/* 城市更改弹窗 */}
      {showCityDialog && (
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            WebkitAppRegion: 'no-drag',
          }}
          onClick={handleCancelCity}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #1B263B 0%, #243447 100%)',
              borderRadius: 14,
              padding: '20px 24px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.1)',
              width: 260,
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: 14,
              fontWeight: 300,
              letterSpacing: 2,
            }}>
              输入城市名称
            </div>
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="如：重庆长寿、北京海淀"
              autoFocus
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(0,0,0,0.3)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 300,
                outline: 'none',
                fontFamily: '"Noto Sans SC", "Segoe UI", sans-serif',
                letterSpacing: 1,
                boxSizing: 'border-box',
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmCity(); if (e.key === 'Escape') handleCancelCity() }}
            />
            <div style={{
              display: 'flex',
              gap: 10,
              marginTop: 14,
              justifyContent: 'center',
            }}>
              <button
                onClick={handleCancelCity}
                style={{
                  padding: '6px 20px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: '"Noto Sans SC", "Segoe UI", sans-serif',
                  fontWeight: 300,
                }}
              >
                取消
              </button>
              <button
                onClick={handleConfirmCity}
                style={{
                  padding: '6px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'rgba(79,195,247,0.3)',
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: '"Noto Sans SC", "Segoe UI", sans-serif',
                  fontWeight: 300,
                }}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
