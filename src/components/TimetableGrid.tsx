import React from 'react'
import { TimetableSlot, periodOrder, formatPeriodRange, formatPeriodTime, TIME_SEGMENTS, PeriodTime, parsePeriodText } from '../hooks/useTimetable'
import { useSchedules } from '../hooks/useSchedules'

const weekLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

// 节次所属时段（用于限制"连上"合并不跨时段，避免与时段分隔行错位）
const segOf = (p: number) => TIME_SEGMENTS.find((s) => s.periods.includes(p))

interface Props {
  slots: TimetableSlot[]
  periodTimes?: Record<number, PeriodTime>
  onBack: () => void   // 回课表录入页（右上角"课表输入"按钮）
  onHome: () => void   // 回天气小图标界面（左上角箭头）
}

interface CellPlan {
  skip: boolean          // 被上方合并占据，不渲染 td
  rowspan: number        // 跨几行
  slot?: TimetableSlot   // 显示的课程（段首才有）
}

const TimetableGrid: React.FC<Props> = ({ slots, periodTimes, onBack, onHome }) => {
  const today = new Date()
  const todayWeekday = today.getDay() === 0 ? 7 : today.getDay()

  // 导出 PDF 反馈提示（成功/失败原因），几秒后自动消失
  const [pdfTip, setPdfTip] = React.useState('')
  const [exporting, setExporting] = React.useState(false)
  const handleExportPDF = async () => {
    if (exporting) return
    setExporting(true)
    setPdfTip('')
    try {
      const r = await window.electronAPI.exportTimetablePDF()
      if (r?.ok && r.path) {
        if (r.fallbackFrom) {
          // 所选位置写不进去，自动存到了"下载"文件夹
          setPdfTip('所选位置无法写入，已改存到下载文件夹')
        } else {
          setPdfTip('PDF 已保存，可直接拷去打印')
        }
      } else if (r?.error) {
        setPdfTip(`导出失败：${r.error}`)
      }
    } catch {
      setPdfTip('导出失败')
    }
    setExporting(false)
    setTimeout(() => setPdfTip(''), 5000)
  }

  // ===== 调课高亮：读取调课提醒，把"我的课程/对方课程"的日期+节次
  // 换算成课表格子（星期几 × 节次），对应格子底色标红 =====
  const { schedules } = useSchedules()
  // 高亮格子 → 悬停提示文字（该格子被哪些调课提醒命中）
  const swapHighlightMap: Map<string, string[]> = React.useMemo(() => {
    const map = new Map<string, string[]>()
    const year = new Date().getFullYear()
    for (const s of schedules) {
      if (s.type !== 'swap' || !s.swapInfo) continue
      // 只标"我的课程"相关格子——这是自己的课表，对方的课不在本表内
      const blocks: Array<{ date: string; periodText: string }> = [
        { date: s.swapInfo.myDate, periodText: s.swapInfo.myPeriod },
      ]
      for (const b of blocks) {
        // 日期格式 MM-DD，按真实日历换算成星期几（1=周一 ... 7=周日）
        const [mm, dd] = b.date.split('-').map(Number)
        if (!mm || !dd) continue
        const swapDate = new Date(year, mm - 1, dd)
        // 调课日期已过期的不再标记（历史调课无需提示）
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)
        if (swapDate < todayStart) continue
        const wd = swapDate.getDay()
        const weekday = wd === 0 ? 7 : wd
        // 悬停提示：调课日期 + 我的课程信息
        const tip = `${mm}月${dd}日调课：${s.swapInfo.myCourse || '我的课程'}${s.swapInfo.myClass && s.swapInfo.myClass !== '未填写' ? `（${s.swapInfo.myClass}）` : ''}`
        // 节次文本解析为全局节次编号（如"1、2节" → [1,2]）
        for (const p of parsePeriodText(b.periodText)) {
          const k = `${weekday}|${p}`
          if (!map.has(k)) map.set(k, [])
          map.get(k)!.push(tip)
        }
      }
    }
    return map
  }, [schedules])
  const isSwapHighlighted = (weekday: number, period: number) => swapHighlightMap.has(`${weekday}|${period}`)
  // 悬停提示：命中多条调课时逐行显示
  const swapTip = (weekday: number, period: number) => {
    const list = swapHighlightMap.get(`${weekday}|${period}`)
    return list && list.length ? list.join('\n') : undefined
  }

  // 行：按时段动态生成。每时段行数 = max(全周实际用到的最大节次序号, 保底行数)，
  // 行号连续（空档节次保留空行）；完全没排到的靠后节次整排隐藏。
  const rowPeriods: number[] = []
  // 每节次所属时段信息：是否时段首行、该时段总行数（用于左侧纵向时段列 rowSpan 合并）
  const segMeta: Record<number, { label: string; segIdx: number; isSegStart: boolean; segRows: number }> = {}
  for (const seg of TIME_SEGMENTS) {
    let maxIdx = 0
    for (const s of slots) {
      const idx = seg.periods.indexOf(s.period)
      if (idx + 1 > maxIdx) maxIdx = idx + 1
    }
    const rows = Math.max(maxIdx, seg.minRows)
    seg.periods.slice(0, rows).forEach((p, i) => {
      rowPeriods.push(p)
      segMeta[p] = { label: seg.label, segIdx: i + 1, isSegStart: i === 0, segRows: rows }
    })
  }

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
        segOf(cur.period) === segOf(daySlots[i + len].period) &&
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
    <div className="timetable-print" style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      borderRadius: 14,
      background: 'linear-gradient(180deg, #0D1B2A 0%, #1B263B 50%, #243447 100%)',
      boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
      position: 'relative',
    }}>
      {/* 标题栏 */}
      <div className="nokia-titlebar">
        <button className="nokia-titlebar-btn" onClick={onHome} title="返回天气" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, marginLeft: 4 }}>课表总览</span>
        <span style={{ flex: 1 }} />
        <button className="nokia-titlebar-btn" onClick={handleExportPDF} disabled={exporting} title="一键导出 PDF（自动保存，可在其他电脑打印）" style={{ fontSize: 14, letterSpacing: 2, width: 'auto', padding: '0 6px', marginRight: 6, whiteSpace: 'nowrap', color: '#69F0AE' }}>
          {exporting ? '导出中…' : '存PDF'}
        </button>
        <button className="nokia-titlebar-btn" onClick={() => window.print()} title="打印课表" style={{ fontSize: 14, letterSpacing: 2, width: 'auto', padding: '0 6px', marginRight: 6, whiteSpace: 'nowrap', color: '#4FC3F7' }}>
          打印
        </button>
        <button className="nokia-titlebar-btn" onClick={onBack} title="进入课表输入" style={{ fontSize: 14, letterSpacing: 2, width: 'auto', padding: '0 6px', whiteSpace: 'nowrap', color: '#4FC3F7' }}>
          课表输入
        </button>
      </div>

      {/* 打印时才显示的标题（屏幕上隐藏） */}
      <div className="timetable-print-title">课表总览</div>

      {/* 导出结果浮动提示 */}
      {pdfTip && (
        <div style={{ position: 'absolute', top: 46, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 5, pointerEvents: 'none' }}>
          <span style={{
            background: 'rgba(13,27,42,0.92)',
            color: pdfTip.startsWith('导出失败') ? '#FF8A80' : '#69F0AE',
            fontSize: 12,
            padding: '5px 14px',
            borderRadius: 12,
            border: '1px solid rgba(79,195,247,0.3)',
            whiteSpace: 'nowrap',
          }}>
            {pdfTip}
          </span>
        </div>
      )}

      {/* 表格区 */}
      <div className="timetable-scroll" style={{ flex: 1, overflow: 'auto', padding: '8px 10px 12px' }}>
        {slots.length === 0 ? (
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: '24px 0' }}>
            还没有课程，先去录入吧
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, color: '#fff', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: 22 }} />
              <col style={{ width: 74 }} />
              {activeWeekdays.map((wd) => (
                <col key={wd} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th style={{ ...thBase, padding: '9px 2px' }} />
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
              {rowPeriods.flatMap((p, i) => {
                const prev = i > 0 ? rowPeriods[i - 1] : undefined
                const items: React.ReactNode[] = []
                if (prev !== undefined && segMeta[prev].label !== segMeta[p].label) {
                  items.push(
                    <tr key={`sep-${p}`} className="timetable-sep">
                      <td colSpan={2 + activeWeekdays.length} style={{ height: 6, padding: 0, border: 'none' }} />
                    </tr>
                  )
                }
                items.push(
                <tr key={p}>
                  {segMeta[p].isSegStart && (
                    <td rowSpan={segMeta[p].segRows} className="seg-label-td" style={{
                      padding: 0,
                      border: '1px solid rgba(79,195,247,0.35)',
                      background: 'rgba(255,255,255,0.02)',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                    }}>
                      <span style={{ writingMode: 'vertical-rl', fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>{segMeta[p].label}</span>
                    </td>
                  )}
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
                    {`第${segMeta[p].segIdx}节`}
                    {(() => {
                      const t = formatPeriodTime(periodTimes?.[p])
                      if (!t) return null
                      return (
                        <div className="period-time" style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 400, marginTop: 2, whiteSpace: 'nowrap' }}>
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
                      const hl = isSwapHighlighted(wd, p)
                      return (
                        <td key={wd} className={hl ? 'swap-hl' : undefined} title={hl ? swapTip(wd, p) : undefined} style={{
                        padding: '8px 6px',
                        border: hl ? '1px solid rgba(255,82,82,0.6)' : '1px solid rgba(79,195,247,0.35)',
                        background: hl ? 'rgba(255,82,82,0.25)' : (isTodayCol ? 'rgba(79,195,247,0.08)' : 'transparent'),
                        height: 44,
                        }} />
                      )
                    }
                    const s = cell.slot
                    // 连堂合并格：覆盖的任意一节被调课命中即标红
                    const covered = rowPeriods.slice(i, i + cell.rowspan)
                    const hl = covered.some((pp) => isSwapHighlighted(wd, pp))
                    // 悬停提示：合并格内所有命中的调课提醒去重后逐行显示
                    const tips = Array.from(new Set(covered.flatMap((pp) => swapHighlightMap.get(`${wd}|${pp}`) || [])))
                    return (
                      <td key={wd} rowSpan={cell.rowspan} className={hl ? 'swap-hl' : undefined} title={hl ? tips.join('\n') : undefined} style={{
                        padding: '9px 9px',
                        verticalAlign: 'top',
                        border: hl ? '1px solid rgba(255,82,82,0.6)' : '1px solid rgba(79,195,247,0.35)',
                        borderLeft: hl ? '2px solid #FF5252' : '2px solid #4FC3F7',
                        background: hl ? 'rgba(255,82,82,0.3)' : (isTodayCol ? 'rgba(79,195,247,0.2)' : 'rgba(79,195,247,0.1)'),
                        borderRadius: 4,
                      }}>
                        {hl && (
                          <div style={{ fontSize: 11, color: '#FF8A80', fontWeight: 600, marginBottom: 2, letterSpacing: 1 }}>
                            调课
                          </div>
                        )}
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
                )
                return items
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default TimetableGrid
