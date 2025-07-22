'use client'

import { useState, useEffect } from 'react'
import { LocationSearch } from '@/components/LocationSearch'
import { LocationList } from '@/components/LocationList'
import { LocationService, Location } from '@/lib/location.service'
import { APP_CONFIG } from '@/lib/constants'

export default function HomePage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
    
    setIsLoading(false)
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

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">
            Weather PWA
          </h1>
          
          {/* Location Search */}
          <LocationSearch
            onLocationSelect={handleLocationSelect}
            currentLocationId={currentLocation?.id}
          />
        </header>

        {/* Current Weather Section */}
        <section className="mb-8">
          {currentLocation && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentLocation.name}
                </h2>
                {currentLocation.isCurrentLocation && (
                  <span className="text-sm text-primary flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Current location
                  </span>
                )}
              </div>
              
              <p className="text-gray-500 text-center py-12">
                Weather data will be displayed here
              </p>
            </div>
          )}
        </section>

        {/* Saved Locations */}
        <section>
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
  )
}