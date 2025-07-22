import { renderHook, act, waitFor } from '@testing-library/react'
import { useGeolocation } from '../useGeolocation'
import { LocationService } from '@/lib/location.service'

// Mock the LocationService
jest.mock('@/lib/location.service', () => ({
  LocationService: {
    getCurrentPosition: jest.fn(),
    reverseGeocode: jest.fn()
  }
}))

describe('useGeolocation', () => {
  const mockPosition = {
    latitude: 37.7749,
    longitude: -122.4194,
    accuracy: 50
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('requests location on mount', async () => {
    ;(LocationService.getCurrentPosition as jest.Mock).mockResolvedValue(mockPosition)
    ;(LocationService.reverseGeocode as jest.Mock).mockResolvedValue('San Francisco, CA')

    const { result } = renderHook(() => useGeolocation())

    expect(result.current.loading).toBe(true)
    expect(LocationService.getCurrentPosition).toHaveBeenCalled()

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.position).toEqual(mockPosition)
      expect(result.current.locationName).toBe('San Francisco, CA')
      expect(result.current.error).toBeNull()
    })
  })

  it('handles geolocation errors', async () => {
    const mockError = new Error('Geolocation denied')
    ;(LocationService.getCurrentPosition as jest.Mock).mockRejectedValue(mockError)

    const { result } = renderHook(() => useGeolocation())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.position).toBeNull()
      expect(result.current.locationName).toBeNull()
      expect(result.current.error).toEqual(mockError)
    })
  })

  it('handles reverse geocoding errors gracefully', async () => {
    ;(LocationService.getCurrentPosition as jest.Mock).mockResolvedValue(mockPosition)
    ;(LocationService.reverseGeocode as jest.Mock).mockRejectedValue(new Error('Geocoding failed'))

    const { result } = renderHook(() => useGeolocation())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.position).toEqual(mockPosition)
      expect(result.current.error).toBeNull() // Position still succeeds
    })
  })

  it('allows manual location request', async () => {
    ;(LocationService.getCurrentPosition as jest.Mock).mockResolvedValue(mockPosition)
    ;(LocationService.reverseGeocode as jest.Mock).mockResolvedValue('San Francisco, CA')

    const { result } = renderHook(() => useGeolocation())

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Clear mocks
    jest.clearAllMocks()

    // Manually request location
    act(() => {
      result.current.requestLocation()
    })

    expect(result.current.loading).toBe(true)
    expect(LocationService.getCurrentPosition).toHaveBeenCalled()

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('converts non-Error objects to Error instances', async () => {
    ;(LocationService.getCurrentPosition as jest.Mock).mockRejectedValue('String error')

    const { result } = renderHook(() => useGeolocation())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toBe('Failed to get location')
    })
  })

  it('does not request location if position already exists', () => {
    ;(LocationService.getCurrentPosition as jest.Mock).mockResolvedValue(mockPosition)
    ;(LocationService.reverseGeocode as jest.Mock).mockResolvedValue('San Francisco, CA')

    // First render
    const { result, unmount } = renderHook(() => useGeolocation())
    
    // Wait for location to be set
    waitFor(() => {
      expect(result.current.position).toEqual(mockPosition)
    })

    unmount()
    jest.clearAllMocks()

    // Second render with position already set
    renderHook(() => useGeolocation())

    // Should not request location again on mount
    expect(LocationService.getCurrentPosition).not.toHaveBeenCalled()
  })

  it('clears error when requesting location again', async () => {
    const mockError = new Error('Initial error')
    ;(LocationService.getCurrentPosition as jest.Mock).mockRejectedValue(mockError)

    const { result } = renderHook(() => useGeolocation())

    // Wait for error
    await waitFor(() => {
      expect(result.current.error).toEqual(mockError)
    })

    // Mock successful response
    ;(LocationService.getCurrentPosition as jest.Mock).mockResolvedValue(mockPosition)
    ;(LocationService.reverseGeocode as jest.Mock).mockResolvedValue('San Francisco, CA')

    // Request location again
    act(() => {
      result.current.requestLocation()
    })

    // Error should be cleared immediately
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.position).toEqual(mockPosition)
      expect(result.current.error).toBeNull()
    })
  })
})