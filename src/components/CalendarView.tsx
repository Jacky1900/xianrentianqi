import React, { useState } from 'react'
import { useSchedules, Urgency, ScheduleType } from '../hooks/useSchedules'
import { getLunarDayInfo, getCellLabel, isSpecialDay } from '../utils/lunar'
import ColoredSelect from './ColoredSelect'

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
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  // 普通日程时间 - 时/分下拉（不预填，需手动选择）
  const [newHour, setNewHour] = useState<number | ''>('')
  const [newMinute, setNewMinute] = useState<number | ''>('')
  const [newTitle, setNewTitle] = useState('')
  const [newUrgency, setNewUrgency] = useState<Urgency>('normal')
  const [newType, setNewType] = useState<ScheduleType>('normal')
  // 调课信息 - 自己的课程
  const [myDateMonth, setMyDateMonth] = useState(today.getMonth() + 1)
  const [myDateDay, setMyDateDay] = useState(today.getDate())
  const [myPeriod, setMyPeriod] = useState('')
  const [myClass, setMyClass] = useState('')
  const [myCourse, setMyCourse] = useState('')
  // 调课信息 - 对方的课程
  const [swapTeacher, setSwapTeacher] = useState('')
  const [theirDateMonth, setTheirDateMonth] = useState(today.getMonth() + 1)
  const [theirDateDay, setTheirDateDay] = useState(today.getDate())
  const [theirPeriod, setTheirPeriod] = useState('')
  const [theirClass, setTheirClass] = useState('')
  const [theirCourse, setTheirCourse] = useState('')
  // 提醒时间 - 自己（不预填，需手动选择）
  const [remindMonth, setRemindMonth] = useState<number | ''>('')
  const [remindDay, setRemindDay] = useState<number | ''>('')
  const [remindHour, setRemindHour] = useState<number | ''>('')
  const [remindMinute, setRemindMinute] = useState<number | ''>('')
  // 提醒时间 - 对方（教师）（不预填，需手动选择）
  const [theirRemindMonth, setTheirRemindMonth] = useState<number | ''>('')
  const [theirRemindDay, setTheirRemindDay] = useState<number | ''>('')
  const [theirRemindHour, setTheirRemindHour] = useState<number | ''>('')
  const [theirRemindMinute, setTheirRemindMinute] = useState<number | ''>('')
  const [formError, setFormError] = useState('')

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
    setFormError('')
    if (newType === 'normal') {
      if (!newTitle.trim()) { setFormError('请填写日程内容'); return }
    } else {
      if (!myCourse.trim()) { setFormError('请填写「我的课程」（必填）'); return }
      if (remindMonth === '' || remindDay === '' || remindHour === '' || remindMinute === '') { setFormError('请填写「提醒时间·自己」（必填）'); return }
    }
    if (newType === 'swap') {
      if (theirCourse.trim() && (theirRemindMonth === '' || theirRemindDay === '' || theirRemindHour === '' || theirRemindMinute === '')) {
        setFormError('已填写对方课程，请一并填写「提醒时间·对方」（必填）'); return
      }
      const myDateStr = `${String(myDateMonth).padStart(2, '0')}-${String(myDateDay).padStart(2, '0')}`
      const theirDateStr = `${String(theirDateMonth).padStart(2, '0')}-${String(theirDateDay).padStart(2, '0')}`
      // 提醒日期 YYYY-MM-DD（用当前年份）
      const remindDateStr = `${viewYear}-${String(remindMonth).padStart(2, '0')}-${String(remindDay).padStart(2, '0')}`
      const remindTimeStr = `${String(remindHour).padStart(2, '0')}:${String(remindMinute).padStart(2, '0')}`
      const theirRemindDateStr = `${viewYear}-${String(theirRemindMonth).padStart(2, '0')}-${String(theirRemindDay).padStart(2, '0')}`
      const theirRemindTimeStr = `${String(theirRemindHour).padStart(2, '0')}:${String(theirRemindMinute).padStart(2, '0')}`

      const swapInfo = {
        myDate: myDateStr,
        myPeriod: myPeriod.trim() || '1',
        myClass: myClass.trim() || '未填写',
        myCourse: myCourse.trim() || '未填写',
        teacher: swapTeacher.trim() || '未填写',
        theirDate: theirDateStr,
        theirPeriod: theirPeriod.trim() || '1',
        theirClass: theirClass.trim() || '未填写',
        theirCourse: theirCourse.trim() || '未填写',
        remark: newTitle.trim(),
        remindMonth: remindMonth as number,
        remindDay: remindDay as number,
        remindHour: remindHour as number,
        remindMinute: remindMinute as number,
        theirRemindMonth: theirRemindMonth as number,
        theirRemindDay: theirRemindDay as number,
        theirRemindHour: theirRemindHour as number,
        theirRemindMinute: theirRemindMinute as number,
      }

      // 给自己创建一条提醒
      const myTitle = theirCourse.trim()
        ? `调课提醒（我）：${myCourse} ↔ ${theirCourse}`
        : `调课提醒（我）：${myCourse}`
      addSchedule(remindDateStr, remindTimeStr, myTitle, newUrgency, 'swap', swapInfo)
      // 仅当填写了对方课程时，才给对方（教师）创建提醒
      if (theirCourse.trim()) {
        addSchedule(theirRemindDateStr, theirRemindTimeStr, `调课提醒（${swapTeacher.trim() || '对方'}）：${myCourse} ↔ ${theirCourse}`, newUrgency, 'swap', swapInfo)
      }

      // 清空调课字段
      setMyClass('')
      setMyCourse('')
      setSwapTeacher('')
      setTheirClass('')
      setTheirCourse('')
      setMyPeriod('')
      setTheirPeriod('')
      setTheirRemindMonth('')
      setTheirRemindDay('')
      setTheirRemindHour('')
      setTheirRemindMinute('')
    } else {
      if (newHour === '' || newMinute === '') { setFormError('请填写日程时间（时、分）'); return }
      const timeStr = `${String(newHour).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}`
      addSchedule(selectedDate, timeStr, newTitle.trim(), newUrgency)
    }
    setNewTitle('')
    setNewUrgency('normal')
    setNewType('normal')
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
        <button className="nokia-titlebar-btn" onClick={onBack} title="返回天气" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 14 10 14 10 20" />
            <polyline points="20 10 14 10 14 4" />
            <line x1="14" y1="10" x2="21" y2="3" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </button>
        <div style={{ position: 'relative', display: 'flex', gap: 2, alignItems: 'center' }}>
          <button className="nokia-titlebar-btn" onClick={prevMonth} title="上个月" style={{ fontSize: 18, fontWeight: 300 }}>‹</button>
          <span
            onClick={() => setShowMonthPicker((v) => !v)}
            title="点击选择年月"
            style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, minWidth: 80, textAlign: 'center', cursor: 'pointer', WebkitAppRegion: 'no-drag' }}
          >
            {viewYear}年{viewMonth + 1}月
          </span>
          <button className="nokia-titlebar-btn" onClick={nextMonth} title="下个月" style={{ fontSize: 18, fontWeight: 300 }}>›</button>

          {showMonthPicker && (
            <>
              <div onClick={() => setShowMonthPicker(false)} style={{ position: 'fixed', inset: 0, zIndex: 9, WebkitAppRegion: 'no-drag' }} />
              <div style={{
                position: 'fixed', top: 36, left: '50%', transform: 'translateX(-50%)', zIndex: 10,
                background: '#1B263B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8,
                padding: 10, width: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', WebkitAppRegion: 'no-drag',
              }}>
                {/* 年份 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <button className="nokia-titlebar-btn" onClick={() => setViewYear((y) => y - 1)} style={{ fontSize: 16 }}>‹</button>
                  <input
                    type="number"
                    value={viewYear}
                    onChange={(e) => { const v = Number(e.target.value); if (v > 0) setViewYear(v) }}
                    style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 4, padding: '4px 6px', color: '#fff', fontSize: 13, outline: 'none' }}
                  />
                  <button className="nokia-titlebar-btn" onClick={() => setViewYear((y) => y + 1)} style={{ fontSize: 16 }}>›</button>
                </div>
                {/* 月份网格 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => { setViewMonth(i); setShowMonthPicker(false) }}
                      style={{
                        padding: '6px 0',
                        borderRadius: 4,
                        border: viewMonth === i ? '1px solid #4FC3F7' : '1px solid rgba(255,255,255,0.1)',
                        background: viewMonth === i ? 'rgba(79,195,247,0.2)' : 'transparent',
                        color: viewMonth === i ? '#4FC3F7' : 'rgba(255,255,255,0.6)',
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      {i + 1}月
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
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
            if (day === null) return <div key={i} style={{ width: '14.28%', height: 44 }} />
            const dateStr = formatDate(viewYear, viewMonth, day)
            const isToday = dateStr === todayStr
            const isSelected = dateStr === selectedDate
            const daySchedules = getSchedulesByDate(dateStr)
            const hasSchedule = daySchedules.length > 0
            const weekday = new Date(viewYear, viewMonth, day).getDay()
            const isWeekend = weekday === 0 || weekday === 6

            // 农历信息
            const lunarInfo = getLunarDayInfo(viewYear, viewMonth + 1, day)
            const cellLabel = getCellLabel(lunarInfo)
            const special = isSpecialDay(lunarInfo)

            // 农历文字颜色：节假日用红色，节气用绿色，节日用金色，普通日灰色
            const lunarColor = lunarInfo.isHoliday
              ? 'rgba(255,100,100,0.8)'
              : lunarInfo.festival
                ? 'rgba(255,213,79,0.8)'
                : lunarInfo.solarFestival
                  ? 'rgba(255,213,79,0.7)'
                  : lunarInfo.jieQi
                    ? 'rgba(129,199,132,0.8)'
                    : 'rgba(255,255,255,0.3)'

            return (
              <div
                key={i}
                onClick={() => setSelectedDate(dateStr)}
                style={{
                  width: '14.28%',
                  height: 44,
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <span style={{
                    fontSize: 14,
                    color: isSelected ? '#4FC3F7' : isWeekend ? 'rgba(255,150,150,0.7)' : 'rgba(255,255,255,0.7)',
                    fontWeight: isToday ? 400 : 300,
                  }}>
                    {day}
                  </span>
                  {hasSchedule && (
                    <div style={{
                      width: 3,
                      height: 3,
                      borderRadius: '50%',
                      background: '#FFD54F',
                    }} />
                  )}
                </div>
                <span style={{
                  fontSize: 10,
                  color: special ? lunarColor : 'rgba(255,255,255,0.3)',
                  fontWeight: special ? 400 : 300,
                  lineHeight: 1.2,
                }}>
                  {cellLabel}
                </span>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', letterSpacing: 2 }}>
                {selectedDate.replace(/-/g, '/')}
              </span>
              {(() => {
                const parts = selectedDate.split('-')
                const info = getLunarDayInfo(Number(parts[0]), Number(parts[1]), Number(parts[2]))
                return (
                  <span style={{ fontSize: 12, color: 'rgba(255,213,79,0.6)', letterSpacing: 1 }}>
                    {info.lunarMonth}月{info.lunarDay}
                    {info.festival ? ` · ${info.festival}` : ''}
                    {info.solarFestival ? ` · ${info.solarFestival}` : ''}
                    {info.jieQi ? ` · ${info.jieQi}` : ''}
                  </span>
                )
              })()}
              <span style={{ fontSize: 13, color: 'rgba(79,195,247,0.7)', letterSpacing: 1 }}>
                周{'日一二三四五六'[new Date(selectedDate).getDay()]}
              </span>
            </div>
          </div>

          {/* 操作按钮区：添加 / 调课 */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <button
              onClick={() => {
                if (showAddForm && newType === 'normal') setShowAddForm(false)
                else { setNewType('normal'); setShowAddForm(true) }
              }}
              style={{
                flex: 1,
                fontSize: 12,
                color: '#4FC3F7',
                background: 'transparent',
                border: '1px solid rgba(79,195,247,0.3)',
                borderRadius: 4,
                padding: '4px 8px',
                cursor: 'pointer',
              }}
            >
              {showAddForm && newType === 'normal' ? '取消' : '添加日程'}
            </button>
            <button
              onClick={() => {
                if (showAddForm && newType === 'swap') setShowAddForm(false)
                else { setNewType('swap'); setShowAddForm(true) }
              }}
              style={{
                flex: 1,
                fontSize: 12,
                color: '#BA68C8',
                background: 'transparent',
                border: '1px solid rgba(186,104,200,0.3)',
                borderRadius: 4,
                padding: '4px 8px',
                cursor: 'pointer',
              }}
            >
              {showAddForm && newType === 'swap' ? '取消' : '调课提醒'}
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
              {newType !== 'swap' && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <ColoredSelect theme="blue" value={newHour} onChange={(v) => setNewHour(v)} placeholder="时" options={Array.from({ length: 24 }, (_, i) => ({ value: i, label: `${String(i).padStart(2, '0')}时` }))} />
                  <ColoredSelect theme="blue" value={newMinute} onChange={(v) => setNewMinute(v)} placeholder="分" options={Array.from({ length: 60 }, (_, i) => ({ value: i, label: `${String(i).padStart(2, '0')}分` }))} />
                </div>
              )}
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder={newType === 'swap' ? '调课备注…' : '日程内容…'}
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
              {/* 调课详情字段 */}
              {newType === 'swap' && (
                <>
                  {/* 自己的课程信息 */}
                  <div style={{ fontSize: 12, color: '#BA68C8', letterSpacing: 1, marginTop: 2 }}>我的课程 <span style={{ color: '#FF5252' }}>*</span></div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <ColoredSelect theme="purple" value={myDateMonth} onChange={(v) => setMyDateMonth(v)} options={Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `${i + 1}月` }))} />
                    <ColoredSelect theme="purple" value={myDateDay} onChange={(v) => setMyDateDay(v)} options={Array.from({ length: 31 }, (_, i) => ({ value: i + 1, label: `${i + 1}日` }))} />
                    <input type="text" value={myPeriod} onChange={(e) => setMyPeriod(e.target.value)} placeholder="节次（如1、2节课）" style={{ flex: 1, background: 'rgba(186,104,200,0.1)', border: '1px solid rgba(186,104,200,0.3)', borderRadius: 4, padding: '4px 6px', color: '#fff', fontSize: 12, outline: 'none' }} />
                  </div>
                  <input type="text" value={myClass} onChange={(e) => setMyClass(e.target.value)} placeholder="班级（如：25级护理1班）" style={{ background: 'rgba(186,104,200,0.1)', border: '1px solid rgba(186,104,200,0.3)', borderRadius: 4, padding: '4px 6px', color: '#fff', fontSize: 12, outline: 'none' }} />
                  <input type="text" value={myCourse} onChange={(e) => setMyCourse(e.target.value)} placeholder="课程名称（如：健康评估）" style={{ background: 'rgba(186,104,200,0.1)', border: '1px solid rgba(186,104,200,0.3)', borderRadius: 4, padding: '4px 6px', color: '#fff', fontSize: 12, outline: 'none' }} />

                  {/* 对方的课程信息 */}
                  <div style={{ fontSize: 12, color: '#4FC3F7', letterSpacing: 1, marginTop: 2 }}>对方课程</div>
                  <input type="text" value={swapTeacher} onChange={(e) => setSwapTeacher(e.target.value)} placeholder="对方教师姓名" style={{ background: 'rgba(79,195,247,0.1)', border: '1px solid rgba(79,195,247,0.3)', borderRadius: 4, padding: '4px 6px', color: '#fff', fontSize: 12, outline: 'none' }} />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <ColoredSelect theme="blue" value={theirDateMonth} onChange={(v) => setTheirDateMonth(v)} options={Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `${i + 1}月` }))} />
                    <ColoredSelect theme="blue" value={theirDateDay} onChange={(v) => setTheirDateDay(v)} options={Array.from({ length: 31 }, (_, i) => ({ value: i + 1, label: `${i + 1}日` }))} />
                    <input type="text" value={theirPeriod} onChange={(e) => setTheirPeriod(e.target.value)} placeholder="节次（如1、2节课）" style={{ flex: 1, background: 'rgba(79,195,247,0.1)', border: '1px solid rgba(79,195,247,0.3)', borderRadius: 4, padding: '4px 6px', color: '#fff', fontSize: 12, outline: 'none' }} />
                  </div>
                  <input type="text" value={theirClass} onChange={(e) => setTheirClass(e.target.value)} placeholder="对方班级" style={{ background: 'rgba(79,195,247,0.1)', border: '1px solid rgba(79,195,247,0.3)', borderRadius: 4, padding: '4px 6px', color: '#fff', fontSize: 12, outline: 'none' }} />
                  <input type="text" value={theirCourse} onChange={(e) => setTheirCourse(e.target.value)} placeholder="对方课程名称" style={{ background: 'rgba(79,195,247,0.1)', border: '1px solid rgba(79,195,247,0.3)', borderRadius: 4, padding: '4px 6px', color: '#fff', fontSize: 12, outline: 'none' }} />

                  {/* 提醒时间 */}
                  <div style={{ fontSize: 12, color: '#FF5252', letterSpacing: 1, marginTop: 2 }}>提醒时间</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,82,82,0.8)', letterSpacing: 1 }}>自己 <span style={{ color: '#FF5252' }}>*</span></div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <ColoredSelect theme="red" value={remindMonth} onChange={(v) => setRemindMonth(v)} placeholder="月" options={Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `${i + 1}月` }))} />
                    <ColoredSelect theme="red" value={remindDay} onChange={(v) => setRemindDay(v)} placeholder="日" options={Array.from({ length: 31 }, (_, i) => ({ value: i + 1, label: `${i + 1}日` }))} />
                    <ColoredSelect theme="red" value={remindHour} onChange={(v) => setRemindHour(v)} placeholder="时" options={Array.from({ length: 24 }, (_, i) => ({ value: i, label: `${String(i).padStart(2, '0')}时` }))} />
                    <ColoredSelect theme="red" value={remindMinute} onChange={(v) => setRemindMinute(v)} placeholder="分" options={Array.from({ length: 60 }, (_, i) => ({ value: i, label: `${String(i).padStart(2, '0')}分` }))} />
                  </div>
                  {/* 是否同时提醒对方，由用户自行决定 */}
                  <div style={{ fontSize: 11, color: 'rgba(255,82,82,0.8)', letterSpacing: 1, marginTop: 4 }}>对方（教师）</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <ColoredSelect theme="red" value={theirRemindMonth} onChange={(v) => setTheirRemindMonth(v)} placeholder="月" options={Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `${i + 1}月` }))} />
                    <ColoredSelect theme="red" value={theirRemindDay} onChange={(v) => setTheirRemindDay(v)} placeholder="日" options={Array.from({ length: 31 }, (_, i) => ({ value: i + 1, label: `${i + 1}日` }))} />
                    <ColoredSelect theme="red" value={theirRemindHour} onChange={(v) => setTheirRemindHour(v)} placeholder="时" options={Array.from({ length: 24 }, (_, i) => ({ value: i, label: `${String(i).padStart(2, '0')}时` }))} />
                    <ColoredSelect theme="red" value={theirRemindMinute} onChange={(v) => setTheirRemindMinute(v)} placeholder="分" options={Array.from({ length: 60 }, (_, i) => ({ value: i, label: `${String(i).padStart(2, '0')}分` }))} />
                  </div>
                </>
              )}
              {/* 紧急程度选择 */}
              <div style={{ display: 'flex', gap: 6 }}>
                {([
                  { value: 'urgent' as Urgency, label: '最紧急', color: '#FF5252' },
                  { value: 'important' as Urgency, label: '紧急', color: '#FFD54F' },
                  { value: 'normal' as Urgency, label: '普通', color: '#66BB6A' },
                ]).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setNewUrgency(opt.value)}
                    style={{
                      flex: 1,
                      padding: '3px 0',
                      borderRadius: 4,
                      border: newUrgency === opt.value ? `1px solid ${opt.color}` : '1px solid rgba(255,255,255,0.1)',
                      background: newUrgency === opt.value ? `${opt.color}22` : 'transparent',
                      color: newUrgency === opt.value ? opt.color : 'rgba(255,255,255,0.4)',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {formError && (
                <div style={{ fontSize: 11, color: '#FF5252', textAlign: 'center' }}>{formError}</div>
              )}
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
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: '8px 0' }}>
              暂无日程
            </div>
          ) : (
            selectedSchedules.map((s) => (
              <div key={s.id} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                padding: '6px 8px',
                marginBottom: 4,
                background: s.type === 'swap' ? 'rgba(186,104,200,0.08)' : 'rgba(255,255,255,0.04)',
                borderRadius: 6,
                borderLeft: s.type === 'swap'
                  ? '2px solid #BA68C8'
                  : s.urgency === 'urgent' ? '2px solid #FF5252' : s.urgency === 'important' ? '2px solid #FFD54F' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#4FC3F7', minWidth: 36 }}>
                    {s.time}
                  </span>
                  {s.type === 'swap' && (
                    <span style={{
                      fontSize: 8,
                      padding: '1px 4px',
                      borderRadius: 2,
                      border: '1px solid rgba(186,104,200,0.5)',
                      color: '#BA68C8',
                    }}>
                      调课
                    </span>
                  )}
                  {s.urgency !== 'normal' && (
                    <span style={{
                      fontSize: 8,
                      padding: '1px 4px',
                      borderRadius: 2,
                      border: s.urgency === 'urgent' ? '1px solid rgba(255,82,82,0.5)' : '1px solid rgba(255,213,79,0.5)',
                      color: s.urgency === 'urgent' ? '#FF5252' : '#FFD54F',
                    }}>
                      {s.urgency === 'urgent' ? '最紧急' : '紧急'}
                    </span>
                  )}
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
                {/* 调课详情 */}
                {s.type === 'swap' && s.swapInfo && (
                  <div style={{
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.6)',
                    paddingLeft: 44,
                    lineHeight: 1.8,
                  }}>
                    <div style={{ color: '#4FC3F7' }}>【我的】{s.swapInfo.myDate} 第{s.swapInfo.myPeriod}节 · {s.swapInfo.myClass} · {s.swapInfo.myCourse}</div>
                    {s.swapInfo.theirCourse && s.swapInfo.theirCourse !== '未填写' && (
                      <div style={{ color: '#FFB74D' }}>【{s.swapInfo.teacher}】{s.swapInfo.theirDate} 第{s.swapInfo.theirPeriod}节 · {s.swapInfo.theirClass} · {s.swapInfo.theirCourse}</div>
                    )}
                    {s.swapInfo.remark && (
                      <div style={{ color: 'rgba(255,255,255,0.8)' }}>【备注】{s.swapInfo.remark}</div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default CalendarView
