'use client'

import { WEATHER_CODES } from '@/lib/constants'

interface WeatherIconProps {
  code: number
  size?: 'small' | 'medium' | 'large'
  animated?: boolean
}

export function WeatherIcon({ code, size = 'medium', animated = true }: WeatherIconProps) {
  const weatherInfo = WEATHER_CODES[code as keyof typeof WEATHER_CODES] || { description: 'Unknown', icon: '❓' }
  
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-16 h-16',
    large: 'w-24 h-24',
  }

  // Animated SVG icons based on weather conditions
  if (code === 0 || code === 1) {
    // Clear sky / Mainly clear
    return (
      <div className={`${sizeClasses[size]} relative`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle
            cx="50"
            cy="50"
            r="20"
            fill="#ffd700"
            className={animated ? 'animate-pulse' : ''}
          />
          {animated && (
            <>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <line
                  key={angle}
                  x1="50"
                  y1="50"
                  x2={50 + 35 * Math.cos((angle * Math.PI) / 180)}
                  y2={50 + 35 * Math.sin((angle * Math.PI) / 180)}
                  stroke="#ffd700"
                  strokeWidth="2"
                  opacity="0.6"
                  className="animate-spin-slow origin-center"
                />
              ))}
            </>
          )}
        </svg>
      </div>
    )
  }

  if (code >= 2 && code <= 3) {
    // Partly cloudy / Overcast
    return (
      <div className={`${sizeClasses[size]} relative`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Sun behind cloud */}
          <circle cx="35" cy="35" r="15" fill="#ffd700" opacity="0.8" />
          
          {/* Cloud */}
          <path
            d="M 30 60 Q 30 45 40 45 Q 45 35 55 35 Q 65 30 75 35 Q 85 35 90 45 Q 100 45 100 60 Q 100 75 85 75 L 45 75 Q 30 75 30 60"
            fill="white"
            stroke="#e5e7eb"
            strokeWidth="1"
            className={animated ? 'animate-float' : ''}
          />
        </svg>
      </div>
    )
  }

  if (code >= 51 && code <= 67) {
    // Rain
    return (
      <div className={`${sizeClasses[size]} relative`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Cloud */}
          <path
            d="M 20 40 Q 20 25 30 25 Q 35 15 45 15 Q 55 10 65 15 Q 75 15 80 25 Q 90 25 90 40 Q 90 55 75 55 L 35 55 Q 20 55 20 40"
            fill="#94a3b8"
            stroke="#64748b"
            strokeWidth="1"
          />
          
          {/* Rain drops */}
          {animated && (
            <>
              {[30, 50, 70].map((x, i) => (
                <line
                  key={i}
                  x1={x}
                  y1="65"
                  x2={x - 5}
                  y2="75"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  opacity="0.6"
                  className="animate-rain"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </>
          )}
        </svg>
      </div>
    )
  }

  if (code >= 71 && code <= 77) {
    // Snow
    return (
      <div className={`${sizeClasses[size]} relative`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Cloud */}
          <path
            d="M 20 40 Q 20 25 30 25 Q 35 15 45 15 Q 55 10 65 15 Q 75 15 80 25 Q 90 25 90 40 Q 90 55 75 55 L 35 55 Q 20 55 20 40"
            fill="#e0e7ff"
            stroke="#c7d2fe"
            strokeWidth="1"
          />
          
          {/* Snowflakes */}
          {animated && (
            <>
              {[30, 50, 70].map((x, i) => (
                <text
                  key={i}
                  x={x}
                  y="70"
                  fontSize="12"
                  fill="#6366f1"
                  opacity="0.7"
                  className="animate-snow"
                  style={{ animationDelay: `${i * 0.3}s` }}
                >
                  ❄️
                </text>
              ))}
            </>
          )}
        </svg>
      </div>
    )
  }

  if (code >= 95) {
    // Thunderstorm
    return (
      <div className={`${sizeClasses[size]} relative`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Dark cloud */}
          <path
            d="M 20 40 Q 20 25 30 25 Q 35 15 45 15 Q 55 10 65 15 Q 75 15 80 25 Q 90 25 90 40 Q 90 55 75 55 L 35 55 Q 20 55 20 40"
            fill="#4b5563"
            stroke="#374151"
            strokeWidth="1"
          />
          
          {/* Lightning */}
          {animated && (
            <path
              d="M 45 55 L 40 70 L 50 65 L 45 80 L 60 60 L 50 65 L 55 55 Z"
              fill="#fbbf24"
              opacity="0"
              className="animate-flash"
            />
          )}
        </svg>
      </div>
    )
  }

  // Fallback to emoji
  return (
    <div className={`${sizeClasses[size]} flex items-center justify-center text-4xl`}>
      {weatherInfo.icon}
    </div>
  )
}