import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WeatherDisplay } from '../WeatherDisplay'
import { WeatherData } from '@/types/weather'
import { WeatherService } from '@/lib/weather.service'

// Mock the WeatherService
jest.mock('@/lib/weather.service', () => ({
  WeatherService: {
    convertTemperature: jest.fn((temp, from, to) => {
      if (from === 'C' && to === 'F') {
        return Math.round(temp * 9/5 + 32)
      }
      return temp
    })
  }
}))

// Mock the WeatherIcon component
jest.mock('../WeatherIcon', () => ({
  WeatherIcon: ({ code, size, animated }: any) => (
    <div data-testid="weather-icon" data-code={code} data-size={size} data-animated={animated}>
      Weather Icon
    </div>
  )
}))

describe('WeatherDisplay', () => {
  const mockWeatherData: WeatherData = {
    temperature: 20,
    feelsLike: 18,
    condition: 'Partly Cloudy',
    conditionCode: 2,
    humidity: 65,
    windSpeed: 15,
    windDirection: 180,
    pressure: 1013,
    uvIndex: 5,
    visibility: 10,
    precipitation: 0,
    timestamp: new Date('2025-01-22T12:00:00Z')
  }

  const defaultProps = {
    weather: mockWeatherData,
    temperatureUnit: 'C' as const,
    onTemperatureClick: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<WeatherDisplay {...defaultProps} />)
    expect(screen.getByText('Partly Cloudy')).toBeInTheDocument()
  })

  it('displays temperature in Celsius correctly', () => {
    render(<WeatherDisplay {...defaultProps} />)
    expect(screen.getByText(/20/)).toBeInTheDocument()
    expect(screen.getByText('°C')).toBeInTheDocument()
  })

  it('displays temperature in Fahrenheit correctly', () => {
    render(<WeatherDisplay {...defaultProps} temperatureUnit="F" />)
    expect(screen.getByText(/68/)).toBeInTheDocument() // 20°C = 68°F
    expect(screen.getByText('°F')).toBeInTheDocument()
  })

  it('handles temperature click correctly', async () => {
    const user = userEvent.setup()
    const mockHandler = jest.fn()
    
    render(<WeatherDisplay {...defaultProps} onTemperatureClick={mockHandler} />)
    
    const tempButton = screen.getByRole('button', { name: /20.*°C/i })
    await user.click(tempButton)
    
    expect(mockHandler).toHaveBeenCalledTimes(1)
  })

  it('displays feels like temperature', () => {
    render(<WeatherDisplay {...defaultProps} />)
    expect(screen.getByText(/Feels like 18°/)).toBeInTheDocument()
  })

  it('displays weather condition', () => {
    render(<WeatherDisplay {...defaultProps} />)
    expect(screen.getByText('Partly Cloudy')).toBeInTheDocument()
  })

  it('renders weather icon with correct props', () => {
    render(<WeatherDisplay {...defaultProps} />)
    const icon = screen.getByTestId('weather-icon')
    expect(icon).toHaveAttribute('data-code', '2')
    expect(icon).toHaveAttribute('data-size', 'large')
    expect(icon).toHaveAttribute('data-animated', 'true')
  })

  it('converts temperature when unit changes', () => {
    const { rerender } = render(<WeatherDisplay {...defaultProps} />)
    expect(screen.getByText(/20/)).toBeInTheDocument()
    
    rerender(<WeatherDisplay {...defaultProps} temperatureUnit="F" />)
    expect(screen.getByText(/68/)).toBeInTheDocument()
  })

  it('handles missing onTemperatureClick gracefully', async () => {
    const user = userEvent.setup()
    render(<WeatherDisplay weather={mockWeatherData} temperatureUnit="C" />)
    
    const tempButton = screen.getByRole('button', { name: /20.*°C/i })
    // Should not throw error when clicking without handler
    await user.click(tempButton)
  })

  it('applies correct CSS classes for responsive design', () => {
    render(<WeatherDisplay {...defaultProps} />)
    const tempButton = screen.getByRole('button', { name: /20.*°C/i })
    expect(tempButton).toHaveClass('text-6xl', 'sm:text-7xl', 'md:text-8xl')
  })
})