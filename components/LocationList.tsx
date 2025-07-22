'use client'

import { Location } from '@/lib/location.service'

interface LocationListProps {
  locations: Location[]
  currentLocationId?: string
  onLocationSelect: (location: Location) => void
  onLocationRemove: (locationId: string) => void
  onFavoriteToggle: (locationId: string) => void
}

export function LocationList({
  locations,
  currentLocationId,
  onLocationSelect,
  onLocationRemove,
  onFavoriteToggle,
}: LocationListProps) {
  if (locations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No saved locations yet</p>
        <p className="text-sm text-gray-400 mt-1">Search for a location to add it</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {locations.map((location) => (
        <div
          key={location.id}
          className={`relative group flex items-center p-3 rounded-lg transition-colors cursor-pointer ${
            location.id === currentLocationId
              ? 'bg-blue-50 border border-blue-200'
              : 'bg-white hover:bg-gray-50 border border-gray-200'
          }`}
          onClick={() => onLocationSelect(location)}
        >
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              {location.isCurrentLocation && (
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
              <span className="font-medium text-gray-900">{location.name}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onFavoriteToggle(location.id)
              }}
              className="p-1 rounded hover:bg-gray-200 transition-colors"
              aria-label={location.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg
                className={`w-5 h-5 ${
                  location.isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-400'
                }`}
                fill={location.isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>

            {!location.isCurrentLocation && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onLocationRemove(location.id)
                }}
                className="p-1 rounded hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Remove location"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}