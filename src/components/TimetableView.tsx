import React, { useState } from 'react'
import { useTimetable, formatPeriodLabel, formatPeriodTime, periodOrder, loadPeriodTimes, TIME_EDIT_PERIODS, PeriodTime } from '../hooks/useTimetable'
import ColoredSelect from './ColoredSelect'
import TimetableGrid from './TimetableGrid'

interface Props {
  onBack: () => void
}

const weekLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

const TimetableView: React.FC<Props> = ({ onBack }) => {
  const today = new Date()
  const todayWeekday = today.getDay() === 0 ? 7 : today.getDay()
  const [weekday, setWeekday] = useState(todayWeekday)
  const [period, setPeriod] = useState<number | ''>('')
  const [periodCount, setPeriodCount] = useState<number>(1)
  const [className, setClassName] = useState('')
  const [room, setRoom] = useState('')
  const [courseName, setCourseName] = useState('')
  const [formError, setFormError] = useState('')
  const [periodTimes, setPeriodTimes] = useState<Record<number, PeriodTime>>(() => loadPeriodTimes())
  const [showTimeSettings, setShowTimeSettings] = useState(false)

  const updatePeriodTime = (p: number, field: 'start' | 'end', val: string) => {
    setPeriodTimes((prev) => {
      const next: Record<number, PeriodTime> = {
        ...prev,
        [p]: { start: prev[p]?.start ?? '', end: prev[p]?.end ?? '', [field]: val },
      }
      try { localStorage.setItem('xianren-period-times', JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }
  const [mode, setMode] = useState<'edit' | 'overview'>(() => {
    // 已有课程则直接进总览，否则进录入页
    try {
      const raw = localStorage.getItem('xianren-timetable')
      const arr = raw ? JSON.parse(raw) : []
      return Array.isArray(arr) && arr.length > 0 ? 'overview' : 'edit'
    } catch {
      return 'edit'
    }
  })

  const { slots, getSlotsByWeekday, addSlotsBatch, deleteSlot, clearAllSlots } = useTimetable()
  const daySlots = getSlotsByWeekday(weekday)

  // 总览模式：直接渲染整周网格
  if (mode === 'overview') {
    return <TimetableGrid slots={slots} periodTimes={periodTimes} onBack={() => setMode('edit')} />
  }

  const handleAdd = () => {
    setFormError('')
    if (period === '') { setFormError('请选择起始节次'); return }
    if (!courseName.trim()) { setFormError('请填写课程名称'); return }
    const start = period as number
    const slots = Array.from({ length: periodCount }, (_, i) => ({
      weekday,
      // 早自习(负值)向下递减：早自习1=-1, 早自习2=-2…；其余向上递增
      period: start < 0 ? start - i : start + i,
      className: className.trim() || '未填写',
      courseName: courseName.trim(),
      room: room.trim() || '未填写',
    }))
    // 检查是否有冲突
    const existing = getSlotsByWeekday(weekday)
    const conflict = slots.some((s) => existing.some((e) => e.period === s.period))
    if (conflict) { setFormError('部分节次已有课程，请先删除后再添加'); return }
    addSlotsBatch(slots)
    setPeriod('')
    setPeriodCount(1)
    setClassName('')
    setRoom('')
    setCourseName('')
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
        <button className="nokia-titlebar-btn" onClick={onBack} title="返回" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, marginLeft: 4 }}>课程表</span>
        <span style={{ flex: 1 }} />
        <button className="nokia-titlebar-btn" onClick={() => { if (window.confirm('确定清除所有课程数据吗？\n（节次时间设置将保留）')) clearAllSlots() }} title="清除所有课程数据" style={{ fontSize: 14, letterSpacing: 2, width: 'auto', padding: '0 4px', whiteSpace: 'nowrap', color: '#FF5252', marginRight: 10 }}>
          清除数据
        </button>
        <button className="nokia-titlebar-btn" onClick={() => setMode('overview')} title="查看完整课表" style={{ fontSize: 14, letterSpacing: 2, width: 'auto', padding: '0 4px', whiteSpace: 'nowrap' }}>
          总览
        </button>
      </div>

      {/* 星期切换 */}
      <div style={{ display: 'flex', padding: '8px 8px 4px', gap: 3 }}>
        {weekLabels.map((label, i) => {
          const wd = i + 1
          const active = wd === weekday
          const isToday = wd === todayWeekday
          return (
            <button
              key={wd}
              onClick={() => {
                setWeekday(wd)
                setPeriod('')
                setPeriodCount(1)
                setClassName('')
                setRoom('')
                setCourseName('')
                setFormError('')
              }}
              style={{
                flex: 1,
                padding: '5px 0',
                fontSize: 11,
                borderRadius: 4,
                cursor: 'pointer',
                border: active ? '1px solid #4FC3F7' : isToday ? '1px solid rgba(79,195,247,0.4)' : '1px solid rgba(255,255,255,0.08)',
                background: active ? 'rgba(79,195,247,0.2)' : 'transparent',
                color: active ? '#4FC3F7' : isToday ? 'rgba(79,195,247,0.8)' : 'rgba(255,255,255,0.45)',
                fontWeight: active ? 400 : 300,
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* 内容 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 12px 12px' }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, marginBottom: 6 }}>
          {weekLabels[weekday - 1]}课程
        </div>

        {daySlots.length === 0 ? (
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: '12px 0' }}>
            暂无课程
          </div>
        ) : (
          daySlots.map((s) => (
            <div key={s.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 8px',
              marginBottom: 4,
              background: 'rgba(79,195,247,0.06)',
              borderRadius: 6,
              borderLeft: '2px solid #4FC3F7',
            }}>
              <span style={{ fontSize: 11, color: '#4FC3F7', minWidth: 42 }}>{formatPeriodLabel(s.period)}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', minWidth: 74 }}>{formatPeriodTime(periodTimes[s.period])}</span>
              <span style={{ flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
                {s.courseName}<span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>· {s.className}{s.room && s.room !== '未填写' ? ` · ${s.room}` : ''}</span>
              </span>
              <button
                onClick={() => deleteSlot(s.id)}
                style={{ background: 'transparent', border: 'none', color: 'rgba(255,100,100,0.5)', cursor: 'pointer', fontSize: 11 }}
                title="删除"
              >✕</button>
            </div>
          ))
        )}

        {/* 添加表单 */}
        <div style={{
          marginTop: 12,
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 8,
          padding: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          <div style={{ fontSize: 12, color: '#4FC3F7', letterSpacing: 1 }}>添加课程 · {weekLabels[weekday - 1]}</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <ColoredSelect theme="blue" value={period} onChange={(v) => setPeriod(v)} placeholder="起始节次" style={{ flex: 0.5, minWidth: 0 }} options={[
              { value: -1, label: '早自习' },
              ...Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `第${i + 1}节` })),
              { value: 13, label: '晚自习' },
            ]} />
            <ColoredSelect theme="blue" value={periodCount} onChange={(v) => setPeriodCount(v)} placeholder="连续节数" style={{ flex: 0.5, minWidth: 0 }} options={[
              { value: 1, label: '不连上' },
              ...Array.from({ length: 7 }, (_, i) => ({ value: i + 2, label: `${i + 2}节连上` })),
            ]} />
            <input type="text" value={className} onChange={(e) => setClassName(e.target.value)} placeholder="班级" style={{ flex: 1, minWidth: 0, background: 'rgba(79,195,247,0.1)', border: '1px solid rgba(79,195,247,0.3)', borderRadius: 4, padding: '4px 6px', color: '#fff', fontSize: 12, outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="教室" style={{ flex: 1, background: 'rgba(79,195,247,0.1)', border: '1px solid rgba(79,195,247,0.3)', borderRadius: 4, padding: '4px 6px', color: '#fff', fontSize: 12, outline: 'none' }} />
            <input type="text" value={courseName} onChange={(e) => setCourseName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdd()} placeholder="课程名称" style={{ flex: 1, background: 'rgba(79,195,247,0.1)', border: '1px solid rgba(79,195,247,0.3)', borderRadius: 4, padding: '4px 6px', color: '#fff', fontSize: 12, outline: 'none' }} />
          </div>
          {formError && <div style={{ fontSize: 11, color: '#FF5252', textAlign: 'center' }}>{formError}</div>}
          <button onClick={handleAdd} style={{ fontSize: 11, color: '#fff', background: 'rgba(79,195,247,0.3)', border: 'none', borderRadius: 4, padding: '4px', cursor: 'pointer' }}>
            添加
          </button>
        </div>

        {/* 节次时间设置（可折叠，置于页面下半部分，由用户自行填写） */}
        <button
          onClick={() => setShowTimeSettings((v) => !v)}
          style={{ width: '100%', textAlign: 'left', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(79,195,247,0.25)', borderRadius: 6, padding: '5px 8px', color: '#4FC3F7', fontSize: 12, cursor: 'pointer', letterSpacing: 1, marginBottom: 6, marginTop: 12 }}
        >
          节次时间设置 {showTimeSettings ? '▴' : '▾'}
        </button>
        {showTimeSettings && (
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 8, marginBottom: 8, maxHeight: 260, overflowY: 'auto' }}>
            {TIME_EDIT_PERIODS.map((p) => {
              const t = periodTimes[p] ?? { start: '', end: '' }
              return (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', minWidth: 64 }}>{formatPeriodLabel(p)}</span>
                  <input
                    type="text"
                    value={t.start}
                    onChange={(e) => updatePeriodTime(p, 'start', e.target.value)}
                    placeholder="起始(如8:30)"
                    style={{ flex: 1, minWidth: 0, background: 'rgba(79,195,247,0.1)', border: '1px solid rgba(79,195,247,0.3)', borderRadius: 4, padding: '3px 6px', color: '#fff', fontSize: 12, outline: 'none' }}
                  />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>–</span>
                  <input
                    type="text"
                    value={t.end}
                    onChange={(e) => updatePeriodTime(p, 'end', e.target.value)}
                    placeholder="结束(如9:10)"
                    style={{ flex: 1, minWidth: 0, background: 'rgba(79,195,247,0.1)', border: '1px solid rgba(79,195,247,0.3)', borderRadius: 4, padding: '3px 6px', color: '#fff', fontSize: 12, outline: 'none' }}
                  />
                </div>
              )
            })}
            <button
              onClick={() => setShowTimeSettings(false)}
              style={{ width: '100%', fontSize: 12, color: '#4FC3F7', background: 'rgba(79,195,247,0.2)', border: '1px solid rgba(79,195,247,0.4)', borderRadius: 4, padding: '5px', cursor: 'pointer', letterSpacing: 2, marginTop: 4 }}
            >
              确定
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TimetableView
