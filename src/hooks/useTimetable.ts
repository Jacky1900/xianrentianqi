import { useState, useEffect, useCallback } from 'react'

export interface TimetableSlot {
  id: string
  weekday: number      // 1=周一 ... 7=周日
  period: number       // 第几节
  className: string    // 班级
  courseName: string   // 课程名称
  room: string         // 教室
}

const STORAGE_KEY = 'xianren-timetable'

// 节次排序键：早自习(负值, 越小越早) < 第1~12节 < 晚自习(13+)
// 早自习1 = -1, 早自习2 = -2 ...；晚自习1 = 13, 晚自习2 = 14 ...
export function periodOrder(p: number): number {
  if (p < 0) return -p            // 早自习：第几节早自习
  if (p <= 12) return 100 + p     // 第 1~12 节
  return 200 + (p - 12)           // 晚自习：第几节晚自习
}

// 单节次显示文案
export function formatPeriodLabel(p: number): string {
  if (p < 0) return `早自习${-p}`
  if (p <= 12) return `第${p}节`
  return `晚自习${p - 12}`
}

// 带时段前缀的完整节次文案："上午第1节"、"下午第2节"；早自习N、晚自习N 已带前缀，原样返回
// 上午/下午按时段内部编号显示（下午第1节 = 全局第7节），底层存储仍是全局编号
export function formatPeriodFullLabel(p: number): string {
  for (const seg of TIME_SEGMENTS) {
    const idx = seg.periods.indexOf(p)
    if (idx >= 0) {
      if (seg.key === 'am' || seg.key === 'pm') return `${seg.label}第${idx + 1}节`
      return formatPeriodLabel(p)
    }
  }
  return formatPeriodLabel(p)
}

// 跨多节（“X节连上”）的显示文案
export function formatPeriodRange(a: number, b: number): string {
  if (a < 0 && b < 0) return `早自习${-a}-${-b}`
  if (a > 12 && b > 12) return `晚自习${a - 12}-${b - 12}`
  if (a >= 1 && b <= 6) return `上午第${a}-${b}节`
  if (a >= 7 && b <= 12) return `下午第${a - 6}-${b - 6}节`
  return `${formatPeriodFullLabel(a)}–${formatPeriodFullLabel(b)}`
}

// ============ 每节课时间 ============
export interface PeriodTime {
  start: string
  end: string
}

const PERIOD_TIME_STORAGE = 'xianren-period-times'

// 时间不预设默认值：每个学校不同，由用户在录入页下半部分自行填写。

// 所有可配置时间的节次（按显示顺序）
export const TIME_EDIT_PERIODS: number[] = [-2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].sort(
  (a, b) => periodOrder(a) - periodOrder(b)
)

// ============ 时段划分 ============
// 早自习 2 节 + 上午 6 节 + 下午 6 节 + 晚自习 3 节，共 17 节
export interface TimeSegment {
  key: string          // 时段标识（下拉 value）
  label: string        // 显示文案：早自习/上午/下午/晚自习
  periods: number[]    // 该时段包含的节次（按显示顺序）
  minRows: number      // 课表总览保底行数
}

export const TIME_SEGMENTS: TimeSegment[] = [
  { key: 'morning-study', label: '早自习', periods: [-1, -2], minRows: 1 },
  { key: 'am', label: '上午', periods: [1, 2, 3, 4, 5, 6], minRows: 4 },
  { key: 'pm', label: '下午', periods: [7, 8, 9, 10, 11, 12], minRows: 3 },
  { key: 'evening-study', label: '晚自习', periods: [13, 14, 15], minRows: 2 },
]

export function loadPeriodTimes(): Record<number, PeriodTime> {
  try {
    const raw = localStorage.getItem(PERIOD_TIME_STORAGE)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, PeriodTime>
    const merged: Record<number, PeriodTime> = {}
    for (const k of Object.keys(parsed)) {
      const nk = Number(k)
      if (!Number.isNaN(nk)) merged[nk] = parsed[k]
    }
    return merged
  } catch {
    return {}
  }
}

// 单节次时间文案：“08:30-09:10”，无则返回空串
export function formatPeriodTime(t?: PeriodTime): string {
  if (!t) return ''
  if (t.start && t.end) return `${t.start}-${t.end}`
  return t.start || t.end || ''
}

