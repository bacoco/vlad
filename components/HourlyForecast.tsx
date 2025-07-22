'use client'

import { HourlyForecast as HourlyForecastType } from '@/types/weather'
import { WeatherService } from '@/lib/weather.service'
import { useMemo } from 'react'

interface HourlyForecastProps {
  forecasts: HourlyForecastType[]
  temperatureUnit: 'C' | 'F'
}

export function HourlyForecast({ forecasts, temperatureUnit }: HourlyForecastProps) {
  const { temperatures, minTemp, maxTemp, svgPath } = useMemo(() => {
    const temps = forecasts.map(f => 
      temperatureUnit === 'F' 
        ? WeatherService.convertTemperature(f.temperature, 'C', 'F')
        : f.temperature
    )
    
    const min = Math.min(...temps)
    const max = Math.max(...temps)
    const range = max - min || 1
    
    // Create SVG path for smooth temperature curve
    const points = temps.map((temp, i) => {
      const x = (i / (temps.length - 1)) * 100
      const y = 80 - ((temp - min) / range) * 60 // Inverted for SVG coordinates
      return { x, y }
    })
    
    // Create smooth curve using quadratic bezier curves
    let path = `M ${points[0].x} ${points[0].y}`
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const cpx = (prev.x + curr.x) / 2
      path += ` Q ${cpx} ${prev.y} ${cpx} ${curr.y} T ${curr.x} ${curr.y}`
    }
    
    return { temperatures: temps, minTemp: min, maxTemp: max, svgPath: path }
  }, [forecasts, temperatureUnit])

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Temperature Graph */}
      <div className="p-4 pb-2">
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-32"
          preserveAspectRatio="none"
        >
          {/* Background gradient */}
          <defs>
            <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#ffd700', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: '#ffd700', stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          
          {/* Fill area under curve */}
          <path
            d={`${svgPath} L 100 100 L 0 100 Z`}
            fill="url(#tempGradient)"
          />
          
          {/* Temperature curve */}
          <path
            d={svgPath}
            fill="none"
            stroke="#ffd700"
            strokeWidth="2"
          />
          
          {/* Temperature points */}
          {temperatures.map((temp, i) => {
            const x = (i / (temperatures.length - 1)) * 100
            const y = 80 - ((temp - minTemp) / (maxTemp - minTemp || 1)) * 60
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3"
                fill="#ffd700"
                stroke="white"
                strokeWidth="1.5"
              />
            )
          })}
        </svg>
      </div>
      
      {/* Hourly forecast scroll */}
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex space-x-4 px-4 pb-4">
          {forecasts.map((forecast, index) => {
            const temp = temperatureUnit === 'F'
              ? WeatherService.convertTemperature(forecast.temperature, 'C', 'F')
              : forecast.temperature
            
            const time = forecast.time.toLocaleTimeString([], { 
              hour: 'numeric',
              hour12: true 
            })
            
            const isNow = index === 0
            
            return (
              <div
                key={forecast.time.toISOString()}
                className="flex flex-col items-center min-w-[60px]"
              >
                <p className="text-xs text-gray-500 mb-1">
                  {isNow ? 'Now' : time}
                </p>
                
                {forecast.precipitation > 30 && (
                  <div className="text-xs text-blue-600 mb-1">
                    {forecast.precipitation}%
                  </div>
                )}
                
                <span className="text-2xl mb-1">
                  {getWeatherIcon(forecast.conditionCode)}
                </span>
                
                <p className="text-sm font-medium text-gray-900">
                  {temp}°
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function getWeatherIcon(code: number): string {
  if (code === 0) return '☀️'
  if (code <= 3) return '⛅'
  if (code <= 48) return '🌫️'
  if (code <= 57) return '🌦️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '🌨️'
  if (code <= 82) return '🌦️'
  if (code <= 86) return '🌨️'
  if (code >= 95) return '⛈️'
  return '☁️'
}