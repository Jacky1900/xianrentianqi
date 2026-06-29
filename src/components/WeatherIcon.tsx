import React from 'react'

export type WeatherIconName =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'heavy-rain'
  | 'freezing-rain'
  | 'snow'
  | 'heavy-snow'
  | 'showers'
  | 'sleet'
  | 'thunderstorm'
  | 'thunderstorm-hail'

interface Props {
  name: WeatherIconName
  size?: number
}

// 配色方案 - 诺基亚 Lumia 天气风格
const COLORS = {
  sun: '#FFC107',       // 金黄色太阳
  sunGlow: '#FFD54F',   // 太阳光晕
  moon: '#E0E0E0',      // 月亮
  cloud: '#FFFFFF',     // 云朵
  cloudShadow: '#90A4AE', // 云朵阴影
  rain: '#4FC3F7',      // 雨滴
  snow: '#FFFFFF',      // 雪花
  lightning: '#FFEB3B', // 闪电
  fog: '#B0BEC5',       // 雾
  hail: '#B3E5FC',      // 冰雹
  stroke: '#FFFFFF',    // 默认描边
}

const WeatherIcon: React.FC<Props> = ({ name, size = 48 }) => {
  const c = COLORS
  const sw = 1.5

  const icons: Record<WeatherIconName, React.ReactNode> = {
    clear: (
      // 太阳：金色圆 + 光晕射线
      <g>
        <g stroke={c.sun} strokeWidth={sw + 0.5} strokeLinecap="round">
          <line x1="32" y1="4" x2="32" y2="12" />
          <line x1="32" y1="52" x2="32" y2="60" />
          <line x1="4" y1="32" x2="12" y2="32" />
          <line x1="52" y1="32" x2="60" y2="32" />
          <line x1="12" y1="12" x2="17" y2="17" />
          <line x1="47" y1="47" x2="52" y2="52" />
          <line x1="52" y1="12" x2="47" y2="17" />
          <line x1="17" y1="47" x2="12" y2="52" />
        </g>
        <circle cx="32" cy="32" r="13" fill={c.sun} />
        <circle cx="32" cy="32" r="13" fill="none" stroke={c.sunGlow} strokeWidth="0.8" opacity="0.6" />
      </g>
    ),
    'partly-cloudy': (
      // 金色太阳 + 白色云
      <g>
        <g stroke={c.sun} strokeWidth={sw} strokeLinecap="round" opacity="0.9">
          <line x1="22" y1="6" x2="22" y2="10" />
          <line x1="6" y1="22" x2="10" y2="22" />
          <line x1="10.5" y1="10.5" x2="13.5" y2="13.5" />
          <line x1="33.5" y1="10.5" x2="30.5" y2="13.5" />
        </g>
        <circle cx="22" cy="22" r="8" fill={c.sun} />
        <path
          d="M18 42 Q18 34 26 34 Q28 28 36 30 Q44 28 46 36 Q52 36 52 44 Q52 50 46 50 L22 50 Q16 50 18 42 Z"
          fill={c.cloud}
        />
        <path
          d="M18 42 Q18 34 26 34 Q28 28 36 30 Q44 28 46 36 Q52 36 52 44 Q52 50 46 50 L22 50 Q16 50 18 42 Z"
          fill={c.cloudShadow}
          opacity="0.2"
        />
      </g>
    ),
    cloudy: (
      // 两朵白云
      <g>
        <path
          d="M12 36 Q12 28 20 28 Q22 22 30 24 Q38 22 40 30 Q46 30 46 38 Q46 44 40 44 L16 44 Q10 44 12 36 Z"
          fill={c.cloud}
          opacity="0.5"
        />
        <path
          d="M18 44 Q18 36 26 36 Q28 30 36 32 Q44 30 46 38 Q52 38 52 46 Q52 52 46 52 L22 52 Q16 52 18 44 Z"
          fill={c.cloud}
        />
      </g>
    ),
    overcast: (
      // 厚云
      <g>
        <path
          d="M8 34 Q8 24 18 24 Q20 16 30 18 Q42 16 44 26 Q54 26 54 36 Q54 44 46 44 L12 44 Q4 44 8 34 Z"
          fill={c.cloudShadow}
          opacity="0.4"
        />
        <path
          d="M14 42 Q14 32 24 32 Q26 24 36 26 Q48 24 50 34 Q60 34 60 44 Q60 52 52 52 L18 52 Q10 52 14 42 Z"
          fill={c.cloud}
        />
      </g>
    ),
    fog: (
      // 云 + 雾线
      <g>
        <path
          d="M14 26 Q14 18 22 18 Q24 12 32 14 Q42 12 44 20 Q52 20 52 28 Q52 34 46 34 L18 34 Q12 34 14 26 Z"
          fill={c.fog}
          opacity="0.7"
        />
        <g stroke={c.fog} strokeWidth={sw} strokeLinecap="round" opacity="0.6">
          <line x1="10" y1="42" x2="52" y2="42" />
          <line x1="14" y1="48" x2="56" y2="48" />
          <line x1="12" y1="54" x2="48" y2="54" />
        </g>
      </g>
    ),
    drizzle: (
      // 云 + 小雨点
      <g>
        <path
          d="M14 26 Q14 16 24 16 Q26 10 34 12 Q44 10 46 18 Q54 18 54 26 Q54 32 48 32 L18 32 Q12 32 14 26 Z"
          fill={c.cloud}
        />
        <g fill={c.rain}>
          <circle cx="22" cy="42" r="1.8" />
          <circle cx="32" cy="46" r="1.8" />
          <circle cx="42" cy="42" r="1.8" />
          <circle cx="27" cy="52" r="1.8" />
          <circle cx="37" cy="52" r="1.8" />
        </g>
      </g>
    ),
    rain: (
      // 云 + 雨线
      <g>
        <path
          d="M14 24 Q14 14 24 14 Q26 8 34 10 Q44 8 46 16 Q54 16 54 24 Q54 30 48 30 L18 30 Q12 30 14 24 Z"
          fill={c.cloud}
        />
        <g stroke={c.rain} strokeWidth={sw + 0.3} strokeLinecap="round">
          <line x1="22" y1="36" x2="20" y2="46" />
          <line x1="32" y1="36" x2="30" y2="46" />
          <line x1="42" y1="36" x2="40" y2="46" />
          <line x1="27" y1="48" x2="25" y2="56" />
          <line x1="37" y1="48" x2="35" y2="56" />
        </g>
      </g>
    ),
    'heavy-rain': (
      // 云 + 大量雨线
      <g>
        <path
          d="M10 22 Q10 12 20 12 Q22 6 30 8 Q42 6 44 14 Q54 14 54 22 Q54 28 48 28 L14 28 Q8 28 10 22 Z"
          fill={c.cloud}
        />
        <g stroke={c.rain} strokeWidth={sw + 0.5} strokeLinecap="round">
          <line x1="18" y1="34" x2="15" y2="46" />
          <line x1="26" y1="34" x2="23" y2="46" />
          <line x1="34" y1="34" x2="31" y2="46" />
          <line x1="42" y1="34" x2="39" y2="46" />
          <line x1="50" y1="34" x2="47" y2="46" />
          <line x1="22" y1="48" x2="19" y2="60" />
          <line x1="30" y1="48" x2="27" y2="60" />
          <line x1="38" y1="48" x2="35" y2="60" />
          <line x1="46" y1="48" x2="43" y2="60" />
        </g>
      </g>
    ),
    'freezing-rain': (
      // 云 + 雨线 + 冰晶
      <g>
        <path
          d="M14 24 Q14 14 24 14 Q26 8 34 10 Q44 8 46 16 Q54 16 54 24 Q54 30 48 30 L18 30 Q12 30 14 24 Z"
          fill={c.cloud}
        />
        <g stroke={c.rain} strokeWidth={sw} strokeLinecap="round">
          <line x1="22" y1="36" x2="20" y2="44" />
          <line x1="42" y1="36" x2="40" y2="44" />
        </g>
        <g fill={c.hail}>
          <path d="M32 46 L34 50 L32 54 L30 50 Z" />
        </g>
        <g stroke={c.snow} strokeWidth={sw} strokeLinecap="round">
          <g transform="translate(32,50)">
            <line x1="-3" y1="0" x2="3" y2="0" />
            <line x1="0" y1="-3" x2="0" y2="3" />
          </g>
        </g>
      </g>
    ),
    snow: (
      // 云 + 雪花
      <g>
        <path
          d="M14 24 Q14 14 24 14 Q26 8 34 10 Q44 8 46 16 Q54 16 54 24 Q54 30 48 30 L18 30 Q12 30 14 24 Z"
          fill={c.cloud}
        />
        <g stroke={c.snow} strokeWidth={sw + 0.2} strokeLinecap="round">
          <g transform="translate(22,42)">
            <line x1="-4" y1="0" x2="4" y2="0" />
            <line x1="0" y1="-4" x2="0" y2="4" />
            <line x1="-3" y1="-3" x2="3" y2="3" />
            <line x1="-3" y1="3" x2="3" y2="-3" />
          </g>
          <g transform="translate(34,48)">
            <line x1="-4" y1="0" x2="4" y2="0" />
            <line x1="0" y1="-4" x2="0" y2="4" />
            <line x1="-3" y1="-3" x2="3" y2="3" />
            <line x1="-3" y1="3" x2="3" y2="-3" />
          </g>
          <g transform="translate(46,42)">
            <line x1="-4" y1="0" x2="4" y2="0" />
            <line x1="0" y1="-4" x2="0" y2="4" />
            <line x1="-3" y1="-3" x2="3" y2="3" />
            <line x1="-3" y1="3" x2="3" y2="-3" />
          </g>
        </g>
      </g>
    ),
    'heavy-snow': (
      // 厚云 + 大量雪花
      <g>
        <path
          d="M10 22 Q10 12 20 12 Q22 6 30 8 Q42 6 44 14 Q54 14 54 22 Q54 28 48 28 L14 28 Q8 28 10 22 Z"
          fill={c.cloud}
        />
        <g stroke={c.snow} strokeWidth={sw + 0.3} strokeLinecap="round">
          {[[20, 36], [32, 40], [44, 36], [26, 48], [38, 48], [32, 56]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x},${y})`}>
              <line x1="-4" y1="0" x2="4" y2="0" />
              <line x1="0" y1="-4" x2="0" y2="4" />
              <line x1="-3" y1="-3" x2="3" y2="3" />
              <line x1="-3" y1="3" x2="3" y2="-3" />
            </g>
          ))}
        </g>
      </g>
    ),
    showers: (
      // 金色太阳 + 白云 + 雨线
      <g>
        <g stroke={c.sun} strokeWidth={sw} strokeLinecap="round" opacity="0.8">
          <line x1="18" y1="4" x2="18" y2="8" />
          <line x1="4" y1="18" x2="8" y2="18" />
          <line x1="8" y1="8" x2="11" y2="11" />
          <line x1="28" y1="8" x2="25" y2="11" />
        </g>
        <circle cx="18" cy="18" r="7" fill={c.sun} />
        <path
          d="M16 32 Q16 24 24 24 Q26 18 34 20 Q44 18 46 26 Q54 26 54 34 Q54 40 48 40 L20 40 Q14 40 16 32 Z"
          fill={c.cloud}
        />
        <g stroke={c.rain} strokeWidth={sw} strokeLinecap="round">
          <line x1="24" y1="44" x2="22" y2="52" />
          <line x1="34" y1="44" x2="32" y2="52" />
          <line x1="44" y1="44" x2="42" y2="52" />
        </g>
      </g>
    ),
    sleet: (
      // 云 + 雨 + 雪
      <g>
        <path
          d="M14 24 Q14 14 24 14 Q26 8 34 10 Q44 8 46 16 Q54 16 54 24 Q54 30 48 30 L18 30 Q12 30 14 24 Z"
          fill={c.cloud}
        />
        <g stroke={c.rain} strokeWidth={sw} strokeLinecap="round">
          <line x1="22" y1="36" x2="20" y2="44" />
          <line x1="42" y1="36" x2="40" y2="44" />
        </g>
        <g stroke={c.snow} strokeWidth={sw} strokeLinecap="round">
          <g transform="translate(32,48)">
            <line x1="-4" y1="0" x2="4" y2="0" />
            <line x1="0" y1="-4" x2="0" y2="4" />
            <line x1="-3" y1="-3" x2="3" y2="3" />
            <line x1="-3" y1="3" x2="3" y2="-3" />
          </g>
        </g>
      </g>
    ),
    thunderstorm: (
      // 云 + 黄色闪电
      <g>
        <path
          d="M14 22 Q14 12 24 12 Q26 6 34 8 Q44 6 46 14 Q54 14 54 22 Q54 28 48 28 L18 28 Q12 28 14 22 Z"
          fill={c.cloud}
        />
        <path
          d="M30 32 L24 46 L31 46 L27 58 L40 42 L33 42 L37 32 Z"
          fill={c.lightning}
        />
        <path
          d="M30 32 L24 46 L31 46 L27 58 L40 42 L33 42 L37 32 Z"
          fill="none"
          stroke={c.lightning}
          strokeWidth="0.5"
        />
      </g>
    ),
    'thunderstorm-hail': (
      // 云 + 闪电 + 冰雹
      <g>
        <path
          d="M14 20 Q14 10 24 10 Q26 4 34 6 Q44 4 46 12 Q54 12 54 20 Q54 26 48 26 L18 26 Q12 26 14 20 Z"
          fill={c.cloud}
        />
        <path
          d="M28 30 L22 42 L29 42 L25 52 L36 40 L31 40 L33 30 Z"
          fill={c.lightning}
        />
        <g fill={c.hail}>
          <circle cx="44" cy="38" r="1.8" />
          <circle cx="48" cy="46" r="1.8" />
          <circle cx="42" cy="50" r="1.8" />
        </g>
      </g>
    ),
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {icons[name]}
    </svg>
  )
}

export default WeatherIcon
