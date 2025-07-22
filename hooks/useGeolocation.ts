import { useState, useEffect, useCallback } from 'react'
import { LocationService, GeolocationPosition } from '@/lib/location.service'

interface UseGeolocationReturn {
  position: GeolocationPosition | null
  locationName: string | null
  loading: boolean
  error: Error | null
  requestLocation: () => void
}

export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeolocationPosition | null>(null)
  const [locationName, setLocationName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const requestLocation = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const pos = await LocationService.getCurrentPosition()
      setPosition(pos)

      // Get location name
      const name = await LocationService.reverseGeocode(pos.latitude, pos.longitude)
      setLocationName(name)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get location'))
    } finally {
      setLoading(false)
    }
  }, [])

  // Request location on mount if not already set
  useEffect(() => {
    if (!position) {
      requestLocation()
    }
  }, [])

  return {
    position,
    locationName,
    loading,
    error,
    requestLocation,
  }
}