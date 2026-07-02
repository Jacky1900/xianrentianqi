import { useState, useEffect, useCallback } from 'react'

export interface Schedule {
  id: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  title: string
  done: boolean
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
}

export function useSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([])

  useEffect(() => {
    setSchedules(loadSchedules())
  }, [])

  const addSchedule = useCallback((date: string, time: string, title: string) => {
    const newSchedule: Schedule = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date,
      time,
      title,
      done: false,
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

  return { schedules, addSchedule, toggleDone, deleteSchedule, getSchedulesByDate }
}
