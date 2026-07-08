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

// 跨多节（“X节连上”）的显示文案
export function formatPeriodRange(a: number, b: number): string {
  if (a >= 1 && b <= 12) return `${a}–${b}节`
  if (a < 0 && b < 0) return `早自习${-a}-${-b}`
  if (a > 12 && b > 12) return `${a - 12}-${b - 12}`
  return `${formatPeriodLabel(a)}–${formatPeriodLabel(b)}`
}

// ============ 每节课时间 ============
export interface PeriodTime {
  start: string
  end: string
}

const PERIOD_TIME_STORAGE = 'xianren-period-times'

// 时间不预设默认值：每个学校不同，由用户在录入页下半部分自行填写。

// 所有可配置时间的节次（按显示顺序）
export const TIME_EDIT_PERIODS: number[] = [-2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].sort(
  (a, b) => periodOrder(a) - periodOrder(b)
)

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

function loadSlots(): TimetableSlot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return normalizeLegacyEarlySelfStudy(arr)
  } catch {
    return []
  }
}

// 修正旧版 bug：选“早自习 + N节连上”时第二节被存成 period 0/1/...（第0节、第1节），
// 正确应为 早自习1=-1, 早自习2=-2 …。仅当某课程组含 早自习1(-1) 且同时含 >=0 的节次时才修正。
function normalizeLegacyEarlySelfStudy(slots: TimetableSlot[]): TimetableSlot[] {
  // 按课程身份(星期+课程名+班级+教室)分组：旧 bug 只把 period===-1 的放进组，
  // 导致第二节(period>=0)漏出、分组永远不含 >=0 而不修正。这里把整组同课程都纳入。
  const groups = new Map<string, TimetableSlot[]>()
  for (const s of slots) {
    const key = `${s.weekday}|${s.courseName}|${s.className}|${s.room}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(s)
  }
  const needFix = new Set<string>()
  for (const arr of groups.values()) {
    const hasAnchor = arr.some((s) => s.period === -1)
    const hasBad = arr.some((s) => s.period >= 0)
    if (hasAnchor && hasBad) arr.forEach((s) => needFix.add(s.id))
  }
  if (needFix.size === 0) return slots
  return slots.map((s) => (needFix.has(s.id) ? { ...s, period: -s.period - 2 } : s))
}

function saveSlots(slots: TimetableSlot[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slots))
  window.dispatchEvent(new CustomEvent('timetable-updated'))
}

export function useTimetable() {
  const [slots, setSlots] = useState<TimetableSlot[]>([])

  useEffect(() => {
    setSlots(loadSlots())
    const handler = () => setSlots(loadSlots())
    window.addEventListener('timetable-updated', handler)
    return () => window.removeEventListener('timetable-updated', handler)
  }, [])

  const addSlot = useCallback((slot: Omit<TimetableSlot, 'id'>) => {
    setSlots((prev) => {
      // prev 可能在 HMR/重载后为空，先用 localStorage 兜底，避免覆盖已有课程
      const base = prev.length > 0 ? prev : loadSlots()
      const updated = [...base, { ...slot, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }]
        .sort((a, b) => a.weekday - b.weekday || periodOrder(a.period) - periodOrder(b.period))
      saveSlots(updated)
      return updated
    })
  }, [])

  const addSlotsBatch = useCallback((slotList: Omit<TimetableSlot, 'id'>[]) => {
    setSlots((prev) => {
      // prev 可能在 HMR/重载后为空，先用 localStorage 兜底，避免覆盖已有课程
      const base = prev.length > 0 ? prev : loadSlots()
      const newSlots = slotList.map((s) => ({ ...s, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }))
      const updated = [...base, ...newSlots]
        .sort((a, b) => a.weekday - b.weekday || periodOrder(a.period) - periodOrder(b.period))
      saveSlots(updated)
      return updated
    })
  }, [])

  const deleteSlot = useCallback((id: string) => {
    setSlots((prev) => {
      // prev 可能在 HMR/重载后为空，先用 localStorage 兜底，避免误清空全部课程
      const base = prev.length > 0 ? prev : loadSlots()
      const updated = base.filter((s) => s.id !== id)
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

  return { slots, addSlot, addSlotsBatch, deleteSlot, getSlotsByWeekday, clearAllSlots }
}
