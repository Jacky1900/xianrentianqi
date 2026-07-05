import { Solar } from 'lunar-javascript'

export interface LunarDayInfo {
  lunarDay: string       // 农历日，如"初一"、"十五"
  lunarMonth: string     // 农历月，如"正月"、"二月"
  lunarMonthDay: string  // 农历月日组合，如"正月十五"、"初五"
  festival: string       // 农历节日，如"春节"、"中秋"，无则为空
  solarFestival: string  // 公历节日，如"元旦"、"国庆"，无则为空
  jieQi: string          // 节气，如"立春"、"雨水"，无则为空
  isHoliday: boolean     // 是否为法定节假日
}

// 公历固定节日
const SOLAR_FESTIVALS: Record<string, string> = {
  '1-1': '元旦',
  '2-14': '情人节',
  '3-8': '妇女节',
  '3-12': '植树节',
  '4-1': '愚人节',
  '5-1': '劳动节',
  '5-4': '青年节',
  '6-1': '儿童节',
  '7-1': '建党节',
  '8-1': '建军节',
  '9-10': '教师节',
  '10-1': '国庆节',
  '12-24': '平安夜',
  '12-25': '圣诞节',
}

// 法定节假日（公历）
const SOLAR_HOLIDAYS: Record<string, boolean> = {
  '1-1': true,  // 元旦
  '5-1': true,  // 劳动节
  '10-1': true, // 国庆节
}

// 农历节日
const LUNAR_FESTIVALS: Record<string, string> = {
  '1-1': '春节',
  '1-15': '元宵',
  '2-2': '龙抬头',
  '5-5': '端午',
  '7-7': '七夕',
  '7-15': '中元',
  '8-15': '中秋',
  '9-9': '重阳',
  '12-8': '腊八',
  '12-30': '除夕',  // 小月时为29
  '12-29': '除夕',
}

// 农历法定节假日
const LUNAR_HOLIDAYS: Record<string, boolean> = {
  '1-1': true,  // 春节
  '5-5': true,  // 端午
  '8-15': true, // 中秋
}

export function getLunarDayInfo(year: number, month: number, day: number): LunarDayInfo {
  const solar = Solar.fromYmd(year, month, day)
  const lunar = solar.getLunar()

  const lunarMonthNum = lunar.getMonth()
  const lunarDayNum = lunar.getDay()

  const lunarDay = lunar.getDayInChinese()
  const lunarMonth = lunar.getMonthInChinese()

  // 初一显示月名，其他显示日
  const lunarMonthDay = lunarDayNum === 1
    ? `${lunarMonth}月`
    : lunarDay

  // 农历节日
  const lunarKey = `${lunarMonthNum}-${lunarDayNum}`
  const festival = LUNAR_FESTIVALS[lunarKey] || ''

  // 公历节日
  const solarKey = `${month}-${day}`
  const solarFestival = SOLAR_FESTIVALS[solarKey] || ''

  // 节气
  const jieQi = lunar.getJieQi() || ''

  // 是否法定节假日
  const isHoliday = SOLAR_HOLIDAYS[solarKey] || LUNAR_HOLIDAYS[lunarKey] || false

  return {
    lunarDay,
    lunarMonth,
    lunarMonthDay,
    festival,
    solarFestival,
    jieQi,
    isHoliday,
  }
}

// 获取日期格子要显示的文字（优先级：节日 > 节气 > 农历日）
export function getCellLabel(info: LunarDayInfo): string {
  if (info.festival) return info.festival
  if (info.solarFestival) return info.solarFestival
  if (info.jieQi) return info.jieQi
  return info.lunarMonthDay
}

// 是否为特殊日（节日/节气/假日）
export function isSpecialDay(info: LunarDayInfo): boolean {
  return !!(info.festival || info.solarFestival || info.jieQi || info.isHoliday)
}
