'use client'

import { WeatherData } from '@/types/weather'
import { WeatherService } from '@/lib/weather.service'
import { WeatherIcon } from './WeatherIcon'

interface WeatherDisplayProps {
  weather: WeatherData
  temperatureUnit: 'C' | 'F'
  onTemperatureClick?: () => void
}

export function WeatherDisplay({ weather, temperatureUnit, onTemperatureClick }: WeatherDisplayProps) {
  const displayTemp = temperatureUnit === 'F' 
    ? WeatherService.convertTemperature(weather.temperature, 'C', 'F')
    : weather.temperature

  const feelsLikeTemp = temperatureUnit === 'F'
    ? WeatherService.convertTemperature(weather.feelsLike, 'C', 'F')
    : weather.feelsLike

  return (
    <div className="weather-display">
      {/* Main Temperature Display */}
      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between mb-6 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center sm:space-x-4">
          <div className="mb-2 sm:mb-0">
            <WeatherIcon code={weather.conditionCode} size="large" animated={true} />
          </div>
          <button
            onClick={onTemperatureClick}
            className="text-6xl sm:text-7xl md:text-8xl font-light text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer"
          >
            {displayTemp}
            <span className="text-2xl sm:text-3xl md:text-4xl align-top">°{temperatureUnit}</span>
          </button>
        </div>
      </div>

      {/* Weather Condition */}
      <div className="mb-6 text-center sm:text-left">
        <p className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-1">{weather.condition}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Feels like {feelsLikeTemp}°</p>
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <WeatherDetailCard
          icon="💧"
          label="Humidity"
          value={`${weather.humidity}%`}
        />
        <WeatherDetailCard
          icon="💨"
          label="Wind"
          value={`${weather.windSpeed} km/h`}
          subtitle={WeatherService.getWindDirection(weather.windDirection)}
        />
        <WeatherDetailCard
          icon="🌧️"
          label="Precipitation"
          value={`${weather.precipitation} mm`}
        />
        <WeatherDetailCard
          icon="🌡️"
          label="Pressure"
          value={`${weather.pressure} hPa`}
        />
        <WeatherDetailCard
          icon="☀️"
          label="UV Index"
          value={weather.uvIndex.toString()}
          subtitle={WeatherService.getUVIndexLevel(weather.uvIndex)}
        />
        <WeatherDetailCard
          icon="👁️"
          label="Visibility"
          value={`${weather.visibility} km`}
        />
      </div>
    </div>
  )
}

interface WeatherDetailCardProps {
  icon: string
  label: string
  value: string
  subtitle?: string
}

function WeatherDetailCard({ icon, label, value, subtitle }: WeatherDetailCardProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 transition-colors">
      <div className="flex items-center space-x-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
    </div>
  )
}