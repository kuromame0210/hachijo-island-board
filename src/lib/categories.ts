/**
 * カテゴリーマスタ定義
 * 
 * ## カテゴリー追加方法
 * 1. この CATEGORIES オブジェクトに新しいキーを追加
 * 2. データベース制約を更新（sql/update-category-constraint.sql）
 * 3. 必要に応じてバッジ色を getCategoryBadgeColor に追加（src/app/page.tsx）
 * 
 * ## 例：新カテゴリー「交換」を追加する場合
 * ```typescript
 * exchange: {
 *   label: '🔄 交換',
 *   icon: '🔄',
 *   color: 'bg-gradient-to-r from-teal-600 to-teal-700 text-white border-2 border-teal-800 shadow-md',
 *   order: 11,
 *   description: '物品の交換'
 * }
 * ```
 * 
 * ## 注意事項
 * - order は表示順序（小さい順）
 * - label にはアイコン絵文字を含める
 * - color はボタン用のTailwind CSSクラス
 * - 既存データがある場合は、データ移行SQLも必要
 */

export interface CategoryConfig {
  label: string       // 表示名（絵文字含む）
  icon: string        // アイコン絵文字
  color: string       // Tailwind CSSクラス
  order: number       // 表示順序
  description?: string // 説明（任意）
}

export const CATEGORIES = {
  // 既存カテゴリー（DB移行対象）
  real_estate: {
    label: '不動産',
    icon: '',
    color: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-2 border-blue-800 shadow-md',
    order: 1,
    description: '賃貸・売買・不動産情報'
  },
  job: {
    label: '仕事',
    icon: '', 
    color: 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-2 border-emerald-800 shadow-md',
    order: 2,
    description: '求人・仕事情報'
  },
  secondhand: {
    label: '不用品',
    icon: '',
    color: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-2 border-orange-700 shadow-md', 
    order: 3,
    description: '中古品・不用品'
  },
  agriculture: {
    label: '農業',
    icon: '',
    color: 'bg-gradient-to-r from-green-600 to-green-700 text-white border-2 border-green-800 shadow-md',
    order: 4,
    description: '農業・作業募集'
  },
  event: {
    label: 'イベント', 
    icon: '',
    color: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white border-2 border-purple-800 shadow-md',
    order: 5,
    description: 'イベント情報'
  },
  volunteer: {
    label: 'ボランティア',
    icon: '',
    color: 'bg-gradient-to-r from-pink-600 to-pink-700 text-white border-2 border-pink-800 shadow-md',
    order: 6,
    description: 'ボランティア募集'
  },
  
  // 新規カテゴリー
  question: {
    label: '質問',
    icon: '',
    color: 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-2 border-indigo-800 shadow-md',
    order: 7,
    description: '質問・相談'
  },
  info: {
    label: '情報',
    icon: '', 
    color: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white border-2 border-amber-800 shadow-md',
    order: 8,
    description: '役立つ情報'
  },
  announcement: {
    label: 'お知らせ',
    icon: '',
    color: 'bg-gradient-to-r from-red-600 to-red-700 text-white border-2 border-red-800 shadow-md',
    order: 9, 
    description: '重要なお知らせ'
  },
  other: {
    label: 'その他',
    icon: '',
    color: 'bg-gradient-to-r from-gray-600 to-gray-700 text-white border-2 border-gray-800 shadow-md',
    order: 10,
    description: 'その他'
  },
  advertisement: {
    label: '広告',
    icon: '',
    color: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-2 border-orange-600 shadow-md',
    order: 11,
    description: '広告・宣伝'
  },
  disaster_support: {
    label: '🆘 災害支援',
    icon: '🆘',
    color: 'bg-gradient-to-r from-red-600 to-red-700 text-white border-2 border-red-800 shadow-md',
    order: 12,
    description: '台風復旧支援要請'
  }
} as const

// TypeScript用の型定義
export type CategoryKey = keyof typeof CATEGORIES
export type CategoryInfo = typeof CATEGORIES[CategoryKey]

// ヘルパー関数
export const getCategoryConfig = (key: CategoryKey): CategoryInfo => CATEGORIES[key]

export const getAllCategories = (): CategoryKey[] => 
  Object.keys(CATEGORIES) as CategoryKey[]

export const getSortedCategories = (): CategoryKey[] =>
  getAllCategories().sort((a, b) => CATEGORIES[a].order - CATEGORIES[b].order)

export const getCategoryLabel = (key: CategoryKey): string => CATEGORIES[key]?.label || '不明'

export const getCategoryIcon = (key: CategoryKey): string => CATEGORIES[key]?.icon || ''

export const getCategoryColor = (key: CategoryKey): string => CATEGORIES[key]?.color || 'bg-gray-500 text-white'

// カテゴリー選択用の配列（「すべて」含む）
export const getCategoriesForFilter = (): Array<{key: string, label: string}> => [
  { key: 'all', label: 'すべて' },
  ...getSortedCategories().map(key => ({ key, label: CATEGORIES[key].label }))
]

// カテゴリー選択用の配列（投稿フォーム用）
export const getCategoriesForForm = (): Array<{key: CategoryKey, label: string}> =>
  getSortedCategories().map(key => ({ key, label: CATEGORIES[key].label }))

// 日本語→英語キーのマッピング（移行用）
export const LEGACY_CATEGORY_MAPPING: Record<string, CategoryKey> = {
  '不動産': 'real_estate',
  '仕事': 'job', 
  '不用品': 'secondhand',
  '農業': 'agriculture',
  'イベント': 'event',
  'ボランティア': 'volunteer'
}