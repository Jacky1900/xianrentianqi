import React, { useState, useLayoutEffect } from 'react'
import { useTimetable, formatPeriodFullLabel, formatPeriodTime, periodOrder, loadPeriodTimes, TIME_EDIT_PERIODS, TIME_SEGMENTS, PeriodTime } from '../hooks/useTimetable'
import ColoredSelect from './ColoredSelect'
import ConfirmDialog from './ConfirmDialog'
import TimetableGrid from './TimetableGrid'
import { useTheme } from '../theme'

interface Props {
  onBack: () => void
}

const weekLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

const TimetableView: React.FC<Props> = ({ onBack }) => {
  const { theme, ac } = useTheme()
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
  const [segment, setSegment] = useState('')
  // 应用内确认弹层（替代 window.confirm，避免原生模态对话框抢走透明窗口焦点）
  const [confirmState, setConfirmState] = useState<{ message: string; onOk: () => void } | null>(null)

  // 起始节次选项：未选时段时列出全部节次，选了时段则只列出该时段内的节次（早2/上6/下6/晚3）
  // 显示统一带时段前缀（上午第X节/下午第X节），下午按内部编号（下午第1节=全局第7节），底层存全局编号
  const activeSegment = TIME_SEGMENTS.find((s) => s.key === segment)
  const periodOptions = (activeSegment ? activeSegment.periods : TIME_SEGMENTS.flatMap((s) => s.periods))
    .map((p) => ({ value: p, label: formatPeriodFullLabel(p) }))

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

  const { slots, getSlotsByWeekday, addSlotsBatch, deleteSlot, clearAllSlots, clearPeriodTimes } = useTimetable()

  // 透明无边框窗口在课程/节次时间增删改后，DOM 结构剧变，Chromium 命中区域
  // （hit-test）需要重算，否则删除数据后输入框点击会延迟出现光标。
  // 用 useLayoutEffect（在浏览器 paint 之前同步执行）+ 依赖 slots/periodTimes，
  // 确保每次数据变化、DOM 提交后立即强制一次同步重排，刷新命中区域，点击即时响应。
  useLayoutEffect(() => {
    void document.body.offsetHeight
  }, [slots, periodTimes])

  const daySlots = getSlotsByWeekday(weekday)

  // 总览模式：直接渲染整周网格
  if (mode === 'overview') {
    return <TimetableGrid slots={slots} periodTimes={periodTimes} onBack={() => setMode('edit')} onHome={onBack} />
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
    setSegment('')
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
      background: theme.bg,
      boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
      WebkitAppRegion: 'no-drag',
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
        <button className="nokia-titlebar-btn" onClick={() => setConfirmState({ message: '确定删除所有课程数据吗？\n（节次时间设置将保留）', onOk: () => { clearAllSlots(); window.electronAPI?.focus() } })} title="删除所有课程数据" style={{ fontSize: 14, letterSpacing: 2, width: 'auto', padding: '0 4px', whiteSpace: 'nowrap', color: '#FF5252', marginRight: 10 }}>
          删除数据
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
                setSegment('')
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
                border: active ? `1px solid ${theme.accent}` : isToday ? `1px solid ${ac(0.4)}` : '1px solid rgba(255,255,255,0.08)',
                background: active ? ac(0.2) : 'transparent',
                color: active ? theme.accent : isToday ? ac(0.8) : 'rgba(255,255,255,0.45)',
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
              background: ac(0.06),
              borderRadius: 6,
              borderLeft: `2px solid ${theme.accent}`,
            }}>
              <span style={{ fontSize: 11, color: theme.accent, minWidth: 56 }}>{formatPeriodFullLabel(s.period)}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', minWidth: 74 }}>{formatPeriodTime(periodTimes[s.period])}</span>
              <span style={{ flex: 1, fontSize: 12, color: '#66BB6A' }}>
                {s.courseName}<span style={{ color: '#FFD54F', marginLeft: 6 }}>· {s.className}</span>{s.room && s.room !== '未填写' ? <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>· {s.room}</span> : ''}
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
          <div style={{ fontSize: 12, color: theme.accent, letterSpacing: 1 }}>添加课程 · {weekLabels[weekday - 1]}</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <ColoredSelect theme="purple" value={segment} onChange={(v) => { setSegment(v); setPeriod('') }} placeholder="时段" style={{ flex: 0.5, minWidth: 0 }} options={TIME_SEGMENTS.map((s) => ({ value: s.key, label: s.label }))} />
            <ColoredSelect theme="blue" value={period} onChange={(v) => setPeriod(v)} placeholder="起始节次" style={{ flex: 0.5, minWidth: 0 }} options={periodOptions} />
            <ColoredSelect theme="blue" value={periodCount} onChange={(v) => setPeriodCount(v)} placeholder="连续节数" style={{ flex: 0.5, minWidth: 0 }} options={[
              { value: 1, label: '不连上' },
              ...Array.from({ length: 7 }, (_, i) => ({ value: i + 2, label: `${i + 2}节连上` })),
            ]} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input type="text" value={className} onChange={(e) => setClassName(e.target.value)} placeholder="班级" style={{ flex: 1, minWidth: 0, background: 'rgba(255,213,79,0.1)', border: '1px solid rgba(255,213,79,0.4)', borderRadius: 4, padding: '4px 6px', color: '#FFD54F', fontSize: 12, outline: 'none' }} />
            <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="教室" style={{ flex: 1, minWidth: 0, background: ac(0.1), border: `1px solid ${ac(0.3)}`, borderRadius: 4, padding: '4px 6px', color: '#fff', fontSize: 12, outline: 'none' }} />
            <input type="text" value={courseName} onChange={(e) => setCourseName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdd()} placeholder="课程名称" style={{ flex: 1, minWidth: 0, background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.4)', borderRadius: 4, padding: '4px 6px', color: '#66BB6A', fontSize: 12, outline: 'none' }} />
          </div>
          {formError && <div style={{ fontSize: 11, color: '#FF5252', textAlign: 'center' }}>{formError}</div>}
          <button onClick={handleAdd} style={{ fontSize: 11, color: '#fff', background: ac(0.3), border: 'none', borderRadius: 4, padding: '4px', cursor: 'pointer' }}>
            添加
          </button>
        </div>

        {/* 节次时间设置（可折叠，置于页面下半部分，由用户自行填写） */}
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          <button
            onClick={() => setShowTimeSettings((v) => !v)}
            style={{ flex: 1, minWidth: 0, textAlign: 'left', background: 'rgba(255,255,255,0.04)', border: `1px solid ${ac(0.25)}`, borderRadius: 6, padding: '5px 8px', color: theme.accent, fontSize: 12, cursor: 'pointer', letterSpacing: 1 }}
          >
            节次时间设置 {showTimeSettings ? '▴' : '▾'}
          </button>
          <button
            onClick={() => setConfirmState({ message: '确定删除节次时间设置数据吗？\n（课程数据不受影响）', onOk: () => { setPeriodTimes(clearPeriodTimes()); window.electronAPI?.focus() } })}
            style={{ flex: '0 0 auto', fontSize: 12, color: '#FF5252', background: 'rgba(255,82,82,0.12)', border: '1px solid rgba(255,82,82,0.4)', borderRadius: 4, padding: '5px 10px', cursor: 'pointer', letterSpacing: 1, whiteSpace: 'nowrap' }}
          >
            删除数据
          </button>
        </div>
        {showTimeSettings && (
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 8, marginBottom: 8, maxHeight: 420, overflowY: 'auto' }}>
            {TIME_EDIT_PERIODS.map((p) => {
              const t = periodTimes[p] ?? { start: '', end: '' }
              return (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', minWidth: 56 }}>{formatPeriodFullLabel(p)}</span>
                  <input
                    type="text"
                    value={t.start}
                    onChange={(e) => updatePeriodTime(p, 'start', e.target.value)}
                    placeholder="起始(如8:30)"
                    style={{ flex: 1, minWidth: 0, background: ac(0.1), border: `1px solid ${ac(0.3)}`, borderRadius: 4, padding: '2px 5px', color: '#fff', fontSize: 11, outline: 'none' }}
                  />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>–</span>
                  <input
                    type="text"
                    value={t.end}
                    onChange={(e) => updatePeriodTime(p, 'end', e.target.value)}
                    placeholder="结束(如9:10)"
                    style={{ flex: 1, minWidth: 0, background: ac(0.1), border: `1px solid ${ac(0.3)}`, borderRadius: 4, padding: '2px 5px', color: '#fff', fontSize: 11, outline: 'none' }}
                  />
                </div>
              )
            })}
            <button
              onClick={() => setShowTimeSettings(false)}
              style={{ width: '100%', fontSize: 12, color: theme.accent, background: ac(0.2), border: `1px solid ${ac(0.4)}`, borderRadius: 4, padding: '5px', cursor: 'pointer', letterSpacing: 2, marginTop: 4 }}
            >
              确定
            </button>
          </div>
        )}
      </div>

      {/* 应用内确认弹层：替代 window.confirm，焦点不离开窗口 */}
      {confirmState && (
        <ConfirmDialog
          message={confirmState.message}
          onOk={() => { const onOk = confirmState.onOk; setConfirmState(null); onOk() }}
          onCancel={() => setConfirmState(null)}
        />
      )}
    </div>
  )
}

export default TimetableView
