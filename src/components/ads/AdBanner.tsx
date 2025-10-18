import { Card } from '@/components/ui/card'

interface AdBannerProps {
  size: 'large' | 'medium' | 'small'
  type?: 'banner' | 'sidebar' | 'footer'
  className?: string
}

// ハードコードされた広告データ
const advertisementAds = [
  {
    id: 'hachijo-infra',
    title: '八丈島インフラ情報',
    description: '島内の道路、交通規制、工事情報などインフラ関連の最新情報',
    period: '随時更新',
    contact: 'インフラ情報サイト',
    color: 'bg-gradient-to-r from-green-100 to-emerald-100',
    icon: '🏗️',
    externalLink: 'https://infra8jo.shuuutaf.workers.dev/'
  },
  {
    id: 'hachijo-saigai',
    title: '八丈島災害情報',
    description: '台風、災害時の警報・注意報、避難所情報、防災マップなど',
    period: '24時間365日',
    contact: '災害情報サイト',
    color: 'bg-gradient-to-r from-red-100 to-orange-100',
    icon: '🚨',
    externalLink: 'https://www.8jo-saigai.com/'
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

export default function AdBanner({ size, className = '' }: AdBannerProps) {
  const ad = adData[size]

  // 広告が存在しない場合の処理
  if (!advertisementAds || advertisementAds.length === 0) {
    return null
  }

  // ランダムに広告を選択
  const randomAd = advertisementAds[Math.floor(Math.random() * advertisementAds.length)]

  const handleClick = () => {
    if (randomAd.externalLink) {
      window.open(randomAd.externalLink, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <Card 
      className={`${ad.width} ${randomAd.color} border-2 border-gray-200 ${className} transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-[1.02]`}
      onClick={handleClick}
    >
      <div className="h-full flex items-center justify-between px-3">
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
        <div className="flex flex-col items-center ml-2">
          {size === 'small' && (
            <div className="text-xs text-gray-400">
              広告
            </div>
          )}
          <div className="text-xs text-blue-600 mt-1">
            クリックで開く →
          </div>
        </div>
      </div>
    </Card>
  )
}