'use client'

import { DailyForecast as DailyForecastType } from '@/types/weather'
import { WeatherService } from '@/lib/weather.service'

interface DailyForecastProps {
  forecasts: DailyForecastType[]
  temperatureUnit: 'C' | 'F'
}

export function DailyForecast({ forecasts, temperatureUnit }: DailyForecastProps) {
  return (
    <div className="space-y-2">
      {forecasts.map((forecast, index) => {
        const high = temperatureUnit === 'F' 
          ? WeatherService.convertTemperature(forecast.tempHigh, 'C', 'F')
          : forecast.tempHigh
        const low = temperatureUnit === 'F'
          ? WeatherService.convertTemperature(forecast.tempLow, 'C', 'F')
          : forecast.tempLow

        const dayName = index === 0 
          ? 'Today' 
          : index === 1 
          ? 'Tomorrow' 
          : forecast.date.toLocaleDateString('en-US', { weekday: 'short' })

        return (
          <div
            key={forecast.date.toISOString()}
            className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-4 flex-1">
              <span className="text-3xl">{forecast.icon}</span>
              <div>
                <p className="font-medium text-gray-900">{dayName}</p>
                <p className="text-sm text-gray-500">{forecast.condition}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {forecast.precipitation > 0 && (
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <span>💧</span>
                  <span>{Math.round(forecast.precipitation)}mm</span>
                </div>
              )}
              
              <div className="text-right">
                <span className="text-lg font-medium text-gray-900">{high}°</span>
                <span className="text-sm text-gray-500 ml-2">{low}°</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}