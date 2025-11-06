/**
 * iframe埋め込みコードのセキュリティ対策
 * 許可されたドメインのiframeのみ通す
 */

const ALLOWED_DOMAINS = [
  'www.google.com',
  'maps.google.com',
  'www.youtube.com',
  'youtube.com',
  'player.vimeo.com',
  'www.openstreetmap.org'
]

export function sanitizeIframeCode(iframeCode: string): string | null {
  if (!iframeCode || !iframeCode.trim()) {
    return null
  }

  try {
    // iframeタグのsrc属性を抽出
    const iframeMatch = iframeCode.match(/<iframe[^>]+src=["']([^"']+)["'][^>]*>/i)
    
    if (!iframeMatch) {
      console.warn('iframe sanitizer: iframeタグが見つかりません')
      return null
    }

    const srcUrl = iframeMatch[1]
    const url = new URL(srcUrl)
    
    // ドメインチェック
    const isAllowed = ALLOWED_DOMAINS.some(domain => 
      url.hostname === domain || url.hostname.endsWith('.' + domain)
    )

    if (!isAllowed) {
      console.warn(`iframe sanitizer: 許可されていないドメイン: ${url.hostname}`)
      return null
    }

    // 基本的なサニタイゼーション
    let sanitized = iframeCode
      // javascriptプロトコルを除去
      .replace(/javascript:/gi, '')
      // onloadなどのイベントハンドラを除去
      .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '')
      // scriptタグを除去
      .replace(/<script[^>]*>.*?<\/script>/gi, '')

    // iframeタグのみ抽出（余計なHTMLを除去）
    const cleanIframeMatch = sanitized.match(/<iframe[^>]*>(?:\s*<\/iframe>)?/i)
    if (cleanIframeMatch) {
      sanitized = cleanIframeMatch[0]
      // 自己終了タグでない場合は終了タグを追加
      if (!sanitized.includes('</iframe>')) {
        sanitized += '</iframe>'
      }
    }

    return sanitized

  } catch (error) {
    console.error('iframe sanitizer error:', error)
    return null
  }
}

// 使用例とテスト用
export function isIframeSafe(iframeCode: string): boolean {
  return sanitizeIframeCode(iframeCode) !== null
}