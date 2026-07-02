import React, { useState } from 'react'
import { useSchedules } from '../hooks/useSchedules'

interface Props {
  onBack: () => void
}

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const CalendarView: React.FC<Props> = ({ onBack }) => {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(
    formatDate(today.getFullYear(), today.getMonth(), today.getDate())
  )
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTime, setNewTime] = useState('09:00')
  const [newTitle, setNewTitle] = useState('')

  const { getSchedulesByDate, addSchedule, toggleDone, deleteSchedule } = useSchedules()

  // 生成日历网格
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate())
  const selectedSchedules = getSchedulesByDate(selectedDate)

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1)
      setViewMonth(11)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1)
      setViewMonth(0)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const handleAdd = () => {
    if (!newTitle.trim()) return
    addSchedule(selectedDate, newTime, newTitle.trim())
    setNewTitle('')
    setShowAddForm(false)
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      borderRadius: 14,
      background: 'linear-gradient(180deg, #0D1B2A 0%, #1B263B 50%, #243447 100%)',
      boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
    }}>
      {/* 标题栏 */}
      <div className="nokia-titlebar">
        <button className="nokia-titlebar-btn" onClick={onBack} title="返回天气">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <button className="nokia-titlebar-btn" onClick={prevMonth} title="上个月">‹</button>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, minWidth: 70, textAlign: 'center' }}>
            {viewYear}年{viewMonth + 1}月
          </span>
          <button className="nokia-titlebar-btn" onClick={nextMonth} title="下个月">›</button>
        </div>
      </div>

      {/* 内容区 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px 12px' }}>
        {/* 星期标题 */}
        <div style={{ display: 'flex', marginBottom: 4 }}>
          {weekDays.map((w, i) => (
            <div key={i} style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 10,
              color: i === 0 || i === 6 ? 'rgba(255,100,100,0.5)' : 'rgba(255,255,255,0.3)',
              fontWeight: 300,
            }}>
              {w}
            </div>
          ))}
        </div>

        {/* 日期网格 */}
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {cells.map((day, i) => {
            if (day === null) return <div key={i} style={{ width: '14.28%', height: 32 }} />
            const dateStr = formatDate(viewYear, viewMonth, day)
            const isToday = dateStr === todayStr
            const isSelected = dateStr === selectedDate
            const daySchedules = getSchedulesByDate(dateStr)
            const hasSchedule = daySchedules.length > 0
            const weekday = new Date(viewYear, viewMonth, day).getDay()
            const isWeekend = weekday === 0 || weekday === 6

            return (
              <div
                key={i}
                onClick={() => setSelectedDate(dateStr)}
                style={{
                  width: '14.28%',
                  height: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  borderRadius: 6,
                  background: isSelected ? 'rgba(79,195,247,0.2)' : 'transparent',
                  border: isToday && !isSelected ? '1px solid rgba(79,195,247,0.4)' : 'none',
                }}
              >
                <span style={{
                  fontSize: 12,
                  color: isSelected ? '#4FC3F7' : isWeekend ? 'rgba(255,150,150,0.7)' : 'rgba(255,255,255,0.7)',
                  fontWeight: isToday ? 400 : 300,
                }}>
                  {day}
                </span>
                {hasSchedule && (
                  <div style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: '#FFD54F',
                    marginTop: 1,
                  }} />
                )}
              </div>
            )
          })}
        </div>

        {/* 分隔线 */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          margin: '10px 0 8px',
        }} />

        {/* 选中日期的日程 */}
        <div style={{ marginBottom: 6 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 6,
          }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 2 }}>
              {selectedDate.replace(/-/g, '/')}
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              style={{
                fontSize: 10,
                color: '#4FC3F7',
                background: 'transparent',
                border: '1px solid rgba(79,195,247,0.3)',
                borderRadius: 3,
                padding: '1px 6px',
                cursor: 'pointer',
              }}
            >
              {showAddForm ? '取消' : '+ 添加'}
            </button>
          </div>

          {/* 添加表单 */}
          {showAddForm && (
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 8,
              padding: 8,
              marginBottom: 6,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: 4,
                  padding: '4px 6px',
                  color: '#fff',
                  fontSize: 12,
                  outline: 'none',
                }}
              />
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="日程内容…"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: 4,
                  padding: '4px 6px',
                  color: '#fff',
                  fontSize: 12,
                  outline: 'none',
                }}
              />
              <button
                onClick={handleAdd}
                style={{
                  fontSize: 11,
                  color: '#fff',
                  background: 'rgba(79,195,247,0.3)',
                  border: 'none',
                  borderRadius: 4,
                  padding: '4px',
                  cursor: 'pointer',
                }}
              >
                确认添加
              </button>
            </div>
          )}

          {/* 日程列表 */}
          {selectedSchedules.length === 0 ? (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: '8px 0' }}>
              暂无日程
            </div>
          ) : (
            selectedSchedules.map((s) => (
              <div key={s.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 8px',
                marginBottom: 4,
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 6,
              }}>
                <span style={{ fontSize: 11, color: '#4FC3F7', minWidth: 36 }}>
                  {s.time}
                </span>
                <span style={{
                  flex: 1,
                  fontSize: 12,
                  color: s.done ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)',
                  textDecoration: s.done ? 'line-through' : 'none',
                }}>
                  {s.title}
                </span>
                <button
                  onClick={() => toggleDone(s.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: s.done ? '#81C784' : 'rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                  title={s.done ? '标记未完成' : '标记完成'}
                >
                  ✓
                </button>
                <button
                  onClick={() => deleteSchedule(s.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255,100,100,0.5)',
                    cursor: 'pointer',
                    fontSize: 11,
                  }}
                  title="删除"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 右下角标识 */}
      <div style={{
        textAlign: 'right',
        padding: '0 12px 4px',
        fontSize: 11,
        opacity: 0.2,
        letterSpacing: 1,
      }}>
        闲人日历
      </div>
    </div>
  )
}

export default CalendarView
