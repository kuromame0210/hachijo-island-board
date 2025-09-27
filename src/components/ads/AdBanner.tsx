import { Card } from '@/components/ui/card'

interface AdBannerProps {
  size: 'large' | 'medium' | 'small'
  type?: 'banner' | 'sidebar' | 'footer'
  className?: string
}

// ハードコードされた広告データ
const advertisementAds = [
  {
    title: 'フリージア祭り開催中！',
    description: '八丈島の春を彩るフリージア祭りが開催中です。',
    period: '3月上旬〜4月上旬',
    contact: '八丈島観光協会',
    color: 'bg-gradient-to-r from-purple-100 to-pink-100',
    icon: '🌸'
  },
  {
    title: '住民税の納付をお忘れなく',
    description: '令和6年度住民税の納付期限が近づいています。',
    period: '納期限：各期限まで',
    contact: '八丈町役場 税務課',
    color: 'bg-gradient-to-r from-blue-100 to-indigo-100',
    icon: '📋'
  }
]

const adData = {
  large: {
    width: 'w-full',
    height: 'h-32',
    color: 'bg-white'
  },
  medium: {
    width: 'w-full',
    height: 'h-24',
    color: 'bg-white'
  },
  small: {
    width: 'w-full',
    height: 'h-16',
    color: 'bg-white'
  }
}

export default function AdBanner({ size, type = 'banner', className = '' }: AdBannerProps) {
  const ad = adData[size]

  // ランダムに広告を選択
  const randomAd = advertisementAds[Math.floor(Math.random() * advertisementAds.length)]

  return (
    <Card className={`${ad.width} ${ad.height} ${randomAd.color} border-2 border-gray-200 ${className} hover:shadow-lg transition-all duration-200`}>
      <div className="h-full flex items-center justify-between p-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="text-2xl">
            {randomAd.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-800 text-sm leading-tight truncate">
              {randomAd.title}
            </h3>
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              {randomAd.description}
            </p>
            {size !== 'small' && (
              <div className="flex gap-4 mt-1 text-xs text-gray-500">
                <span>📅 {randomAd.period}</span>
                <span>📞 {randomAd.contact}</span>
              </div>
            )}
          </div>
        </div>
        {size === 'small' && (
          <div className="text-xs text-gray-400 ml-2">
            広告
          </div>
        )}
      </div>
    </Card>
  )
}