export interface Post {
  id: string
  title: string
  description: string  // 必須フィールド（データベーススキーマに合わせて修正）
  category: string
  contact: string  // 必須フィールド
  created_at: string
  // オプショナルフィールド
  location?: string
  updated_at?: string
  images?: string[]
  image_url?: string
  price?: number | null
  author?: string
  contact_info?: string
  // 新しい汎用フィールド
  work_date?: string
  conditions?: string
  tags?: string[]
  reward_type?: 'money' | 'non_money' | 'both' | 'free'
  reward_details?: string
  requirements?: string
  age_friendly?: boolean
  // 地図リンク
  map_link?: string
  // TODO: 広告フラグ（未実装）
  // is_ad?: boolean  // データベースに is_ad カラムを追加後に有効化
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

export type Category = '不動産' | '仕事' | '不用品' | '農業' | 'イベント' | 'ボランティア' | 'すべて'

export interface Theme {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
}

export type ThemeName = string