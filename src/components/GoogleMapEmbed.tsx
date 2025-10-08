'use client'

interface GoogleMapEmbedProps {
  mapLink: string
  title?: string
}

export default function GoogleMapEmbed({ mapLink, title = "場所" }: GoogleMapEmbedProps) {
  // GoogleマップのリンクをiframeのsrcURLに変換
  const getEmbedUrl = (link: string): string | null => {
    try {
      // Google Maps短縮URL (maps.app.goo.gl) の場合
      if (link.includes('maps.app.goo.gl')) {
        const urlParts = link.split('/')
        const placeId = urlParts[urlParts.length - 1]
        return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12345!2d139.7853!3d33.1067!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A${placeId}!5e0!3m2!1sja!2sjp!4v1234567890!5m2!1sja!2sjp`
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

  const embedUrl = getEmbedUrl(mapLink)

  if (!embedUrl) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-700">
          地図の表示に問題があります。
          <a 
            href={mapLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline ml-1"
          >
            こちらから地図を開く
          </a>
        </p>
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