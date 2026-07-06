import React, { useState } from 'react'
import { useTimetable } from '../hooks/useTimetable'
import ColoredSelect from './ColoredSelect'

interface Props {
  onBack: () => void
}

const weekLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

const TimetableView: React.FC<Props> = ({ onBack }) => {
  const today = new Date()
  const todayWeekday = today.getDay() === 0 ? 7 : today.getDay()
  const [weekday, setWeekday] = useState(todayWeekday)
  const [period, setPeriod] = useState<number | ''>('')
  const [className, setClassName] = useState('')
  const [courseName, setCourseName] = useState('')
  const [formError, setFormError] = useState('')

  const { getSlotsByWeekday, addSlot, deleteSlot } = useTimetable()
  const daySlots = getSlotsByWeekday(weekday)

  const handleAdd = () => {
    setFormError('')
    if (period === '') { setFormError('请选择节次'); return }
    if (!courseName.trim()) { setFormError('请填写课程名称'); return }
    addSlot({
      weekday,
      period: period as number,
      className: className.trim() || '未填写',
      courseName: courseName.trim(),
    })
    setPeriod('')
    setClassName('')
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
              onClick={() => setWeekday(wd)}
              style={{
                flex: 1,
                padding: '5px 0',
                fontSize: 11,
                borderRadius: 4,
                cursor: 'pointer',
                border: active ? '1px solid #66BB6A' : isToday ? '1px solid rgba(102,187,106,0.4)' : '1px solid rgba(255,255,255,0.08)',
                background: active ? 'rgba(102,187,106,0.2)' : 'transparent',
                color: active ? '#66BB6A' : isToday ? 'rgba(102,187,106,0.8)' : 'rgba(255,255,255,0.45)',
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
              background: 'rgba(102,187,106,0.06)',
              borderRadius: 6,
              borderLeft: '2px solid #66BB6A',
            }}>
              <span style={{ fontSize: 11, color: '#66BB6A', minWidth: 42 }}>第{s.period}节</span>
              <span style={{ flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
                {s.courseName}<span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>· {s.className}</span>
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
          <div style={{ fontSize: 12, color: '#66BB6A', letterSpacing: 1 }}>添加课程 · {weekLabels[weekday - 1]}</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <ColoredSelect theme="green" value={period} onChange={(v) => setPeriod(v)} placeholder="节次" options={Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `第${i + 1}节` }))} />
            <input type="text" value={className} onChange={(e) => setClassName(e.target.value)} placeholder="班级" style={{ flex: 1, background: 'rgba(102,187,106,0.1)', border: '1px solid rgba(102,187,106,0.3)', borderRadius: 4, padding: '4px 6px', color: '#fff', fontSize: 12, outline: 'none' }} />
          </div>
          <input type="text" value={courseName} onChange={(e) => setCourseName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdd()} placeholder="课程名称" style={{ background: 'rgba(102,187,106,0.1)', border: '1px solid rgba(102,187,106,0.3)', borderRadius: 4, padding: '4px 6px', color: '#fff', fontSize: 12, outline: 'none' }} />
          {formError && <div style={{ fontSize: 11, color: '#FF5252', textAlign: 'center' }}>{formError}</div>}
          <button onClick={handleAdd} style={{ fontSize: 11, color: '#fff', background: 'rgba(102,187,106,0.3)', border: 'none', borderRadius: 4, padding: '4px', cursor: 'pointer' }}>
            添加
          </button>
        </div>
      </div>
    </div>
  )
}

export default TimetableView
