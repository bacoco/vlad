'use client'

import { useState, useEffect } from 'react'
import { LocationSearch } from '@/components/LocationSearch'
import { LocationList } from '@/components/LocationList'
import { WeatherDisplay } from '@/components/WeatherDisplay'
import { WeatherSkeleton } from '@/components/WeatherSkeleton'
import { DailyForecast } from '@/components/DailyForecast'
import { WeatherTabs } from '@/components/WeatherTabs'
import { ThemeToggle } from '@/components/ThemeToggle'
import { WeatherBackground } from '@/components/WeatherBackground'
import { MobileHeader, MobileDrawer } from '@/components/MobileHeader'
import { LocationService, Location } from '@/lib/location.service'
import { useWeather } from '@/components/providers/WeatherProvider'
import { useTheme } from '@/components/providers/ThemeProvider'
import { APP_CONFIG } from '@/lib/constants'

export default function HomePage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const { resolvedTheme } = useTheme()
  const { 
    currentLocation, 
    weatherData, 
    isLoading: isWeatherLoading, 
    error: weatherError,
    preferences,
    setCurrentLocation,
    refreshWeather,
    updatePreferences
  } = useWeather()

  useEffect(() => {
    // Load saved locations
    const savedLocations = LocationService.getLocations()
    setLocations(savedLocations)
    
    // Set current location if available
    if (savedLocations.length > 0) {
      setCurrentLocation(savedLocations[0])
    } else {
      // Use default location
      const defaultLocation: Location = {
        id: 'default',
        name: APP_CONFIG.DEFAULT_LOCATION.name,
        latitude: APP_CONFIG.DEFAULT_LOCATION.latitude,
        longitude: APP_CONFIG.DEFAULT_LOCATION.longitude,
        isCurrentLocation: false,
        isFavorite: false,
      }
      setCurrentLocation(defaultLocation)
    }
    
    setIsInitialized(true)
  }, [])

  const handleLocationSelect = (location: Location) => {
    setCurrentLocation(location)
    
    // Add to locations if not already present
    const existingIndex = locations.findIndex(l => l.id === location.id)
    if (existingIndex === -1) {
      const newLocations = [...locations, location]
      setLocations(newLocations)
      LocationService.saveLocations(newLocations)
    }
  }

  const handleLocationRemove = (locationId: string) => {
    const newLocations = locations.filter(l => l.id !== locationId)
    setLocations(newLocations)
    LocationService.saveLocations(newLocations)
    
    // If current location was removed, switch to first available
    if (currentLocation?.id === locationId) {
      setCurrentLocation(newLocations[0] || null)
    }
  }

  const handleFavoriteToggle = (locationId: string) => {
    const newLocations = locations.map(l => 
      l.id === locationId 
        ? { ...l, isFavorite: LocationService.toggleFavorite(locationId) }
        : l
    )
    setLocations(newLocations)
    LocationService.saveLocations(newLocations)
  }

  const handleTemperatureToggle = () => {
    const newUnit = preferences.temperatureUnit === 'C' ? 'F' : 'C'
    updatePreferences({ temperatureUnit: newUnit })
  }

  if (!isInitialized) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </main>
    )
  }

  return (
    <>
      <WeatherBackground weather={weatherData?.current || null} resolvedTheme={resolvedTheme} />
      
      <MobileHeader
        currentLocation={currentLocation}
        onMenuClick={() => setIsMobileMenuOpen(true)}
        onSearchClick={() => setIsMobileSearchOpen(true)}
      />
      
      <main className="min-h-screen bg-background dark:bg-background pb-6 relative">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Desktop Header */}
          <header className="hidden md:block mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="w-10" /> {/* Spacer for centering */}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center">
                Weather PWA
              </h1>
              <ThemeToggle />
            </div>
            
            {/* Location Search */}
            <LocationSearch
              onLocationSelect={handleLocationSelect}
              currentLocationId={currentLocation?.id}
            />
          </header>

          {/* Mobile Search Modal */}
          {isMobileSearchOpen && (
            <div className="md:hidden fixed inset-0 z-50 bg-white dark:bg-gray-900">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Search Location</h2>
                  <button
                    onClick={() => setIsMobileSearchOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <LocationSearch
                  onLocationSelect={(location) => {
                    handleLocationSelect(location)
                    setIsMobileSearchOpen(false)
                  }}
                  currentLocationId={currentLocation?.id}
                />
              </div>
            </div>
          )}

        {/* Current Weather Section */}
        <section className="mb-8">
          {currentLocation && (
            <div className="bg-card dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {currentLocation.name}
                  </h2>
                  {weatherData && (
                    <p className="text-sm text-gray-500 mt-1">
                      Updated {new Date(weatherData.current.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {currentLocation.isCurrentLocation && (
                    <span className="text-sm text-primary flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Current
                    </span>
                  )}
                  <button
                    onClick={refreshWeather}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Refresh weather"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {weatherError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-700">Failed to load weather data</p>
                  <p className="text-sm text-red-600 mt-1">{weatherError.message}</p>
                  <button
                    onClick={refreshWeather}
                    className="mt-2 text-sm text-red-700 underline hover:no-underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {isWeatherLoading && !weatherData && <WeatherSkeleton />}

              {weatherData && !isWeatherLoading && (
                <WeatherDisplay
                  weather={weatherData.current}
                  temperatureUnit={preferences.temperatureUnit}
                  onTemperatureClick={handleTemperatureToggle}
                />
              )}

              {!weatherData && !isWeatherLoading && !weatherError && (
                <p className="text-gray-500 text-center py-12">
                  Loading weather data...
                </p>
              )}
            </div>
          )}
        </section>

        {/* Weather Forecast Section */}
        {weatherData && currentLocation && (
          <>
            {/* Hourly Forecast with Tabs */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Hourly Forecast
              </h2>
              <WeatherTabs 
                hourlyForecasts={weatherData.hourly}
                temperatureUnit={preferences.temperatureUnit}
              />
            </section>

            {/* Daily Forecast */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                7-Day Forecast
              </h2>
              <DailyForecast 
                forecasts={weatherData.daily}
                temperatureUnit={preferences.temperatureUnit}
              />
            </section>
          </>
        )}

        {/* Saved Locations - Desktop Only */}
        <section className="hidden md:block">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Saved Locations
          </h2>
          <LocationList
            locations={locations}
            currentLocationId={currentLocation?.id}
            onLocationSelect={handleLocationSelect}
            onLocationRemove={handleLocationRemove}
            onFavoriteToggle={handleFavoriteToggle}
          />
        </section>
      </div>
    </main>

    {/* Mobile Drawer for Locations */}
    <MobileDrawer
      isOpen={isMobileMenuOpen}
      onClose={() => setIsMobileMenuOpen(false)}
    >
      <LocationList
        locations={locations}
        currentLocationId={currentLocation?.id}
        onLocationSelect={(location) => {
          handleLocationSelect(location)
          setIsMobileMenuOpen(false)
        }}
        onLocationRemove={handleLocationRemove}
        onFavoriteToggle={handleFavoriteToggle}
      />
    </MobileDrawer>
    </>
  )
}