import { useState, useEffect, useCallback } from 'react'

export type Urgency = 'urgent' | 'important' | 'normal'
export type ScheduleType = 'normal' | 'swap'

export interface SwapInfo {
  // 自己的课程信息
  myDate: string         // 自己课程日期 MM-DD
  myPeriod: string       // 自己第几节课
  myClass: string        // 自己班级
  myCourse: string       // 自己课程名称
  // 对方的课程信息
  teacher: string        // 对方教师姓名
  theirDate: string      // 对方课程日期 MM-DD
  theirPeriod: string    // 对方第几节课
  theirClass: string     // 对方班级
  theirCourse: string    // 对方课程名称
  remark: string         // 调课备注
  // 提醒时间 - 自己
  remindMonth: number    // 提醒月份
  remindDay: number      // 提醒日期
  remindHour: number     // 提醒小时
  remindMinute: number   // 提醒分钟
  // 提醒时间 - 对方（教师）
  theirRemindMonth: number    // 对方提醒月份
  theirRemindDay: number      // 对方提醒日期
  theirRemindHour: number     // 对方提醒小时
  theirRemindMinute: number   // 对方提醒分钟
}

export interface Schedule {
  id: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  title: string
  done: boolean
  urgency: Urgency
  type?: ScheduleType       // 'normal' 默认, 'swap' 调课
  swapInfo?: SwapInfo       // 调课详细信息
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

  const addSchedule = useCallback(
    (date: string, time: string, title: string, urgency: Urgency, type?: ScheduleType, swapInfo?: SwapInfo) => {
      const newSchedule: Schedule = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        date,
        time,
        title,
        done: false,
        urgency,
        type: type || 'normal',
        swapInfo,
      }
      setSchedules((prev) => {
        const updated = [...prev, newSchedule].sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date)
          return a.time.localeCompare(b.time)
        })
        saveSchedules(updated)
        return updated
      })
    },
    []
  )

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
