import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LocationSearch } from '../LocationSearch'
import { LocationService, Location } from '@/lib/location.service'

// Mock the LocationService
jest.mock('@/lib/location.service', () => ({
  LocationService: {
    searchLocations: jest.fn()
  }
}))

describe('LocationSearch', () => {
  const mockLocations: Location[] = [
    {
      id: '1',
      name: 'San Francisco',
      country: 'United States',
      latitude: 37.7749,
      longitude: -122.4194,
      timezone: 'America/Los_Angeles'
    },
    {
      id: '2',
      name: 'San Diego',
      country: 'United States',
      latitude: 32.7157,
      longitude: -117.1611,
      timezone: 'America/Los_Angeles'
    }
  ]

  const defaultProps = {
    onLocationSelect: jest.fn(),
    currentLocationId: '1'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('renders without crashing', () => {
    render(<LocationSearch {...defaultProps} />)
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
  })

  it('searches locations on input change with debounce', async () => {
    const user = userEvent.setup({ delay: null })
    ;(LocationService.searchLocations as jest.Mock).mockResolvedValue(mockLocations)
    
    render(<LocationSearch {...defaultProps} />)
    
    const input = screen.getByPlaceholderText(/search/i)
    await user.type(input, 'San')
    
    // Debounce timer should be set
    expect(LocationService.searchLocations).not.toHaveBeenCalled()
    
    // Fast-forward debounce timer
    jest.advanceTimersByTime(300)
    
    await waitFor(() => {
      expect(LocationService.searchLocations).toHaveBeenCalledWith('San')
    })
  })

  it('displays search suggestions', async () => {
    const user = userEvent.setup({ delay: null })
    ;(LocationService.searchLocations as jest.Mock).mockResolvedValue(mockLocations)
    
    render(<LocationSearch {...defaultProps} />)
    
    const input = screen.getByPlaceholderText(/search/i)
    await user.type(input, 'San')
    
    jest.advanceTimersByTime(300)
    
    await waitFor(() => {
      expect(screen.getByText('San Francisco')).toBeInTheDocument()
      expect(screen.getByText('San Diego')).toBeInTheDocument()
    })
  })

  it('does not search for queries less than 2 characters', async () => {
    const user = userEvent.setup({ delay: null })
    
    render(<LocationSearch {...defaultProps} />)
    
    const input = screen.getByPlaceholderText(/search/i)
    await user.type(input, 'S')
    
    jest.advanceTimersByTime(300)
    
    expect(LocationService.searchLocations).not.toHaveBeenCalled()
  })

  it('handles location selection', async () => {
    const user = userEvent.setup({ delay: null })
    ;(LocationService.searchLocations as jest.Mock).mockResolvedValue(mockLocations)
    
    render(<LocationSearch {...defaultProps} />)
    
    const input = screen.getByPlaceholderText(/search/i)
    await user.type(input, 'San')
    
    jest.advanceTimersByTime(300)
    
    await waitFor(() => {
      expect(screen.getByText('San Francisco')).toBeInTheDocument()
    })
    
    await user.click(screen.getByText('San Francisco'))
    
    expect(defaultProps.onLocationSelect).toHaveBeenCalledWith(mockLocations[0])
    expect(input).toHaveValue('')
  })

  it('closes suggestions on outside click', async () => {
    const user = userEvent.setup({ delay: null })
    ;(LocationService.searchLocations as jest.Mock).mockResolvedValue(mockLocations)
    
    render(
      <div>
        <LocationSearch {...defaultProps} />
        <button>Outside button</button>
      </div>
    )
    
    const input = screen.getByPlaceholderText(/search/i)
    await user.type(input, 'San')
    
    jest.advanceTimersByTime(300)
    
    await waitFor(() => {
      expect(screen.getByText('San Francisco')).toBeInTheDocument()
    })
    
    // Click outside
    await user.click(screen.getByText('Outside button'))
    
    await waitFor(() => {
      expect(screen.queryByText('San Francisco')).not.toBeInTheDocument()
    })
  })

  it('handles search errors gracefully', async () => {
    const user = userEvent.setup({ delay: null })
    const consoleError = jest.spyOn(console, 'error').mockImplementation()
    ;(LocationService.searchLocations as jest.Mock).mockRejectedValue(new Error('API Error'))
    
    render(<LocationSearch {...defaultProps} />)
    
    const input = screen.getByPlaceholderText(/search/i)
    await user.type(input, 'San')
    
    jest.advanceTimersByTime(300)
    
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Search failed:', expect.any(Error))
    })
    
    consoleError.mockRestore()
  })

  it('shows loading state during search', async () => {
    const user = userEvent.setup({ delay: null })
    ;(LocationService.searchLocations as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockLocations), 100))
    )
    
    render(<LocationSearch {...defaultProps} />)
    
    const input = screen.getByPlaceholderText(/search/i)
    await user.type(input, 'San')
    
    jest.advanceTimersByTime(300)
    
    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  it('cancels previous search on new input', async () => {
    const user = userEvent.setup({ delay: null })
    ;(LocationService.searchLocations as jest.Mock).mockResolvedValue(mockLocations)
    
    render(<LocationSearch {...defaultProps} />)
    
    const input = screen.getByPlaceholderText(/search/i)
    await user.type(input, 'San')
    
    // Don't wait for debounce
    await user.clear(input)
    await user.type(input, 'New')
    
    jest.advanceTimersByTime(300)
    
    await waitFor(() => {
      expect(LocationService.searchLocations).toHaveBeenCalledTimes(1)
      expect(LocationService.searchLocations).toHaveBeenCalledWith('New')
    })
  })
})