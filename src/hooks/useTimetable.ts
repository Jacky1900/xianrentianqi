import { useState, useEffect, useCallback } from 'react'

export interface TimetableSlot {
  id: string
  weekday: number      // 1=周一 ... 7=周日
  period: number       // 第几节
  className: string    // 班级
  courseName: string   // 课程名称
}

const STORAGE_KEY = 'xianren-timetable'

function loadSlots(): TimetableSlot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
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
      const updated = [...prev, { ...slot, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }]
        .sort((a, b) => a.weekday - b.weekday || a.period - b.period)
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
    (weekday: number) => slots.filter((s) => s.weekday === weekday).sort((a, b) => a.period - b.period),
    [slots]
  )

  return { slots, addSlot, deleteSlot, getSlotsByWeekday }
}
