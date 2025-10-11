'use client'

import { sanitizeIframeCode } from '@/lib/iframe-sanitizer'

interface GoogleMapEmbedProps {
  mapLink?: string
  iframeEmbed?: string
  title?: string
}

export default function GoogleMapEmbed({ mapLink, iframeEmbed, title = "場所" }: GoogleMapEmbedProps) {
  // GoogleマップのリンクをiframeのsrcURLに変換
  const getEmbedUrl = (link: string): string | null => {
    try {
      // Google Maps短縮URL (maps.app.goo.gl) の場合
      // 短縮URLは直接埋め込めないため、埋め込み表示をスキップ
      if (link.includes('maps.app.goo.gl')) {
        // 短縮URLは埋め込み不可 - リンクのみ表示
        return null
      }
      
      // 通常のGoogle MapsのURL
      if (link.includes('google.com/maps')) {
        // @座標形式の場合
        const coordMatch = link.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
        if (coordMatch) {
          const lat = coordMatch[1]
          const lng = coordMatch[2]
          return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12345!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDA2JzI0LjEiTiAxMznCsDQ3JzA3LjEiRQ!5e0!3m2!1sja!2sjp!4v1234567890!5m2!1sja!2sjp`
        }
        
        // place_id形式の場合
        const placeMatch = link.match(/place_id=([^&]+)/)
        if (placeMatch) {
          const placeId = placeMatch[1]
          return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dUWTgEiPMiGu8k&q=place_id:${placeId}`
        }
        
        // 検索クエリ形式の場合
        const queryMatch = link.match(/\/search\/([^\/\?]+)/)
        if (queryMatch) {
          const query = decodeURIComponent(queryMatch[1])
          return `https://www.google.com/maps/embed/v1/search?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dUWTgEiPMiGu8k&q=${encodeURIComponent(query)}`
        }
      }
      
      return null
    } catch {
      return null
    }
  }

  // iframe埋め込みコードが優先、なければmapLinkから生成
  const embedUrl = mapLink ? getEmbedUrl(mapLink) : null
  
  // iframe埋め込みコードがある場合は直接表示（セキュリティチェック済み）
  const sanitizedIframe = iframeEmbed ? sanitizeIframeCode(iframeEmbed) : null
  if (sanitizedIframe) {
    return (
      <div className="rounded-lg overflow-hidden shadow-md">
        <div className="bg-gray-100 px-4 py-2 border-b">
          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <span>📍</span>{title}
          </h3>
        </div>
        <div 
          className="w-full [&>iframe]:w-full [&>iframe]:h-auto [&>iframe]:min-h-[300px]"
          dangerouslySetInnerHTML={{ __html: sanitizedIframe }}
        />
        <div className="bg-gray-50 px-4 py-2 border-t">
          <span className="text-sm text-gray-600">
            📍 地図が表示されています
          </span>
        </div>
      </div>
    )
  }

  if (!embedUrl) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-blue-600">📍</span>
          <h3 className="text-sm font-medium text-blue-800">{title}</h3>
        </div>
        <p className="text-sm text-blue-700 mb-3">
          地図を表示するには下のリンクをクリックしてください
        </p>
        {mapLink && (
          <a 
            href={mapLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>🗺️</span>
            Googleマップで開く
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-lg overflow-hidden shadow-md">
      <div className="bg-gray-100 px-4 py-2 border-b">
        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <span>📍</span>{title}
        </h3>
      </div>
      <iframe
        src={embedUrl}
        width="100%"
        height="300"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`${title}の地図`}
        className="w-full"
      />
      <div className="bg-gray-50 px-4 py-2 border-t">
        <a 
          href={mapLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Googleマップで開く →
        </a>
      </div>
    </div>
  )
}