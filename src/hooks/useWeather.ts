import { useState, useEffect, useRef, useCallback } from 'react'
import type { WeatherIconName } from '../components/WeatherIcon'

// uapis.cn weather_code 映射到图标和中文标签
// weather_code 参考值：https://uapis.cn/docs
const weatherCodeMap: Record<string, { label: string; icon: WeatherIconName }> = {
  // 晴
  '0': { label: '晴', icon: 'clear' },
  '1': { label: '晴', icon: 'clear' },
  '2': { label: '晴间多云', icon: 'partly-cloudy' },
  '3': { label: '多云', icon: 'partly-cloudy' },
  '4': { label: '阴', icon: 'overcast' },
  '5': { label: '阴', icon: 'overcast' },
  // 特殊天气
  '6': { label: '雾', icon: 'fog' },
  '7': { label: '霾', icon: 'fog' },
  '8': { label: '沙尘', icon: 'fog' },
  '9': { label: '雾', icon: 'fog' },
  // 雨
  '10': { label: '小雨', icon: 'drizzle' },
  '11': { label: '小雨', icon: 'drizzle' },
  '12': { label: '中雨', icon: 'rain' },
  '13': { label: '大雨', icon: 'heavy-rain' },
  '14': { label: '阵雨', icon: 'showers' },
  '15': { label: '雷阵雨', icon: 'thunderstorm' },
  '16': { label: '雷阵雨伴有冰雹', icon: 'thunderstorm-hail' },
  '17': { label: '暴雨', icon: 'heavy-rain' },
  '18': { label: '大暴雨', icon: 'heavy-rain' },
  '19': { label: '冻雨', icon: 'freezing-rain' },
  // 雪
  '20': { label: '小雪', icon: 'snow' },
  '21': { label: '中雪', icon: 'snow' },
  '22': { label: '大雪', icon: 'heavy-snow' },
  '23': { label: '雨夹雪', icon: 'sleet' },
  '24': { label: '阵雪', icon: 'snow' },
  '25': { label: '暴雪', icon: 'heavy-snow' },
  // 综合
  '26': { label: '阴', icon: 'overcast' },
  '27': { label: '多云', icon: 'partly-cloudy' },
  '28': { label: '阴转晴', icon: 'overcast' },
  '29': { label: '多云转晴', icon: 'partly-cloudy' },
  '30': { label: '晴转多云', icon: 'partly-cloudy' },
  '31': { label: '晴转阴', icon: 'partly-cloudy' },
  '32': { label: '多云转阴', icon: 'overcast' },
  '33': { label: '阴转小雨', icon: 'overcast' },
  '34': { label: '多云转小雨', icon: 'partly-cloudy' },
  '35': { label: '晴转小雨', icon: 'partly-cloudy' },
  '36': { label: '小雨转中雨', icon: 'rain' },
  '37': { label: '小雨转大雨', icon: 'rain' },
  '38': { label: '中雨转大雨', icon: 'heavy-rain' },
  '39': { label: '大雨转暴雨', icon: 'heavy-rain' },
  '40': { label: '阴转小雪', icon: 'overcast' },
  '41': { label: '多云转小雪', icon: 'partly-cloudy' },
  '42': { label: '晴转小雪', icon: 'partly-cloudy' },
  '43': { label: '小雪转中雪', icon: 'snow' },
  '44': { label: '小雪转大雪', icon: 'snow' },
  '45': { label: '中雪转大雪', icon: 'heavy-snow' },
  '49': { label: '雷阵雨转冰雹', icon: 'thunderstorm-hail' },
  '50': { label: '雾转多云', icon: 'fog' },
  '51': { label: '雾转晴', icon: 'fog' },
  '53': { label: '霾转多云', icon: 'fog' },
  '54': { label: '霾转晴', icon: 'fog' },
  '55': { label: '沙尘转多云', icon: 'fog' },
  '56': { label: '沙尘转晴', icon: 'fog' },
  '57': { label: '小雨转阴', icon: 'drizzle' },
  '58': { label: '小雨转多云', icon: 'drizzle' },
  '59': { label: '小雨转晴', icon: 'drizzle' },
  '60': { label: '中雨转阴', icon: 'rain' },
  '61': { label: '中雨转多云', icon: 'rain' },
  '62': { label: '中雨转晴', icon: 'rain' },
  '63': { label: '大雨转阴', icon: 'heavy-rain' },
  '64': { label: '大雨转多云', icon: 'heavy-rain' },
  '65': { label: '大雨转晴', icon: 'heavy-rain' },
  '66': { label: '暴雨转阴', icon: 'heavy-rain' },
  '67': { label: '暴雨转多云', icon: 'heavy-rain' },
  '68': { label: '暴雨转晴', icon: 'heavy-rain' },
  '69': { label: '雷阵雨转阴', icon: 'thunderstorm' },
  '70': { label: '雷阵雨转多云', icon: 'thunderstorm' },
  '71': { label: '雷阵雨转晴', icon: 'thunderstorm' },
  '72': { label: '小雪转阴', icon: 'snow' },
  '73': { label: '小雪转多云', icon: 'snow' },
  '74': { label: '小雪转晴', icon: 'snow' },
  '75': { label: '中雪转阴', icon: 'snow' },
  '76': { label: '中雪转多云', icon: 'snow' },
  '77': { label: '中雪转晴', icon: 'snow' },
  '78': { label: '大雪转阴', icon: 'heavy-snow' },
  '79': { label: '大雪转多云', icon: 'heavy-snow' },
  '80': { label: '大雪转晴', icon: 'heavy-snow' },
  '81': { label: '雨夹雪转阴', icon: 'sleet' },
  '82': { label: '雨夹雪转多云', icon: 'sleet' },
  '83': { label: '雨夹雪转晴', icon: 'sleet' },
  '84': { label: '冻雨转阴', icon: 'freezing-rain' },
  '85': { label: '冻雨转多云', icon: 'freezing-rain' },
  '86': { label: '冻雨转晴', icon: 'freezing-rain' },
  '87': { label: '阵雨转多云', icon: 'showers' },
  '88': { label: '阵雨转晴', icon: 'showers' },
  '89': { label: '阵雪转多云', icon: 'snow' },
  '90': { label: '阵雪转晴', icon: 'snow' },
  '91': { label: '阴转阵雨', icon: 'overcast' },
  '92': { label: '多云转阵雨', icon: 'partly-cloudy' },
  '93': { label: '晴转阵雨', icon: 'partly-cloudy' },
  '94': { label: '阴转阵雪', icon: 'overcast' },
  '95': { label: '多云转阵雪', icon: 'partly-cloudy' },
  '96': { label: '晴转阵雪', icon: 'partly-cloudy' },
}

