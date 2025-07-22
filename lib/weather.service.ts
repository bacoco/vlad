import { WeatherData, HourlyForecast, DailyForecast, WeatherResponse } from '@/types/weather'
import { WEATHER_CODES } from '@/lib/constants'

export class WeatherService {
  private static readonly BASE_URL = 'https://api.open-meteo.com/v1/forecast'
  
  static async getWeatherData(latitude: number, longitude: number): Promise<WeatherResponse> {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,uv_index,visibility',
      hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,wind_speed_10m_max',
      timezone: 'auto',
      forecast_days: '7',
    })

    try {
      const response = await fetch(`${this.BASE_URL}?${params}`)
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`)
      }

      const data = await response.json()
      return this.transformWeatherData(data)
    } catch (error) {
      console.error('Failed to fetch weather data:', error)
      throw error
    }
  }

  private static transformWeatherData(data: any): WeatherResponse {
    const current = this.transformCurrentWeather(data)
    const hourly = this.transformHourlyForecast(data)
    const daily = this.transformDailyForecast(data)

    return {
      current,
      hourly,
      daily,
      alerts: [], // Open-Meteo doesn't provide alerts in free tier
    }
  }

  private static transformCurrentWeather(data: any): WeatherData {
    const current = data.current
    const weatherCode = current.weather_code
    const weatherInfo = WEATHER_CODES[weatherCode as keyof typeof WEATHER_CODES] || { description: 'Unknown', icon: '❓' }

    return {
      temperature: Math.round(current.temperature_2m),
      temperatureUnit: 'C',
      condition: weatherInfo.description,
      conditionCode: weatherCode,
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      windDirection: current.wind_direction_10m,
      precipitation: current.precipitation || 0,
      pressure: Math.round(current.pressure_msl),
      uvIndex: current.uv_index || 0,
      feelsLike: Math.round(current.apparent_temperature),
      visibility: current.visibility ? current.visibility / 1000 : 10, // Convert to km
      icon: weatherInfo.icon,
      timestamp: new Date(current.time),
    }
  }

  private static transformHourlyForecast(data: any): HourlyForecast[] {
    const hourly = data.hourly
    const forecasts: HourlyForecast[] = []
    
    // Get next 24 hours
    const now = new Date()
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    
    for (let i = 0; i < hourly.time.length && i < 24; i++) {
      const time = new Date(hourly.time[i])
      if (time > twentyFourHoursLater) break
      
      const weatherCode = hourly.weather_code[i]
      const weatherInfo = WEATHER_CODES[weatherCode as keyof typeof WEATHER_CODES] || { description: 'Unknown', icon: '❓' }
      
      forecasts.push({
        time,
        temperature: Math.round(hourly.temperature_2m[i]),
        condition: weatherInfo.description,
        conditionCode: weatherCode,
        precipitation: hourly.precipitation_probability[i] || 0,
        windSpeed: Math.round(hourly.wind_speed_10m[i]),
        humidity: hourly.relative_humidity_2m[i],
      })
    }
    
    return forecasts
  }

  private static transformDailyForecast(data: any): DailyForecast[] {
    const daily = data.daily
    const forecasts: DailyForecast[] = []
    
    for (let i = 0; i < daily.time.length && i < 7; i++) {
      const weatherCode = daily.weather_code[i]
      const weatherInfo = WEATHER_CODES[weatherCode as keyof typeof WEATHER_CODES] || { description: 'Unknown', icon: '❓' }
      
      forecasts.push({
        date: new Date(daily.time[i]),
        tempHigh: Math.round(daily.temperature_2m_max[i]),
        tempLow: Math.round(daily.temperature_2m_min[i]),
        condition: weatherInfo.description,
        conditionCode: weatherCode,
        icon: weatherInfo.icon,
        precipitation: daily.precipitation_sum[i] || 0,
        windSpeed: Math.round(daily.wind_speed_10m_max[i]),
        sunrise: new Date(daily.sunrise[i]),
        sunset: new Date(daily.sunset[i]),
      })
    }
    
    return forecasts
  }

  static convertTemperature(temp: number, from: 'C' | 'F', to: 'C' | 'F'): number {
    if (from === to) return temp
    if (from === 'C' && to === 'F') return Math.round((temp * 9/5) + 32)
    return Math.round((temp - 32) * 5/9)
  }

  static getWindDirection(degrees: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    const index = Math.round(degrees / 45) % 8
    return directions[index]
  }

  static getUVIndexLevel(index: number): string {
    if (index <= 2) return 'Low'
    if (index <= 5) return 'Moderate'
    if (index <= 7) return 'High'
    if (index <= 10) return 'Very High'
    return 'Extreme'
  }
}