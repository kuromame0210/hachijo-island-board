export interface Post {
  id: string
  title: string
  description: string  // 必須フィールド（データベーススキーマに合わせて修正）
  category: string
  contact: string  // 必須フィールド
  created_at: string
  status: string  // 投稿ステータス（active, hidden, deleted）
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
  // iframe埋め込みコード
  iframe_embed?: string
  // 連絡先公開フラグ
  contact_public?: boolean  // true: 連絡先を公開、false: 非公開（コメントのみ）
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

// カテゴリーの型定義は categories.ts から import
import { CategoryKey } from '@/lib/categories'

export type Category = CategoryKey | 'all'  // 'all' はフィルター用

export interface Theme {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
}

export type ThemeName = string