export interface CurrentWeather {
  temperature: number
  apparentTemperature: number
  humidity: number
  windSpeed: string
  uvIndex: number
  weatherCode: number
  weatherLabel: string
  weatherIcon: WeatherIconName
  aqiLevel: number
  aqiCategory: string
  aqiPrimary: string
}

export interface DailyForecast {
  date: string
  weekday: string
  weatherCode: number
  weatherLabel: string
  weatherIcon: WeatherIconName
  tempMax: number
  tempMin: number
}

export interface HourlyForecast {
  time: string
  hour: string
  temperature: number
  weatherLabel: string
  weatherIcon: WeatherIconName
  precipitationProb: number
}

export interface WeatherAlert {
  title: string
  type: string
  level: string
  text: string
  publishTime: string
}

export interface WeatherData {
  current: CurrentWeather | null
  daily: DailyForecast[]
  hourly: HourlyForecast[]
  alerts: WeatherAlert[]
  loading: boolean
  error: string | null
  city: string
  refresh: () => void
  changeCity: (city: string) => void
}

function getWeatherInfo(code: string) {
  return weatherCodeMap[String(code)] || { label: '未知', icon: 'cloudy' as WeatherIconName }
}

// 按天气文字（如"小雨"、"多云"）映射到图标
// 注意：长关键词在前，通配关键词（"雨"、"雪"）在最后兜底
const weatherTextMap: { keyword: string; icon: WeatherIconName }[] = [
  { keyword: '雷阵雨伴有冰雹', icon: 'thunderstorm-hail' },
  { keyword: '雷阵雨', icon: 'thunderstorm' },
  { keyword: '冻雨', icon: 'freezing-rain' },
  { keyword: '雨夹雪', icon: 'sleet' },
  { keyword: '暴雨', icon: 'heavy-rain' },
  { keyword: '大暴雨', icon: 'heavy-rain' },
  { keyword: '大雨', icon: 'heavy-rain' },
  { keyword: '中雨', icon: 'rain' },
  { keyword: '阵雨', icon: 'showers' },
  { keyword: '小雨', icon: 'drizzle' },
  { keyword: '暴雪', icon: 'heavy-snow' },
  { keyword: '大雪', icon: 'heavy-snow' },
  { keyword: '中雪', icon: 'snow' },
  { keyword: '阵雪', icon: 'snow' },
  { keyword: '小雪', icon: 'snow' },
  // 通配兜底：API可能返回单个"雨"或"雪"字
  { keyword: '雨', icon: 'rain' },
  { keyword: '雪', icon: 'snow' },
  { keyword: '沙尘', icon: 'fog' },
  { keyword: '霾', icon: 'fog' },
  { keyword: '雾', icon: 'fog' },
  { keyword: '阴', icon: 'overcast' },
  { keyword: '多云', icon: 'partly-cloudy' },
  { keyword: '晴', icon: 'clear' },
]

function getWeatherIconByText(text: string): WeatherIconName {
  for (const item of weatherTextMap) {
    if (text.includes(item.keyword)) return item.icon
  }
  return 'cloudy'
}

