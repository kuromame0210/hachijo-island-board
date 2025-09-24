export interface Post {
  id: string
  title: string
  content: string
  description?: string
  category: string
  location?: string
  created_at: string
  updated_at?: string
  images?: string[]
  image_url?: string
  price?: number | null
  author?: string
  contact?: string
  contact_info?: string
}

export interface LocationResult {
  status: 'success' | 'error' | 'denied'
  isInHachijo: boolean
  latitude?: number
  longitude?: number
  method?: 'gps' | 'ip'
  error?: string
  timestamp: number
}

export interface LocationData {
  latitude: number
  longitude: number
  accuracy?: number
  timestamp: number
}

export type Category = '不動産' | '仕事' | '不用品' | 'すべて'

export interface Theme {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
}

export type ThemeName = string