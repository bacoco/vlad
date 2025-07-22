'use client'

import { useState } from 'react'
import { HourlyForecast as HourlyForecastType } from '@/types/weather'
import { WeatherService } from '@/lib/weather.service'

interface WeatherTabsProps {
  hourlyForecasts: HourlyForecastType[]
  temperatureUnit: 'C' | 'F'
}

type TabType = 'temperature' | 'precipitation' | 'wind'

export function WeatherTabs({ hourlyForecasts, temperatureUnit }: WeatherTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('temperature')

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <TabButton
          isActive={activeTab === 'temperature'}
          onClick={() => setActiveTab('temperature')}
          label="Temperature"
        />
        <TabButton
          isActive={activeTab === 'precipitation'}
          onClick={() => setActiveTab('precipitation')}
          label="Precipitation"
        />
        <TabButton
          isActive={activeTab === 'wind'}
          onClick={() => setActiveTab('wind')}
          label="Wind"
        />
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'temperature' && (
          <TemperatureTab 
            forecasts={hourlyForecasts} 
            temperatureUnit={temperatureUnit}
          />
        )}
        
        {activeTab === 'precipitation' && (
          <PrecipitationTab forecasts={hourlyForecasts} />
        )}
        
        {activeTab === 'wind' && (
          <WindTab forecasts={hourlyForecasts} />
        )}
      </div>
    </div>
  )
}

interface TabButtonProps {
  isActive: boolean
  onClick: () => void
  label: string
}

function TabButton({ isActive, onClick, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
        isActive
          ? 'text-primary border-b-2 border-primary bg-blue-50'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  )
}

function TemperatureTab({ 
  forecasts, 
  temperatureUnit 
}: { 
  forecasts: HourlyForecastType[]
  temperatureUnit: 'C' | 'F' 
}) {
  const temperatures = forecasts.map(f => 
    temperatureUnit === 'F' 
      ? WeatherService.convertTemperature(f.temperature, 'C', 'F')
      : f.temperature
  )
  
  const minTemp = Math.min(...temperatures)
  const maxTemp = Math.max(...temperatures)
  const range = maxTemp - minTemp || 1
  
  // Create SVG path for smooth temperature curve
  const points = temperatures.map((temp, i) => {
    const x = (i / (temperatures.length - 1)) * 100
    const y = 80 - ((temp - minTemp) / range) * 60
    return { x, y, temp }
  })
  
  // Create smooth curve
  let svgPath = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cpx = (prev.x + curr.x) / 2
    svgPath += ` Q ${cpx} ${prev.y} ${cpx} ${curr.y} T ${curr.x} ${curr.y}`
  }

  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        Temperature forecast for the next 24 hours
      </p>
      
      {/* Temperature Graph */}
      <div className="mb-4">
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-32"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#ffd700', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: '#ffd700', stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          
          <path
            d={`${svgPath} L 100 100 L 0 100 Z`}
            fill="url(#tempGradient)"
          />
          
          <path
            d={svgPath}
            fill="none"
            stroke="#ffd700"
            strokeWidth="2"
          />
          
          {points.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="3"
              fill="#ffd700"
              stroke="white"
              strokeWidth="1.5"
            />
          ))}
        </svg>
      </div>
      
      {/* Hourly temperatures */}
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex space-x-4">
          {forecasts.map((forecast, index) => {
            const temp = temperatures[index]
            const time = forecast.time.toLocaleTimeString([], { 
              hour: 'numeric',
              hour12: true 
            })
            
            return (
              <div
                key={forecast.time.toISOString()}
                className="flex flex-col items-center min-w-[60px]"
              >
                <p className="text-xs text-gray-500 mb-1">
                  {index === 0 ? 'Now' : time}
                </p>
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

function PrecipitationTab({ forecasts }: { forecasts: HourlyForecastType[] }) {
  const maxPrecipitation = Math.max(...forecasts.map(f => f.precipitation))

  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        Precipitation probability for the next 24 hours
      </p>
      
      <div className="space-y-2">
        {forecasts.map((forecast) => {
          const time = forecast.time.toLocaleTimeString([], { 
            hour: 'numeric',
            hour12: true 
          })
          
          const barWidth = maxPrecipitation > 0 
            ? (forecast.precipitation / maxPrecipitation) * 100 
            : 0

          return (
            <div key={forecast.time.toISOString()} className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 w-12 text-right">
                {time}
              </span>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-full h-6 relative overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${barWidth}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                    {forecast.precipitation}%
                  </span>
                </div>
              </div>
              <span className="text-sm text-gray-600 w-8">
                {forecast.precipitation > 0 ? '💧' : ''}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function WindTab({ forecasts }: { forecasts: HourlyForecastType[] }) {
  const maxWind = Math.max(...forecasts.map(f => f.windSpeed))

  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        Wind speed forecast for the next 24 hours
      </p>
      
      <div className="space-y-2">
        {forecasts.map((forecast) => {
          const time = forecast.time.toLocaleTimeString([], { 
            hour: 'numeric',
            hour12: true 
          })
          
          const barWidth = maxWind > 0 
            ? (forecast.windSpeed / maxWind) * 100 
            : 0

          return (
            <div key={forecast.time.toISOString()} className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 w-12 text-right">
                {time}
              </span>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-full h-6 relative overflow-hidden">
                  <div 
                    className="bg-green-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${barWidth}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                    {forecast.windSpeed} km/h
                  </span>
                </div>
              </div>
              <span className="text-sm text-gray-600 w-8">
                💨
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}