function formatDate(dateStr: string): { weekday: string; date: string } {
  const date = new Date(dateStr)
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  let weekday: string
  if (diffDays === 0) weekday = '今天'
  else if (diffDays === 1) weekday = '明天'
  else weekday = weekDays[date.getDay()]

  const m = date.getMonth() + 1
  const d = date.getDate()
  return { weekday, date: `${m}/${d}` }
}


export function useWeather(initialCity = ''): WeatherData {
  const [cityParam, setCityParam] = useState(initialCity)
  const [data, setData] = useState<WeatherData>({
    current: null,
    daily: [],
    hourly: [],
    alerts: [],
    loading: true,
    error: null,
    city: initialCity || '正在定位…',
    refresh: () => {},
    changeCity: () => {},
  })

  const fetchWeatherRef = useRef<(silent?: boolean) => void>(() => {})

  useEffect(() => {
    const fetchWeather = async (silent = false) => {
      try {
        if (!silent) setData((prev) => ({ ...prev, loading: true }))
        // 构建 API URL：免费、无需注册
        // 不传 city/adcode → 自动按 IP 定位
        const baseUrl = 'https://uapis.cn/api/v1/misc/weather'
        const params = new URLSearchParams({
          extended: 'true',
          forecast: 'true',
          hourly: 'true',
          lang: 'zh',
        })
        if (cityParam) params.set('city', cityParam)

        const url = `${baseUrl}?${params.toString()}`
        const res = await fetch(url)
        if (!res.ok) throw new Error('天气数据请求失败')

        const json = await res.json()

        // 解析当前天气：图标根据文字映射，与逐时/逐日预报逻辑一致
        const weatherText = json.weather ?? '未知'
        const currentWeather: CurrentWeather = {
          temperature: json.temperature ?? 0,
          apparentTemperature: json.feels_like ?? json.apparent_temperature ?? json.temperature ?? 0,
          humidity: json.humidity ?? 0,
          windSpeed: `${json.wind_direction ?? ''} ${json.wind_power ?? json.wind_force ?? ''}`.trim(),
          uvIndex: json.uv_index ?? json.uv ?? 0,
          weatherCode: Number(json.weather_code ?? 0),
          weatherLabel: weatherText,
          weatherIcon: getWeatherIconByText(weatherText),
          aqiLevel: json.aqi_quality_num ?? json.aqi_level ?? 0,
          aqiCategory: json.aqi_quality ?? json.aqi_category ?? '',
          aqiPrimary: json.aqi_primary ?? '',
        }

        // 解析7天预报（API 返回字段：temp_max, temp_min, weather_day, weather_night）
        const forecasts: DailyForecast[] = (json.forecast ?? []).map((day: any) => {
          const weatherText = day.weather_day ?? day.weather ?? '未知'
          const { weekday, date } = formatDate(day.date)
          return {
            date,
            weekday,
            weatherCode: Number(json.weather_code ?? 0),
            weatherLabel: weatherText,
            weatherIcon: getWeatherIconByText(weatherText),
            tempMax: day.temp_max ?? day.temp_high ?? 0,
            tempMin: day.temp_min ?? day.temp_low ?? 0,
          }
        })

        // 解析24小时逐时预报（API 返回字段名：hourly_forecast）
        const hourlyData: HourlyForecast[] = (json.hourly_forecast ?? json.hourly ?? []).map((h: any) => {
          const weatherText = h.weather ?? '未知'
          // 提取小时，如 "2026-07-01 18:25:08" → "18时"
          const hourMatch = (h.time ?? '').match(/(\d{2}):\d{2}/)
          const hour = hourMatch ? `${hourMatch[1]}时` : '--'
          return {
            time: h.time ?? '',
            hour,
            temperature: h.temperature ?? 0,
            weatherLabel: weatherText,
            weatherIcon: getWeatherIconByText(weatherText),
            precipitationProb: h.pop ?? h.precipitation_probability ?? 0,
          }
        })

        // 解析天气预警（API 返回字段：alerts，含 title/type/level/text/publish_time）
        const alerts: WeatherAlert[] = (json.alerts ?? []).map((a: any) => ({
          title: a.title ?? '',
          type: a.type ?? '',
          level: a.level ?? '',
          text: a.text ?? '',
          publishTime: a.publish_time ?? '',
        }))

        // 城市名显示逻辑：优先district（区级精确定位），其次city，最后fallback
        const displayCity = json.district || json.city || cityParam || '未知'

        setData({
          current: currentWeather,
          daily: forecasts,
          hourly: hourlyData,
          alerts,
          loading: false,
          error: null,
          city: displayCity,
        })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '未知错误'
        setData((prev) => ({ ...prev, loading: false, error: message }))
      }
    }

    fetchWeatherRef.current = fetchWeather
    fetchWeather()
    const interval = setInterval(() => fetchWeather(true), 15 * 60 * 1000) // 每15分钟静默刷新
    return () => clearInterval(interval)
  }, [cityParam])

  const refresh = useCallback(() => {
    fetchWeatherRef.current(true)
  }, [])

  const changeCity = useCallback((city: string) => {
    setCityParam(city)
  }, [])

  return { ...data, refresh, changeCity }
}
