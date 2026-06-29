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

// 立体感天气图标 - 使用径向渐变 + 高光 + 阴影
const WeatherIcon: React.FC<Props> = ({ name, size = 48 }) => {
  // 唯一 ID 防止多个图标渐变冲突
  const uid = `${name}-${size}-${Math.random().toString(36).slice(2, 7)}`

  const defs = (
    <>
      {/* 太阳渐变 - 金黄到橙 */}
      <radialGradient id={`sun-${uid}`} cx="35%" cy="35%">
        <stop offset="0%" stopColor="#FFF59D" />
        <stop offset="40%" stopColor="#FFD54F" />
        <stop offset="100%" stopColor="#FF8F00" />
      </radialGradient>

      {/* 云朵渐变 - 顶部亮白到底部灰 */}
      <linearGradient id={`cloud-${uid}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="60%" stopColor="#ECEFF1" />
        <stop offset="100%" stopColor="#90A4AE" />
      </linearGradient>

      {/* 云朵阴影渐变 */}
      <linearGradient id={`cloud-dark-${uid}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#CFD8DC" />
        <stop offset="100%" stopColor="#546E7A" />
      </linearGradient>

      {/* 雨滴渐变 */}
      <linearGradient id={`rain-${uid}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#81D4FA" />
        <stop offset="100%" stopColor="#0288D1" />
      </linearGradient>

      {/* 闪电渐变 */}
      <linearGradient id={`lightning-${uid}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFF9C4" />
        <stop offset="50%" stopColor="#FFEB3B" />
        <stop offset="100%" stopColor="#FF8F00" />
      </linearGradient>

      {/* 雪花渐变 */}
      <linearGradient id={`snow-${uid}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#B3E5FC" />
      </linearGradient>

      {/* 雾渐变 */}
      <linearGradient id={`fog-${uid}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ECEFF1" />
        <stop offset="100%" stopColor="#78909C" />
      </linearGradient>

      {/* 阴影滤镜 */}
      <filter id={`shadow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.3" />
      </filter>

      {/* 高光滤镜 */}
      <filter id={`glow-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#FFD54F" floodOpacity="0.6" />
      </filter>
    </>
  )

  const icons: Record<WeatherIconName, React.ReactNode> = {
    clear: (
      <g>
        {/* 光晕射线 */}
        <g stroke="#FFC107" strokeWidth="2.5" strokeLinecap="round" opacity="0.85">
          <line x1="32" y1="3" x2="32" y2="11" />
          <line x1="32" y1="53" x2="32" y2="61" />
          <line x1="3" y1="32" x2="11" y2="32" />
          <line x1="53" y1="32" x2="61" y2="32" />
          <line x1="11" y1="11" x2="16" y2="16" />
          <line x1="48" y1="48" x2="53" y2="53" />
          <line x1="53" y1="11" x2="48" y2="16" />
          <line x1="16" y1="48" x2="11" y2="53" />
        </g>
        {/* 太阳球体 - 立体渐变 */}
        <circle cx="32" cy="32" r="13" fill={`url(#sun-${uid})`} filter={`url(#shadow-${uid})`} />
        {/* 高光 */}
        <ellipse cx="28" cy="28" rx="5" ry="3" fill="#FFFFFF" opacity="0.4" />
      </g>
    ),
    'partly-cloudy': (
      <g>
        {/* 射线 */}
        <g stroke="#FFC107" strokeWidth="2" strokeLinecap="round" opacity="0.7">
          <line x1="22" y1="4" x2="22" y2="9" />
          <line x1="4" y1="22" x2="9" y2="22" />
          <line x1="9" y1="9" x2="12" y2="12" />
          <line x1="33" y1="9" x2="30" y2="12" />
        </g>
        {/* 太阳 */}
        <circle cx="22" cy="22" r="8" fill={`url(#sun-${uid})`} filter={`url(#shadow-${uid})`} />
        <ellipse cx="20" cy="20" rx="3" ry="2" fill="#FFFFFF" opacity="0.4" />
        {/* 立体云朵 */}
        <path
          d="M16 44 Q16 35 25 35 Q27 28 36 30 Q45 28 47 37 Q54 37 54 46 Q54 52 47 52 L21 52 Q14 52 16 44 Z"
          fill={`url(#cloud-${uid})`}
          filter={`url(#shadow-${uid})`}
        />
        {/* 云朵高光 */}
        <path
          d="M20 38 Q22 36 26 36 Q28 32 34 33"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          opacity="0.6"
          strokeLinecap="round"
        />
      </g>
    ),
    cloudy: (
      <g>
        {/* 后层云 */}
        <path
          d="M10 36 Q10 27 19 27 Q21 20 30 22 Q39 20 41 29 Q48 29 48 38 Q48 45 41 45 L15 45 Q7 45 10 36 Z"
          fill={`url(#cloud-dark-${uid})`}
          opacity="0.6"
          filter={`url(#shadow-${uid})`}
        />
        {/* 前层云 */}
        <path
          d="M18 44 Q18 35 27 35 Q29 28 38 30 Q47 28 49 37 Q56 37 56 46 Q56 53 49 53 L23 53 Q16 53 18 44 Z"
          fill={`url(#cloud-${uid})`}
          filter={`url(#shadow-${uid})`}
        />
        {/* 高光 */}
        <path
          d="M22 38 Q24 36 28 36 Q30 32 36 33"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          opacity="0.7"
          strokeLinecap="round"
        />
      </g>
    ),
    overcast: (
      <g>
        {/* 厚云层 */}
        <path
          d="M6 32 Q6 22 16 22 Q18 14 28 16 Q40 14 42 24 Q52 24 52 34 Q52 42 44 42 L10 42 Q2 42 6 32 Z"
          fill={`url(#cloud-dark-${uid})`}
          opacity="0.5"
          filter={`url(#shadow-${uid})`}
        />
        <path
          d="M14 40 Q14 30 24 30 Q26 22 36 24 Q48 22 50 32 Q60 32 60 42 Q60 50 52 50 L18 50 Q10 50 14 40 Z"
          fill={`url(#cloud-${uid})`}
          filter={`url(#shadow-${uid})`}
        />
        <path
          d="M18 34 Q20 32 24 32 Q26 28 32 29"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          opacity="0.5"
          strokeLinecap="round"
        />
      </g>
    ),
    fog: (
      <g>
        {/* 云 */}
        <path
          d="M14 24 Q14 15 24 15 Q26 9 34 11 Q44 9 46 17 Q54 17 54 25 Q54 31 48 31 L18 31 Q12 31 14 24 Z"
          fill={`url(#fog-${uid})`}
          filter={`url(#shadow-${uid})`}
        />
        {/* 雾线 */}
        <g stroke="#B0BEC5" strokeWidth="2.5" strokeLinecap="round" opacity="0.7">
          <line x1="8" y1="38" x2="54" y2="38" />
          <line x1="12" y1="44" x2="58" y2="44" />
          <line x1="10" y1="50" x2="50" y2="50" />
          <line x1="14" y1="56" x2="48" y2="56" />
        </g>
      </g>
    ),
    drizzle: (
      <g>
        <path
          d="M14 24 Q14 14 24 14 Q26 8 34 10 Q44 8 46 16 Q54 16 54 24 Q54 30 48 30 L18 30 Q12 30 14 24 Z"
          fill={`url(#cloud-${uid})`}
          filter={`url(#shadow-${uid})`}
        />
        <path
          d="M18 18 Q20 16 24 16 Q26 12 32 13"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          opacity="0.6"
          strokeLinecap="round"
        />
        {/* 水滴形状 */}
        <g fill={`url(#rain-${uid})`} filter={`url(#shadow-${uid})`}>
          <path d="M22 38 C20 42, 19 46, 22 47 C25 46, 24 42, 22 38 Z" />
          <path d="M32 40 C30 44, 29 48, 32 49 C35 48, 34 44, 32 40 Z" />
          <path d="M42 38 C40 42, 39 46, 42 47 C45 46, 44 42, 42 38 Z" />
          <path d="M27 50 C25 54, 24 58, 27 59 C30 58, 29 54, 27 50 Z" />
          <path d="M37 50 C35 54, 34 58, 37 59 C40 58, 39 54, 37 50 Z" />
        </g>
      </g>
    ),
    rain: (
      <g>
        <path
          d="M14 22 Q14 12 24 12 Q26 6 34 8 Q44 6 46 14 Q54 14 54 22 Q54 28 48 28 L18 28 Q12 28 14 22 Z"
          fill={`url(#cloud-${uid})`}
          filter={`url(#shadow-${uid})`}
        />
        <path
          d="M18 16 Q20 14 24 14 Q26 10 32 11"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          opacity="0.6"
          strokeLinecap="round"
        />
        {/* 水滴形状 */}
        <g fill={`url(#rain-${uid})`} filter={`url(#shadow-${uid})`}>
          <path d="M22 32 C19 38, 18 44, 22 46 C26 44, 25 38, 22 32 Z" />
          <path d="M32 34 C29 40, 28 46, 32 48 C36 46, 35 40, 32 34 Z" />
          <path d="M42 32 C39 38, 38 44, 42 46 C46 44, 45 38, 42 32 Z" />
          <path d="M27 48 C24 54, 23 60, 27 62 C31 60, 30 54, 27 48 Z" />
          <path d="M37 48 C34 54, 33 60, 37 62 C41 60, 40 54, 37 48 Z" />
        </g>
      </g>
    ),
    'heavy-rain': (
      <g>
        <path
          d="M10 20 Q10 10 20 10 Q22 4 30 6 Q42 4 44 12 Q54 12 54 20 Q54 26 48 26 L14 26 Q8 26 10 20 Z"
          fill={`url(#cloud-dark-${uid})`}
          filter={`url(#shadow-${uid})`}
        />
        <path
          d="M14 14 Q16 12 20 12 Q22 8 28 9"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          opacity="0.5"
          strokeLinecap="round"
        />
        {/* 大量水滴 */}
        <g fill={`url(#rain-${uid})`} filter={`url(#shadow-${uid})`}>
          <path d="M18 30 C15 36, 14 42, 18 44 C22 42, 21 36, 18 30 Z" />
          <path d="M28 32 C25 38, 24 44, 28 46 C32 44, 31 38, 28 32 Z" />
          <path d="M38 32 C35 38, 34 44, 38 46 C42 44, 41 38, 38 32 Z" />
          <path d="M48 30 C45 36, 44 42, 48 44 C52 42, 51 36, 48 30 Z" />
          <path d="M23 46 C20 52, 19 58, 23 60 C27 58, 26 52, 23 46 Z" />
          <path d="M33 46 C30 52, 29 58, 33 60 C37 58, 36 52, 33 46 Z" />
          <path d="M43 46 C40 52, 39 58, 43 60 C47 58, 46 52, 43 46 Z" />
        </g>
      </g>
    ),
    'freezing-rain': (
      <g>
        <path
          d="M14 22 Q14 12 24 12 Q26 6 34 8 Q44 6 46 14 Q54 14 54 22 Q54 28 48 28 L18 28 Q12 28 14 22 Z"
          fill={`url(#cloud-${uid})`}
          filter={`url(#shadow-${uid})`}
        />
        <g stroke={`url(#rain-${uid})`} strokeWidth="2.5" strokeLinecap="round">
          <line x1="22" y1="34" x2="20" y2="42" />
          <line x1="42" y1="34" x2="40" y2="42" />
        </g>
        {/* 冰晶 */}
        <g fill={`url(#snow-${uid})`} filter={`url(#shadow-${uid})`}>
          <path d="M32 44 L35 50 L32 56 L29 50 Z" />
        </g>
      </g>
    ),
    snow: (
      <g>
        <path
          d="M14 22 Q14 12 24 12 Q26 6 34 8 Q44 6 46 14 Q54 14 54 22 Q54 28 48 28 L18 28 Q12 28 14 22 Z"
          fill={`url(#cloud-${uid})`}
          filter={`url(#shadow-${uid})`}
        />
        <g stroke={`url(#snow-${uid})`} strokeWidth="2" strokeLinecap="round" filter={`url(#shadow-${uid})`}>
          {[[22, 38], [34, 44], [46, 38], [28, 52], [40, 52]].map(([x, y], i) => (
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
    'heavy-snow': (
      <g>
        <path
          d="M10 20 Q10 10 20 10 Q22 4 30 6 Q42 4 44 12 Q54 12 54 20 Q54 26 48 26 L14 26 Q8 26 10 20 Z"
          fill={`url(#cloud-dark-${uid})`}
          filter={`url(#shadow-${uid})`}
        />
        <g stroke={`url(#snow-${uid})`} strokeWidth="2.2" strokeLinecap="round" filter={`url(#shadow-${uid})`}>
          {[[18, 34], [30, 38], [42, 34], [24, 46], [36, 46], [48, 46], [30, 56]].map(([x, y], i) => (
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
      <g>
        <g stroke="#FFC107" strokeWidth="2" strokeLinecap="round" opacity="0.8">
          <line x1="18" y1="3" x2="18" y2="8" />
          <line x1="3" y1="18" x2="8" y2="18" />
          <line x1="7" y1="7" x2="10" y2="10" />
          <line x1="28" y1="8" x2="25" y2="11" />
        </g>
        <circle cx="18" cy="18" r="7" fill={`url(#sun-${uid})`} filter={`url(#shadow-${uid})`} />
        <ellipse cx="16" cy="16" rx="2.5" ry="1.5" fill="#FFFFFF" opacity="0.4" />
        <path
          d="M16 32 Q16 23 25 23 Q27 16 36 18 Q45 16 47 25 Q54 25 54 34 Q54 40 47 40 L21 40 Q14 40 16 32 Z"
          fill={`url(#cloud-${uid})`}
          filter={`url(#shadow-${uid})`}
        />
        <path
          d="M20 26 Q22 24 26 24 Q28 20 34 21"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          opacity="0.6"
          strokeLinecap="round"
        />
        {/* 水滴形状 */}
        <g fill={`url(#rain-${uid})`} filter={`url(#shadow-${uid})`}>
          <path d="M24 42 C22 46, 21 50, 24 52 C27 50, 26 46, 24 42 Z" />
          <path d="M34 44 C32 48, 31 52, 34 54 C37 52, 36 48, 34 44 Z" />
          <path d="M44 42 C42 46, 41 50, 44 52 C47 50, 46 46, 44 42 Z" />
        </g>
      </g>
    ),
    sleet: (
      <g>
        <path
          d="M14 22 Q14 12 24 12 Q26 6 34 8 Q44 6 46 14 Q54 14 54 22 Q54 28 48 28 L18 28 Q12 28 14 22 Z"
          fill={`url(#cloud-${uid})`}
          filter={`url(#shadow-${uid})`}
        />
        {/* 水滴 */}
        <g fill={`url(#rain-${uid})`}>
          <path d="M22 32 C20 36, 19 40, 22 42 C25 40, 24 36, 22 32 Z" />
          <path d="M42 32 C40 36, 39 40, 42 42 C45 40, 44 36, 42 32 Z" />
        </g>
        <g stroke={`url(#snow-${uid})`} strokeWidth="2" strokeLinecap="round" filter={`url(#shadow-${uid})`}>
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
      <g>
        <path
          d="M14 20 Q14 10 24 10 Q26 4 34 6 Q44 4 46 12 Q54 12 54 20 Q54 26 48 26 L18 26 Q12 26 14 20 Z"
          fill={`url(#cloud-dark-${uid})`}
          filter={`url(#shadow-${uid})`}
        />
        {/* 闪电 - 渐变立体 */}
        <path
          d="M30 30 L23 44 L30 44 L26 58 L40 40 L33 40 L37 30 Z"
          fill={`url(#lightning-${uid})`}
          filter={`url(#shadow-${uid})`}
        />
      </g>
    ),
    'thunderstorm-hail': (
      <g>
        <path
          d="M14 18 Q14 8 24 8 Q26 2 34 4 Q44 2 46 10 Q54 10 54 18 Q54 24 48 24 L18 24 Q12 24 14 18 Z"
          fill={`url(#cloud-dark-${uid})`}
          filter={`url(#shadow-${uid})`}
        />
        <path
          d="M28 28 L22 40 L29 40 L25 50 L36 38 L31 38 L33 28 Z"
          fill={`url(#lightning-${uid})`}
          filter={`url(#shadow-${uid})`}
        />
        <g fill={`url(#snow-${uid})`} filter={`url(#shadow-${uid})`}>
          <circle cx="44" cy="36" r="2" />
          <circle cx="48" cy="44" r="2" />
          <circle cx="42" cy="48" r="2" />
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
      <defs>
        {defs}
      </defs>
      {icons[name]}
    </svg>
  )
}

export default WeatherIcon
