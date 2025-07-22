export interface WeatherData {
  temperature: number
  temperatureUnit: 'C' | 'F'
  condition: string
  conditionCode: number
  humidity: number
  windSpeed: number
  windDirection: number
  precipitation: number
  pressure: number
  uvIndex: number
  feelsLike: number
  visibility: number
  icon: string
  timestamp: Date
}

export interface HourlyForecast {
  time: Date
  temperature: number
  condition: string
  conditionCode: number
  precipitation: number
  windSpeed: number
  humidity: number
}

export interface DailyForecast {
  date: Date
  tempHigh: number
  tempLow: number
  condition: string
  conditionCode: number
  icon: string
  precipitation: number
  windSpeed: number
  sunrise: Date
  sunset: Date
}

export interface WeatherAlert {
  id: string
  type: string
  severity: 'minor' | 'moderate' | 'severe' | 'extreme'
  headline: string
  description: string
  startTime: Date
  endTime: Date
  locationId: string
}

export interface WeatherResponse {
  current: WeatherData
  hourly: HourlyForecast[]
  daily: DailyForecast[]
  alerts?: WeatherAlert[]
}