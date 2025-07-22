import { WeatherService } from '../weather.service'
import { WEATHER_CODES } from '../constants'

// Mock fetch globally
global.fetch = jest.fn()

describe('WeatherService', () => {
  const mockLatitude = 37.7749
  const mockLongitude = -122.4194

  const mockApiResponse = {
    current: {
      time: '2025-01-22T12:00',
      temperature_2m: 20,
      relative_humidity_2m: 65,
      apparent_temperature: 18,
      precipitation: 0,
      rain: 0,
      weather_code: 2,
      pressure_msl: 1013,
      surface_pressure: 1012,
      wind_speed_10m: 15,
      wind_direction_10m: 180,
      uv_index: 5,
      visibility: 10000
    },
    hourly: {
      time: ['2025-01-22T00:00', '2025-01-22T01:00'],
      temperature_2m: [18, 19],
      relative_humidity_2m: [70, 68],
      precipitation_probability: [0, 0],
      precipitation: [0, 0],
      weather_code: [2, 2],
      wind_speed_10m: [12, 13]
    },
    daily: {
      time: ['2025-01-22', '2025-01-23'],
      weather_code: [2, 1],
      temperature_2m_max: [22, 24],
      temperature_2m_min: [15, 16],
      sunrise: ['2025-01-22T07:00', '2025-01-23T07:01'],
      sunset: ['2025-01-22T17:30', '2025-01-23T17:31'],
      precipitation_sum: [0, 0],
      wind_speed_10m_max: [20, 18]
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockReset()
  })

  it('fetches weather data successfully', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse
    })

    const result = await WeatherService.getWeatherData(mockLatitude, mockLongitude)

    // Verify API call
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.open-meteo.com/v1/forecast')
    )
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(`latitude=${mockLatitude}`)
    )
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(`longitude=${mockLongitude}`)
    )

    // Verify transformed data
    expect(result.current).toBeDefined()
    expect(result.current.temperature).toBe(20)
    expect(result.current.humidity).toBe(65)
    expect(result.current.condition).toBe(WEATHER_CODES[2].description)
    
    expect(result.hourly).toHaveLength(2)
    expect(result.daily).toHaveLength(2)
  })

  it('handles API errors gracefully', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500
    })

    await expect(
      WeatherService.getWeatherData(mockLatitude, mockLongitude)
    ).rejects.toThrow('Weather API error: 500')
  })

  it('handles network errors', async () => {
    const networkError = new Error('Network error')
    ;(fetch as jest.Mock).mockRejectedValue(networkError)

    await expect(
      WeatherService.getWeatherData(mockLatitude, mockLongitude)
    ).rejects.toThrow(networkError)
  })

  it('converts temperature correctly', () => {
    expect(WeatherService.convertTemperature(0, 'C', 'F')).toBe(32)
    expect(WeatherService.convertTemperature(100, 'C', 'F')).toBe(212)
    expect(WeatherService.convertTemperature(32, 'F', 'C')).toBe(0)
    expect(WeatherService.convertTemperature(20, 'C', 'C')).toBe(20)
  })

  it('gets wind direction correctly', () => {
    expect(WeatherService.getWindDirection(0)).toBe('N')
    expect(WeatherService.getWindDirection(45)).toBe('NE')
    expect(WeatherService.getWindDirection(90)).toBe('E')
    expect(WeatherService.getWindDirection(180)).toBe('S')
    expect(WeatherService.getWindDirection(270)).toBe('W')
    expect(WeatherService.getWindDirection(360)).toBe('N')
  })

  it('gets UV index level correctly', () => {
    expect(WeatherService.getUVIndexLevel(1)).toBe('Low')
    expect(WeatherService.getUVIndexLevel(3)).toBe('Moderate')
    expect(WeatherService.getUVIndexLevel(6)).toBe('High')
    expect(WeatherService.getUVIndexLevel(8)).toBe('Very High')
    expect(WeatherService.getUVIndexLevel(11)).toBe('Extreme')
  })

  it('includes all required parameters in API call', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse
    })

    await WeatherService.getWeatherData(mockLatitude, mockLongitude)

    const url = (fetch as jest.Mock).mock.calls[0][0]
    expect(url).toContain('current=temperature_2m')
    expect(url).toContain('hourly=temperature_2m')
    expect(url).toContain('daily=weather_code')
    expect(url).toContain('timezone=auto')
    expect(url).toContain('forecast_days=7')
  })

  it('handles unknown weather codes', async () => {
    const responseWithUnknownCode = {
      ...mockApiResponse,
      current: {
        ...mockApiResponse.current,
        weather_code: 999 // Unknown code
      }
    }

    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => responseWithUnknownCode
    })

    const result = await WeatherService.getWeatherData(mockLatitude, mockLongitude)
    
    expect(result.current.condition).toBe('Unknown')
  })

  it('transforms hourly forecast correctly', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse
    })

    const result = await WeatherService.getWeatherData(mockLatitude, mockLongitude)
    
    expect(result.hourly[0]).toMatchObject({
      temperature: 18,
      humidity: 70,
      precipitationProbability: 0,
      windSpeed: 12
    })
  })

  it('transforms daily forecast correctly', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse
    })

    const result = await WeatherService.getWeatherData(mockLatitude, mockLongitude)
    
    expect(result.daily[0]).toMatchObject({
      high: 22,
      low: 15,
      precipitationSum: 0,
      windSpeedMax: 20
    })
  })

  it('logs errors to console', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation()
    const error = new Error('API Error')
    ;(fetch as jest.Mock).mockRejectedValue(error)

    await expect(
      WeatherService.getWeatherData(mockLatitude, mockLongitude)
    ).rejects.toThrow(error)

    expect(consoleError).toHaveBeenCalledWith('Failed to fetch weather data:', error)
    
    consoleError.mockRestore()
  })
})