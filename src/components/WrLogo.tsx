import React from 'react'

interface WrLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showSubtitle?: boolean
}

export const WrLogo: React.FC<WrLogoProps> = ({ 
  className = '', 
  size = 'md',
  showSubtitle = true 
}) => {
  const heights = {
    sm: 'h-8',
    md: 'h-11',
    lg: 'h-14',
  }

  return (
    <div className={`inline-flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 320 115"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-auto ${heights[size]}`}
      >
        <defs>
          {/* Metallic Gold Gradient (#E5A51B base) */}
          <linearGradient id="wrGoldGrad" x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#FFF4C2" />
            <stop offset="25%" stopColor="#F5CB5C" />
            <stop offset="55%" stopColor="#E5A51B" />
            <stop offset="80%" stopColor="#B87D0E" />
            <stop offset="100%" stopColor="#7A4E00" />
          </linearGradient>

          {/* Stroke Outline */}
          <linearGradient id="wrGoldOutline" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFBE6" />
            <stop offset="50%" stopColor="#E5A51B" />
            <stop offset="100%" stopColor="#573600" />
          </linearGradient>

          {/* Orange Gradient (#FF8500 -> #D96A00) */}
          <linearGradient id="wrOrangeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF8500" />
            <stop offset="50%" stopColor="#FFA033" />
            <stop offset="100%" stopColor="#D96A00" />
          </linearGradient>

          {/* Subtle Glow */}
          <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#E5A51B" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Ambient Horizontal Gold Ray */}
        <path
          d="M 15 48 Q 160 40 305 48"
          stroke="url(#wrGoldGrad)"
          strokeWidth="1"
          strokeOpacity="0.45"
        />

        {/* --- WR MONOGRAM --- */}
        <g filter="url(#softGlow)">
          {/* 'W' Shape */}
          <path
            d="M 40 12 
               L 72 78 
               L 98 25 
               L 112 52 
               L 132 12 
               L 150 12 
               L 122 78 
               L 104 78 
               L 88 42 
               L 62 78 
               L 44 78 
               L 20 12 
               Z"
            fill="url(#wrGoldGrad)"
            stroke="url(#wrGoldOutline)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          {/* Inner accents */}
          <path
            d="M 34 16 L 58 72 M 100 35 L 116 72"
            stroke="#FFFBEB"
            strokeWidth="1.2"
            opacity="0.8"
          />

          {/* 'R' Stem */}
          <path
            d="M 136 12 
               L 152 12 
               L 152 78 
               L 136 78 
               Z"
            fill="url(#wrGoldGrad)"
            stroke="url(#wrGoldOutline)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <line x1="144" y1="16" x2="144" y2="74" stroke="#FFFBEB" strokeWidth="1" opacity="0.8" />

          {/* 'R' Loop */}
          <path
            d="M 152 12 
               L 205 12 
               C 238 12, 242 46, 208 46 
               L 152 46 
               Z"
            fill="url(#wrGoldGrad)"
            stroke="url(#wrGoldOutline)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          {/* 'R' Inner Cutout */}
          <path
            d="M 162 20 
               L 196 20 
               C 218 20, 222 38, 198 38 
               L 162 38 
               Z"
            fill="#151515"
            stroke="url(#wrGoldOutline)"
            strokeWidth="1"
          />

          {/* 'R' Leg */}
          <path
            d="M 188 44 
               C 202 44, 218 54, 230 78 
               L 250 78 
               C 234 50, 212 40, 194 40 
               Z"
            fill="url(#wrGoldGrad)"
            stroke="url(#wrGoldOutline)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </g>

        {/* Subtitle "Mecânica & Cia" in Laranja principal */}
        {showSubtitle && (
          <text
            x="160"
            y="104"
            textAnchor="middle"
            fill="url(#wrOrangeGrad)"
            fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
            fontSize="26"
            fontWeight="800"
            letterSpacing="1.5"
          >
            Mecânica &amp; Cia
          </text>
        )}
      </svg>
    </div>
  )
}
