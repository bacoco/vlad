'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { WeatherResponse } from '@/types/weather'
import { UserPreferences } from '@/types/user-preferences'
import { Location } from '@/lib/location.service'
import { WeatherService } from '@/lib/weather.service'
import { APP_CONFIG } from '@/lib/constants'

interface WeatherContextType {
  currentLocation: Location | null
  weatherData: WeatherResponse | null
  isLoading: boolean
  error: Error | null
  preferences: UserPreferences
  setCurrentLocation: (location: Location) => void
  refreshWeather: () => Promise<void>
  updatePreferences: (preferences: Partial<UserPreferences>) => void
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined)

const DEFAULT_PREFERENCES: UserPreferences = {
  temperatureUnit: 'C',
  theme: 'system',
  favoriteLocations: [],
  lastViewedLocation: '',
}

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [weatherCache, setWeatherCache] = useState<Map<string, { data: WeatherResponse; timestamp: number }>>(new Map())

  // Load preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('weather-pwa-preferences')
      if (stored) {
        setPreferences(JSON.parse(stored))
      }
    }
  }, [])

  // Save preferences to localStorage
  const updatePreferences = useCallback((newPrefs: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...newPrefs }
    setPreferences(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('weather-pwa-preferences', JSON.stringify(updated))
    }
  }, [preferences])

  // Fetch weather data
  const fetchWeatherData = useCallback(async (location: Location) => {
    const cacheKey = `${location.latitude}-${location.longitude}`
    const cached = weatherCache.get(cacheKey)
    
    // Use cache if available and less than 10 minutes old
    if (cached && Date.now() - cached.timestamp < APP_CONFIG.WEATHER_UPDATE_INTERVAL) {
      setWeatherData(cached.data)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await WeatherService.getWeatherData(location.latitude, location.longitude)
      setWeatherData(data)
      
      // Update cache
      const newCache = new Map(weatherCache)
      newCache.set(cacheKey, { data, timestamp: Date.now() })
      setWeatherCache(newCache)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch weather data'))
    } finally {
      setIsLoading(false)
    }
  }, [weatherCache])

  // Update weather when location changes
  useEffect(() => {
    if (currentLocation) {
      fetchWeatherData(currentLocation)
      updatePreferences({ lastViewedLocation: currentLocation.id })
    }
  }, [currentLocation, fetchWeatherData, updatePreferences])

  // Auto-refresh weather data
  useEffect(() => {
    if (!currentLocation) return

    const interval = setInterval(() => {
      fetchWeatherData(currentLocation)
    }, APP_CONFIG.WEATHER_UPDATE_INTERVAL)

    return () => clearInterval(interval)
  }, [currentLocation, fetchWeatherData])

  const refreshWeather = useCallback(async () => {
    if (currentLocation) {
      await fetchWeatherData(currentLocation)
    }
  }, [currentLocation, fetchWeatherData])

  const value = {
    currentLocation,
    weatherData,
    isLoading,
    error,
    preferences,
    setCurrentLocation,
    refreshWeather,
    updatePreferences,
  }

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>
}

export function useWeather() {
  const context = useContext(WeatherContext)
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider')
  }
  return context
}