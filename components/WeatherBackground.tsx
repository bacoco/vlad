'use client'

import { useEffect, useState } from 'react'
import { WeatherData } from '@/types/weather'

interface WeatherBackgroundProps {
  weather: WeatherData | null
  resolvedTheme: 'light' | 'dark'
}

export function WeatherBackground({ weather, resolvedTheme }: WeatherBackgroundProps) {
  const [gradient, setGradient] = useState('from-blue-400 to-blue-600')

  useEffect(() => {
    if (!weather) return

    const hour = new Date().getHours()
    const isNight = hour < 6 || hour > 20
    const code = weather.conditionCode

    // Clear sky
    if (code === 0 || code === 1) {
      if (isNight) {
        setGradient('from-indigo-900 to-purple-900')
      } else {
        setGradient('from-blue-400 to-cyan-400')
      }
    }
    // Cloudy
    else if (code >= 2 && code <= 3) {
      setGradient('from-gray-400 to-gray-600')
    }
    // Rainy
    else if (code >= 51 && code <= 67) {
      setGradient('from-gray-600 to-gray-800')
    }
    // Snowy
    else if (code >= 71 && code <= 77) {
      setGradient('from-gray-300 to-blue-300')
    }
    // Thunderstorm
    else if (code >= 95) {
      setGradient('from-gray-800 to-gray-900')
    }
  }, [weather])

  if (!weather) return null

  return (
    <div 
      className={`fixed inset-0 bg-gradient-to-br ${gradient} opacity-10 dark:opacity-20 pointer-events-none transition-all duration-1000`}
    />
  )
}