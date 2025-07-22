export interface UserPreferences {
  temperatureUnit: 'C' | 'F'
  theme: 'light' | 'dark' | 'system'
  favoriteLocations: string[]
  lastViewedLocation: string
}