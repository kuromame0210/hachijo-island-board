import { Post } from '@/types'

// 投稿タイプの定義
export type PostType = 'offer' | 'disaster_request' | 'general'

// 災害支援リクエストのタグリスト
const DISASTER_REQUEST_TAGS = ['water_supply', 'cleaning', 'furniture_disposal', 'other']

/**
 * 投稿のタイプを判定する
 * @param post 投稿データ
 * @returns 投稿タイプ ('offer' | 'disaster_request' | 'general')
 */
export function getPostType(post: Post): PostType {
  // 物資提供投稿の判定
  if (post.tags?.includes('aid_offer')) {
    return 'offer'
  }

  // 災害支援リクエスト投稿の判定
  if (post.tags?.some(tag => DISASTER_REQUEST_TAGS.includes(tag))) {
    return 'disaster_request'
  }

  // 上記以外は通常投稿
  return 'general'
}

/**
 * 投稿タイプのラベルを取得
 * @param postType 投稿タイプ
 * @returns ラベル文字列
 */
export function getPostTypeLabel(postType: PostType): string {
  switch (postType) {
    case 'offer':
      return '物資提供'
    case 'disaster_request':
      return '支援リクエスト'
    case 'general':
      return ''
  }
}

/**
 * 投稿タイプのアイコンを取得
 * @param postType 投稿タイプ
 * @returns アイコン絵文字
 */
export function getPostTypeIcon(postType: PostType): string {
  switch (postType) {
    case 'offer':
      return '🎁'
    case 'disaster_request':
      return '🆘'
    case 'general':
      return ''
  }
}

/**
 * 投稿タイプのバッジCSSクラスを取得
 * @param postType 投稿タイプ
 * @returns CSSクラス文字列
 */
export function getPostTypeBadgeColor(postType: PostType): string {
  switch (postType) {
    case 'offer':
      return 'bg-green-100 text-green-700 border-green-300'
    case 'disaster_request':
      return 'bg-red-100 text-red-700 border-red-300'
    case 'general':
      return ''
  }
}
