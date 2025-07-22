export interface Location {
  id: string
  name: string
  latitude: number
  longitude: number
  isCurrentLocation: boolean
  isFavorite: boolean
}

export interface GeolocationPosition {
  latitude: number
  longitude: number
}

export class LocationService {
  private static readonly STORAGE_KEY = 'weather-pwa-locations'
  private static readonly FAVORITES_KEY = 'weather-pwa-favorites'

  static async getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      )
    })
  }

  static async reverseGeocode(lat: number, lon: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      )
      const data = await response.json()
      
      const city = data.address?.city || 
                  data.address?.town || 
                  data.address?.village || 
                  data.address?.municipality ||
                  'Unknown Location'
      
      const country = data.address?.country || ''
      
      return country ? `${city}, ${country}` : city
    } catch (error) {
      console.error('Reverse geocoding failed:', error)
      return 'Unknown Location'
    }
  }

  static async searchLocations(query: string): Promise<Location[]> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&limit=5`
      )
      const data = await response.json()

      return data.map((item: any) => ({
        id: `${item.lat}-${item.lon}`,
        name: item.display_name.split(',').slice(0, 3).join(','),
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        isCurrentLocation: false,
        isFavorite: this.isFavorite(`${item.lat}-${item.lon}`),
      }))
    } catch (error) {
      console.error('Location search failed:', error)
      return []
    }
  }

  static saveLocations(locations: Location[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(locations))
    }
  }

  static getLocations(): Location[] {
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem(this.STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  }

  static saveFavorite(locationId: string): void {
    const favorites = this.getFavorites()
    if (!favorites.includes(locationId)) {
      favorites.push(locationId)
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites))
      }
    }
  }

  static removeFavorite(locationId: string): void {
    const favorites = this.getFavorites()
    const filtered = favorites.filter(id => id !== locationId)
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(filtered))
    }
  }

  static getFavorites(): string[] {
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem(this.FAVORITES_KEY)
    return stored ? JSON.parse(stored) : []
  }

  static isFavorite(locationId: string): boolean {
    return this.getFavorites().includes(locationId)
  }

  static toggleFavorite(locationId: string): boolean {
    if (this.isFavorite(locationId)) {
      this.removeFavorite(locationId)
      return false
    } else {
      this.saveFavorite(locationId)
      return true
    }
  }
}