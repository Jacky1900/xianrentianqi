import React from 'react'
import { TimetableSlot, periodOrder, formatPeriodLabel, formatPeriodRange, formatPeriodTime, PeriodTime } from '../hooks/useTimetable'

const weekLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

interface Props {
  slots: TimetableSlot[]
  periodTimes?: Record<number, PeriodTime>
  onBack: () => void
}

interface CellPlan {
  skip: boolean          // 被上方合并占据，不渲染 td
  rowspan: number        // 跨几行
  slot?: TimetableSlot   // 显示的课程（段首才有）
}

const TimetableGrid: React.FC<Props> = ({ slots, periodTimes, onBack }) => {
  const today = new Date()
  const todayWeekday = today.getDay() === 0 ? 7 : today.getDay()

  // 行：取实际出现的节次（含早/晚自习），默认至少包含 1~8 节（不预留 9/10/11/12 空行）
  const usedPeriods = new Set<number>([1, 2, 3, 4, 5, 6, 7, 8])
  slots.forEach((s) => usedPeriods.add(s.period))
  const rowPeriods = [...usedPeriods].sort((a, b) => periodOrder(a) - periodOrder(b))

  // 只显示有课程的天：未录入任何课的那天（含周六、周日）不显示对应列
  const activeWeekdays = Array.from(new Set(slots.map((s) => s.weekday))).sort((a, b) => a - b)

  // 构建每天每节的渲染计划，连上同课合并为 rowspan
  const plan: Record<number, Record<number, CellPlan>> = {}
  for (let wd = 1; wd <= 7; wd++) {
    plan[wd] = {}
    const daySlots = slots
      .filter((s) => s.weekday === wd)
      .sort((a, b) => periodOrder(a.period) - periodOrder(b.period))

    let i = 0
    while (i < daySlots.length) {
      const cur = daySlots[i]
      const key = `${cur.courseName}|${cur.className}|${cur.room}`
      // 向后数：显示顺序相邻（periodOrder 连续）且 key 相同的段，合并为 rowspan
      let len = 1
      while (
        i + len < daySlots.length &&
        periodOrder(daySlots[i + len].period) === periodOrder(cur.period) + len &&
        `${daySlots[i + len].courseName}|${daySlots[i + len].className}|${daySlots[i + len].room}` === key
      ) {
        len++
      }
      plan[wd][cur.period] = { skip: false, rowspan: len, slot: cur }
      for (let k = 1; k < len; k++) {
        plan[wd][daySlots[i + k].period] = { skip: true, rowspan: 0 }
      }
      i += len
    }
  }

  const thBase: React.CSSProperties = {
    padding: '9px 6px',
    fontSize: 13,
    fontWeight: 400,
    color: 'rgba(255,255,255,0.75)',
    background: 'rgba(79,195,247,0.14)',
    border: '1px solid rgba(79,195,247,0.5)',
    position: 'sticky',
    top: 0,
    zIndex: 2,
    whiteSpace: 'nowrap',
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
        <button className="nokia-titlebar-btn" onClick={onBack} title="返回录入" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, marginLeft: 4 }}>课表总览</span>
        <span style={{ flex: 1 }} />
        <button className="nokia-titlebar-btn" onClick={onBack} title="进入课表输入" style={{ fontSize: 14, letterSpacing: 2, width: 'auto', padding: '0 6px', whiteSpace: 'nowrap', color: '#4FC3F7' }}>
          课表输入
        </button>
      </div>

      {/* 表格区 */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 10px 12px' }}>
        {slots.length === 0 ? (
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: '24px 0' }}>
            还没有课程，先去录入吧
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, color: '#fff', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: 74 }} />
              {activeWeekdays.map((wd) => (
                <col key={wd} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th style={{ ...thBase, textAlign: 'center' }}>节次</th>
                {activeWeekdays.map((wd) => {
                  const label = weekLabels[wd - 1]
                  const isToday = wd === todayWeekday
                  return (
                    <th key={wd} style={{
                      ...thBase,
                      textAlign: 'center',
                      color: isToday ? '#4FC3F7' : 'rgba(255,255,255,0.75)',
                      background: isToday ? 'rgba(79,195,247,0.28)' : 'rgba(79,195,247,0.14)',
                      letterSpacing: 1,
                    }}>
                      {label}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {rowPeriods.map((p) => (
                <tr key={p}>
                  <td style={{
                    textAlign: 'center',
                    padding: '8px 4px',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.55)',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(79,195,247,0.35)',
                    whiteSpace: 'nowrap',
                  }}>
                    {formatPeriodLabel(p)}
                    {(() => {
                      const t = formatPeriodTime(periodTimes?.[p])
                      if (!t) return null
                      return (
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 400, marginTop: 2, whiteSpace: 'nowrap' }}>
                          {t}
                        </div>
                      )
                    })()}
                  </td>
                  {activeWeekdays.map((wd) => {
                    const cell = plan[wd][p]
                    const isTodayCol = wd === todayWeekday
                    // 被上方合并占据：不渲染 td
                    if (cell?.skip) return null
                    // 无课：渲染空格占位，保证表格结构完整
                    if (!cell || !cell.slot) {
                      return (
                        <td key={wd} style={{
                        padding: '8px 6px',
                        border: '1px solid rgba(79,195,247,0.35)',
                        background: isTodayCol ? 'rgba(79,195,247,0.08)' : 'transparent',
                        height: 44,
                        }} />
                      )
                    }
                    const s = cell.slot
                    return (
                      <td key={wd} rowSpan={cell.rowspan} style={{
                        padding: '9px 9px',
                        verticalAlign: 'top',
                        border: '1px solid rgba(79,195,247,0.35)',
                        borderLeft: '2px solid #4FC3F7',
                        background: isTodayCol ? 'rgba(79,195,247,0.2)' : 'rgba(79,195,247,0.1)',
                        borderRadius: 4,
                      }}>
                        <div style={{ fontSize: 12, color: '#69F0AE', fontWeight: 600, lineHeight: 1.35, wordBreak: 'break-all' }}>
                          {s.courseName}
                        </div>
                        {s.className && s.className !== '未填写' && (
                          <div style={{ fontSize: 12, color: '#FFD54F', marginTop: 3, wordBreak: 'break-all' }}>
                            {s.className}
                          </div>
                        )}
                        {s.room && s.room !== '未填写' && (
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 3, wordBreak: 'break-all' }}>
                            {s.room}
                          </div>
                        )}
                        {cell.rowspan > 1 && (
                          <div style={{ fontSize: 12, color: 'rgba(79,195,247,0.85)', marginTop: 3 }}>
                            {formatPeriodRange(p, p + cell.rowspan - 1)}
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default TimetableGrid
