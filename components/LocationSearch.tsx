'use client'

import { useState, useRef, useEffect } from 'react'
import { LocationService, Location } from '@/lib/location.service'

interface LocationSearchProps {
  onLocationSelect: (location: Location) => void
  currentLocationId?: string
}

export function LocationSearch({ onLocationSelect, currentLocationId }: LocationSearchProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchLocations = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const results = await LocationService.searchLocations(searchQuery)
      setSuggestions(results)
      setIsOpen(true)
    } catch (error) {
      console.error('Search failed:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)

    // Debounce search
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      searchLocations(value)
    }, 300)
  }

  const handleLocationSelect = (location: Location) => {
    onLocationSelect(location)
    setQuery('')
    setSuggestions([])
    setIsOpen(false)
  }

  const handleUseCurrentLocation = async () => {
    setIsLoading(true)
    try {
      const position = await LocationService.getCurrentPosition()
      const name = await LocationService.reverseGeocode(position.latitude, position.longitude)
      
      const currentLocation: Location = {
        id: 'current',
        name,
        latitude: position.latitude,
        longitude: position.longitude,
        isCurrentLocation: true,
        isFavorite: false,
      }
      
      onLocationSelect(currentLocation)
    } catch (error) {
      console.error('Failed to get current location:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search for a location..."
          className="w-full px-4 py-3 pr-10 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {isOpen && (suggestions.length > 0 || query.length >= 2) && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto">
          <button
            onClick={handleUseCurrentLocation}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100"
          >
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-primary font-medium">Use exact location</span>
          </button>

          {suggestions.map((location) => (
            <button
              key={location.id}
              onClick={() => handleLocationSelect(location)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between ${
                location.id === currentLocationId ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{location.name}</p>
              </div>
              {location.isFavorite && (
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}
            </button>
          ))}

          {suggestions.length === 0 && query.length >= 2 && !isLoading && (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No locations found
            </div>
          )}
        </div>
      )}
    </div>
  )
}