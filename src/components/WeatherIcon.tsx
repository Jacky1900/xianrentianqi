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
  color?: string
}

// Nokia Lumia 风格的 SVG 天气图标 - 简洁线条 + 微妙渐变
const WeatherIcon: React.FC<Props> = ({ name, size = 48, color = '#ffffff' }) => {
  const stroke = color
  const fill = 'none'
  const sw = 1.5 // stroke width

  const icons: Record<WeatherIconName, React.ReactNode> = {
    clear: (
      // 太阳：圆 + 八条射线
      <g>
        <circle cx="32" cy="32" r="12" fill={color} opacity="0.9" />
        <g stroke={stroke} strokeWidth={sw} strokeLinecap="round">
          <line x1="32" y1="6" x2="32" y2="14" />
          <line x1="32" y1="50" x2="32" y2="58" />
          <line x1="6" y1="32" x2="14" y2="32" />
          <line x1="50" y1="32" x2="58" y2="32" />
          <line x1="13.5" y1="13.5" x2="19" y2="19" />
          <line x1="45" y1="45" x2="50.5" y2="50.5" />
          <line x1="50.5" y1="13.5" x2="45" y2="19" />
          <line x1="19" y1="45" x2="13.5" y2="50.5" />
        </g>
      </g>
    ),
    'partly-cloudy': (
      // 太阳 + 云
      <g>
        <circle cx="22" cy="22" r="9" fill={color} opacity="0.8" />
        <g stroke={stroke} strokeWidth={sw} strokeLinecap="round" opacity="0.7">
          <line x1="22" y1="6" x2="22" y2="10" />
          <line x1="6" y1="22" x2="10" y2="22" />
          <line x1="10.5" y1="10.5" x2="13.5" y2="13.5" />
          <line x1="33.5" y1="10.5" x2="30.5" y2="13.5" />
        </g>
        <path
          d="M20 42 Q20 34 28 34 Q30 28 38 30 Q46 28 48 36 Q54 36 54 44 Q54 50 48 50 L24 50 Q18 50 20 42 Z"
          fill={color}
          opacity="0.95"
        />
      </g>
    ),
    cloudy: (
      // 两朵云
      <g>
        <path
          d="M14 38 Q14 30 22 30 Q24 24 32 26 Q40 24 42 32 Q48 32 48 40 Q48 46 42 46 L18 46 Q12 46 14 38 Z"
          fill={color}
          opacity="0.4"
        />
        <path
          d="M18 44 Q18 36 26 36 Q28 30 36 32 Q44 30 46 38 Q52 38 52 46 Q52 52 46 52 L22 52 Q16 52 18 44 Z"
          fill={color}
          opacity="0.9"
        />
      </g>
    ),
    overcast: (
      // 厚云
      <g>
        <path
          d="M10 36 Q10 26 20 26 Q22 18 32 20 Q44 18 46 28 Q56 28 56 38 Q56 46 48 46 L14 46 Q6 46 10 36 Z"
          fill={color}
          opacity="0.3"
        />
        <path
          d="M14 42 Q14 32 24 32 Q26 24 36 26 Q48 24 50 34 Q60 34 60 44 Q60 52 52 52 L18 52 Q10 52 14 42 Z"
          fill={color}
          opacity="0.9"
        />
      </g>
    ),
    fog: (
      // 云 + 三条雾线
      <g>
        <path
          d="M14 28 Q14 20 22 20 Q24 14 32 16 Q42 14 44 22 Q52 22 52 30 Q52 36 46 36 L18 36 Q12 36 14 28 Z"
          fill={color}
          opacity="0.6"
        />
        <g stroke={stroke} strokeWidth={sw} strokeLinecap="round" opacity="0.5">
          <line x1="12" y1="44" x2="50" y2="44" />
          <line x1="16" y1="50" x2="54" y2="50" />
          <line x1="14" y1="56" x2="48" y2="56" />
        </g>
      </g>
    ),
    drizzle: (
      // 云 + 小雨点
      <g>
        <path
          d="M14 28 Q14 18 24 18 Q26 12 34 14 Q44 12 46 20 Q54 20 54 28 Q54 34 48 34 L18 34 Q12 34 14 28 Z"
          fill={color}
          opacity="0.9"
        />
        <g fill={color} opacity="0.7">
          <circle cx="22" cy="44" r="1.5" />
          <circle cx="32" cy="48" r="1.5" />
          <circle cx="42" cy="44" r="1.5" />
          <circle cx="27" cy="54" r="1.5" />
          <circle cx="37" cy="54" r="1.5" />
        </g>
      </g>
    ),
    rain: (
      // 云 + 雨线
      <g>
        <path
          d="M14 26 Q14 16 24 16 Q26 10 34 12 Q44 10 46 18 Q54 18 54 26 Q54 32 48 32 L18 32 Q12 32 14 26 Z"
          fill={color}
          opacity="0.9"
        />
        <g stroke={stroke} strokeWidth={sw} strokeLinecap="round" opacity="0.7">
          <line x1="22" y1="38" x2="20" y2="48" />
          <line x1="32" y1="38" x2="30" y2="48" />
          <line x1="42" y1="38" x2="40" y2="48" />
          <line x1="27" y1="50" x2="25" y2="58" />
          <line x1="37" y1="50" x2="35" y2="58" />
        </g>
      </g>
    ),
    'heavy-rain': (
      // 云 + 大量雨线
      <g>
        <path
          d="M10 24 Q10 14 20 14 Q22 8 30 10 Q42 8 44 16 Q54 16 54 24 Q54 30 48 30 L14 30 Q8 30 10 24 Z"
          fill={color}
          opacity="0.9"
        />
        <g stroke={stroke} strokeWidth={sw + 0.3} strokeLinecap="round" opacity="0.8">
          <line x1="18" y1="36" x2="15" y2="48" />
          <line x1="26" y1="36" x2="23" y2="48" />
          <line x1="34" y1="36" x2="31" y2="48" />
          <line x1="42" y1="36" x2="39" y2="48" />
          <line x1="50" y1="36" x2="47" y2="48" />
          <line x1="22" y1="50" x2="19" y2="60" />
          <line x1="30" y1="50" x2="27" y2="60" />
          <line x1="38" y1="50" x2="35" y2="60" />
          <line x1="46" y1="50" x2="43" y2="60" />
        </g>
      </g>
    ),
    'freezing-rain': (
      // 云 + 雨线 + 冰晶
      <g>
        <path
          d="M14 26 Q14 16 24 16 Q26 10 34 12 Q44 10 46 18 Q54 18 54 26 Q54 32 48 32 L18 32 Q12 32 14 26 Z"
          fill={color}
          opacity="0.9"
        />
        <g stroke={stroke} strokeWidth={sw} strokeLinecap="round" opacity="0.6">
          <line x1="22" y1="38" x2="20" y2="46" />
          <line x1="42" y1="38" x2="40" y2="46" />
        </g>
        <g fill={color} opacity="0.9">
          <path d="M32 48 L34 52 L32 56 L30 52 Z" />
          <path d="M28 52 L36 52 L36 54 L28 54 Z" />
        </g>
      </g>
    ),
    snow: (
      // 云 + 雪花
      <g>
        <path
          d="M14 26 Q14 16 24 16 Q26 10 34 12 Q44 10 46 18 Q54 18 54 26 Q54 32 48 32 L18 32 Q12 32 14 26 Z"
          fill={color}
          opacity="0.9"
        />
        <g stroke={stroke} strokeWidth={sw} strokeLinecap="round" opacity="0.85">
          {/* 雪花1 */}
          <g transform="translate(22,46)">
            <line x1="-4" y1="0" x2="4" y2="0" />
            <line x1="0" y1="-4" x2="0" y2="4" />
            <line x1="-3" y1="-3" x2="3" y2="3" />
            <line x1="-3" y1="3" x2="3" y2="-3" />
          </g>
          {/* 雪花2 */}
          <g transform="translate(34,52)">
            <line x1="-4" y1="0" x2="4" y2="0" />
            <line x1="0" y1="-4" x2="0" y2="4" />
            <line x1="-3" y1="-3" x2="3" y2="3" />
            <line x1="-3" y1="3" x2="3" y2="-3" />
          </g>
          {/* 雪花3 */}
          <g transform="translate(46,46)">
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
          d="M10 24 Q10 14 20 14 Q22 8 30 10 Q42 8 44 16 Q54 16 54 24 Q54 30 48 30 L14 30 Q8 30 10 24 Z"
          fill={color}
          opacity="0.9"
        />
        <g stroke={stroke} strokeWidth={sw} strokeLinecap="round" opacity="0.9">
          {[[20, 40], [32, 44], [44, 40], [26, 52], [38, 52], [32, 58]].map(([x, y], i) => (
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
      // 太阳 + 云 + 雨
      <g>
        <circle cx="20" cy="18" r="7" fill={color} opacity="0.7" />
        <path
          d="M16 34 Q16 26 24 26 Q26 20 34 22 Q44 20 46 28 Q54 28 54 36 Q54 42 48 42 L20 42 Q14 42 16 34 Z"
          fill={color}
          opacity="0.9"
        />
        <g stroke={stroke} strokeWidth={sw} strokeLinecap="round" opacity="0.7">
          <line x1="24" y1="46" x2="22" y2="54" />
          <line x1="34" y1="46" x2="32" y2="54" />
          <line x1="44" y1="46" x2="42" y2="54" />
        </g>
      </g>
    ),
    sleet: (
      // 云 + 雨雪混合
      <g>
        <path
          d="M14 26 Q14 16 24 16 Q26 10 34 12 Q44 10 46 18 Q54 18 54 26 Q54 32 48 32 L18 32 Q12 32 14 26 Z"
          fill={color}
          opacity="0.9"
        />
        <g stroke={stroke} strokeWidth={sw} strokeLinecap="round" opacity="0.7">
          <line x1="22" y1="38" x2="20" y2="46" />
          <line x1="42" y1="38" x2="40" y2="46" />
        </g>
        <g stroke={stroke} strokeWidth={sw} strokeLinecap="round" opacity="0.85">
          <g transform="translate(32,50)">
            <line x1="-4" y1="0" x2="4" y2="0" />
            <line x1="0" y1="-4" x2="0" y2="4" />
            <line x1="-3" y1="-3" x2="3" y2="3" />
            <line x1="-3" y1="3" x2="3" y2="-3" />
          </g>
        </g>
      </g>
    ),
    thunderstorm: (
      // 云 + 闪电
      <g>
        <path
          d="M14 24 Q14 14 24 14 Q26 8 34 10 Q44 8 46 16 Q54 16 54 24 Q54 30 48 30 L18 30 Q12 30 14 24 Z"
          fill={color}
          opacity="0.9"
        />
        <path
          d="M30 34 L26 46 L32 46 L28 58 L40 42 L34 42 L38 34 Z"
          fill={color}
          opacity="0.95"
        />
      </g>
    ),
    'thunderstorm-hail': (
      // 云 + 闪电 + 冰雹
      <g>
        <path
          d="M14 22 Q14 12 24 12 Q26 6 34 8 Q44 6 46 14 Q54 14 54 22 Q54 28 48 28 L18 28 Q12 28 14 22 Z"
          fill={color}
          opacity="0.9"
        />
        <path
          d="M28 32 L24 42 L30 42 L26 52 L36 40 L32 40 L34 32 Z"
          fill={color}
          opacity="0.95"
        />
        <g fill={color} opacity="0.7">
          <circle cx="44" cy="40" r="1.5" />
          <circle cx="48" cy="48" r="1.5" />
          <circle cx="42" cy="52" r="1.5" />
        </g>
      </g>
    ),
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
    >
      {icons[name]}
    </svg>
  )
}

export default WeatherIcon
