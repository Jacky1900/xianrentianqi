import { useState, useEffect, useCallback } from 'react'

export type Urgency = 'urgent' | 'important' | 'normal'

export interface Schedule {
  id: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  title: string
  done: boolean
  urgency: Urgency
}

const STORAGE_KEY = 'xianren-calendar-schedules'

function loadSchedules(): Schedule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function saveSchedules(schedules: Schedule[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules))
  // 通知其他实例刷新
  window.dispatchEvent(new CustomEvent('schedules-updated'))
}

export function useSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([])

  useEffect(() => {
    setSchedules(loadSchedules())
    // 监听其他实例的保存事件，自动刷新
    const handler = () => setSchedules(loadSchedules())
    window.addEventListener('schedules-updated', handler)
    return () => window.removeEventListener('schedules-updated', handler)
  }, [])

  const addSchedule = useCallback((date: string, time: string, title: string, urgency: Urgency) => {
    const newSchedule: Schedule = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date,
      time,
      title,
      done: false,
      urgency,
    }
    setSchedules((prev) => {
      const updated = [...prev, newSchedule].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date)
        return a.time.localeCompare(b.time)
      })
      saveSchedules(updated)
      return updated
    })
  }, [])

  const toggleDone = useCallback((id: string) => {
    setSchedules((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s))
      saveSchedules(updated)
      return updated
    })
  }, [])

  const deleteSchedule = useCallback((id: string) => {
    setSchedules((prev) => {
      const updated = prev.filter((s) => s.id !== id)
      saveSchedules(updated)
      return updated
    })
  }, [])

  const getSchedulesByDate = useCallback(
    (date: string) => schedules.filter((s) => s.date === date),
    [schedules]
  )

  // 获取某日最紧急的未完成日程
  const getTopUrgencyByDate = useCallback(
    (date: string): Schedule | null => {
      const daySchedules = schedules
        .filter((s) => s.date === date && !s.done)
        .sort((a, b) => {
          const order = { urgent: 0, important: 1, normal: 2 } as Record<Urgency, number>
          if (order[a.urgency] !== order[b.urgency]) return order[a.urgency] - order[b.urgency]
          return a.time.localeCompare(b.time)
        })
      return daySchedules[0] || null
    },
    [schedules]
  )

  // 获取某日已到时间的未完成日程（用于闪烁提醒）
  const getDueSchedules = useCallback(
    (date: string, currentTime: string): Schedule[] => {
      return schedules.filter(
        (s) => s.date === date && !s.done && s.time <= currentTime
      )
    },
    [schedules]
  )

  return { schedules, addSchedule, toggleDone, deleteSchedule, getSchedulesByDate, getTopUrgencyByDate, getDueSchedules }
}