// 解析调课提醒中的节次文本为全局节次编号数组。
// 支持："1、2节" "3-4节" "下午1、2节" "上午第3节" "晚自习1" "早自习2" 等。
// 全局编号：早自习N=-N；上午1~6节=1~6；下午第N节=N+6；晚自习N=12+N。
export function parsePeriodText(text: string): number[] {
  if (!text) return []
  const t = text.replace(/\s+/g, '').replace(/第/g, '')
  let offset = 0
  let negative = false
  let evening = false
  if (t.includes('早自习')) negative = true
  else if (t.includes('下午')) offset = 6
  else if (t.includes('晚自习')) evening = true

  const nums: number[] = []
  // 先提取范围（如 3-4、3~4、3至4）
  const rest = t.replace(/(\d+)[-~至](\d+)/g, (_m, a, b) => {
    const s = Number(a), e = Number(b)
    for (let i = s; i <= e && i - s < 15; i++) nums.push(i)
    return ''
  })
  // 再提取剩余的单个数字（列举，如 1、2 或 1,2）
  const listRe = /\d+/g
  let m: RegExpExecArray | null
  while ((m = listRe.exec(rest)) !== null) nums.push(Number(m[0]))

  return Array.from(new Set(nums))
    .map((n) => (negative ? -n : evening ? 12 + n : n + offset))
    .filter((p) => p >= -2 && p <= 15 && p !== 0)
}

function loadSlots(): TimetableSlot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return dedupeSlots(arr)
  } catch {
    return []
  }
}

// 清理重复课程：同一星期+节次+课程+班级+教室视为重复，仅保留首条。
// 用于自愈此前 StrictMode 双调用 bug 产生的重复数据。
function dedupeSlots(slots: TimetableSlot[]): TimetableSlot[] {
  const seen = new Set<string>()
  const result: TimetableSlot[] = []
  for (const s of slots) {
    const k = `${s.weekday}|${s.period}|${s.courseName}|${s.className}|${s.room}`
    if (seen.has(k)) continue
    seen.add(k)
    result.push(s)
  }
  if (result.length !== slots.length) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(result)) } catch { /* ignore */ }
  }
  return result
}

function saveSlots(slots: TimetableSlot[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slots))
  window.dispatchEvent(new CustomEvent('timetable-updated'))
}

export function useTimetable() {
  // 惰性初始化：首渲染即从 localStorage 载入，保证 state 不会处于“空但 LS 有数据”的中间态，
  // 避免 StrictMode 双调用更新函数时 loadSlots() 兜底读到已写入数据导致重复添加。
  const [slots, setSlots] = useState<TimetableSlot[]>(() => loadSlots())

  useEffect(() => {
    const handler = () => setSlots(loadSlots())
    window.addEventListener('timetable-updated', handler)
    return () => window.removeEventListener('timetable-updated', handler)
  }, [])

  // 内容去重键：同一星期+节次+课程+班级+教室视为重复
  const slotKey = (s: Omit<TimetableSlot, 'id'>) => `${s.weekday}|${s.period}|${s.courseName}|${s.className}|${s.room}`

  const addSlot = useCallback((slot: Omit<TimetableSlot, 'id'>) => {
    setSlots((prev) => {
      const key = slotKey(slot)
      // 去重保护：已存在相同内容则不再添加（幂等，StrictMode 双调用也安全）
      if (prev.some((s) => slotKey(s) === key)) return prev
      const updated = [...prev, { ...slot, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }]
        .sort((a, b) => a.weekday - b.weekday || periodOrder(a.period) - periodOrder(b.period))
      saveSlots(updated)
      return updated
    })
  }, [])

  const addSlotsBatch = useCallback((slotList: Omit<TimetableSlot, 'id'>[]) => {
    setSlots((prev) => {
      const seen = new Set(prev.map(slotKey))
      const toAdd = slotList
        .filter((s) => {
          const k = slotKey(s)
          if (seen.has(k)) return false
          seen.add(k) // 批次内部去重
          return true
        })
        .map((s) => ({ ...s, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }))
      if (toAdd.length === 0) return prev
      const updated = [...prev, ...toAdd]
        .sort((a, b) => a.weekday - b.weekday || periodOrder(a.period) - periodOrder(b.period))
      saveSlots(updated)
      return updated
    })
  }, [])

  const deleteSlot = useCallback((id: string) => {
    setSlots((prev) => {
      const updated = prev.filter((s) => s.id !== id)
      saveSlots(updated)
      return updated
    })
  }, [])

  const getSlotsByWeekday = useCallback(
    (weekday: number) => slots.filter((s) => s.weekday === weekday).sort((a, b) => periodOrder(a.period) - periodOrder(b.period)),
    [slots]
  )

  // 仅清除所有课程数据；保留节次时间设置（xianren-period-times 不受影响）
  const clearAllSlots = useCallback(() => {
    // 仅在确有课程时写入空数组，避免误覆盖；节次时间键独立，不在此处处理
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    window.dispatchEvent(new CustomEvent('timetable-updated'))
    setSlots([])
  }, [])

  // 仅清除节次时间设置数据（xianren-period-times）；不影响课程。返回空记录供组件同步 state
  const clearPeriodTimes = useCallback((): Record<number, PeriodTime> => {
    localStorage.removeItem(PERIOD_TIME_STORAGE)
    return {}
  }, [])

  return { slots, addSlot, addSlotsBatch, deleteSlot, getSlotsByWeekday, clearAllSlots, clearPeriodTimes }
}
