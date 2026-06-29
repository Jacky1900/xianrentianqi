import { useState, useEffect } from 'react'

// WMO 天气代码对照表
const weatherCodes: Record<number, { label: string; icon: string }> = {
  0: { label: '晴天', icon: '☀️' },
  1: { label: '大部晴朗', icon: '🌤️' },
  2: { label: '多云', icon: '⛅' },
  3: { label: '阴天', icon: '☁️' },
  45: { label: '雾', icon: '🌫️' },
  48: { label: '雾凇', icon: '🌫️' },
  51: { label: '小毛毛雨', icon: '🌦️' },
  53: { label: '毛毛雨', icon: '🌦️' },
  55: { label: '大毛毛雨', icon: '🌧️' },
  56: { label: '冻毛毛雨', icon: '🌧️' },
  57: { label: '大冻毛毛雨', icon: '🌧️' },
  61: { label: '小雨', icon: '🌧️' },
  63: { label: '中雨', icon: '🌧️' },
  65: { label: '大雨', icon: '🌧️' },
  66: { label: '冻雨', icon: '🌧️' },
  67: { label: '大冻雨', icon: '🌧️' },
  71: { label: '小雪', icon: '🌨️' },
  73: { label: '中雪', icon: '🌨️' },
  75: { label: '大雪', icon: '❄️' },
  77: { label: '雪粒', icon: '🌨️' },
  80: { label: '阵雨', icon: '🌦️' },
  81: { label: '中阵雨', icon: '🌧️' },
  82: { label: '大阵雨', icon: '🌧️' },
  85: { label: '小阵雪', icon: '🌨️' },
  86: { label: '大阵雪', icon: '❄️' },
  95: { label: '雷暴', icon: '⛈️' },
  96: { label: '雷暴伴小冰雹', icon: '⛈️' },
  99: { label: '雷暴伴大冰雹', icon: '⛈️' },
}

export interface CurrentWeather {
  temperature: number
  apparentTemperature: number
  humidity: number
  windSpeed: number
  weatherCode: number
  weatherLabel: string
  weatherIcon: string
}

export interface DailyForecast {
  date: string
  weatherCode: number
  weatherLabel: string
  weatherIcon: string
  tempMax: number
  tempMin: number
}

export interface WeatherData {
  current: CurrentWeather | null
  daily: DailyForecast[]
  loading: boolean
  error: string | null
  city: string
}

function getWeatherInfo(code: number) {
  return weatherCodes[code] || { label: '未知', icon: '❓' }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const day = weekDays[date.getDay()]
  const m = date.getMonth() + 1
  const d = date.getDate()
  return `${day} ${m}/${d}`
}

export function useWeather(lat = 29.56, lon = 106.55): WeatherData {
  const [data, setData] = useState<WeatherData>({
    current: null,
    daily: [],
    loading: true,
    error: null,
    city: '重庆',
  })

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia/Shanghai&forecast_days=7`
        const res = await fetch(url)
        if (!res.ok) throw new Error('天气数据请求失败')

        const json = await res.json()
        const current = json.current
        const daily = json.daily

        const currentInfo = getWeatherInfo(current.weather_code)
        const currentWeather: CurrentWeather = {
          temperature: Math.round(current.temperature_2m),
          apparentTemperature: Math.round(current.apparent_temperature),
          humidity: current.relative_humidity_2m,
          windSpeed: Math.round(current.wind_speed_10m),
          weatherCode: current.weather_code,
          weatherLabel: currentInfo.label,
          weatherIcon: currentInfo.icon,
        }

        const forecasts: DailyForecast[] = daily.time.map((date: string, i: number) => {
          const code = daily.weather_code[i]
          const info = getWeatherInfo(code)
          return {
            date: formatDate(date),
            weatherCode: code,
            weatherLabel: info.label,
            weatherIcon: info.icon,
            tempMax: Math.round(daily.temperature_2m_max[i]),
            tempMin: Math.round(daily.temperature_2m_min[i]),
          }
        })

        setData({
          current: currentWeather,
          daily: forecasts,
          loading: false,
          error: null,
          city: '重庆',
        })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '未知错误'
        setData((prev) => ({ ...prev, loading: false, error: message }))
      }
    }

    fetchWeather()
    const interval = setInterval(fetchWeather, 30 * 60 * 1000) // 每30分钟刷新
    return () => clearInterval(interval)
  }, [lat, lon])

  return data
}
