import { Card } from '@/components/ui/card'
import Link from 'next/link'

interface AdBannerProps {
  size: 'large' | 'medium' | 'small'
  type?: 'banner' | 'sidebar' | 'footer'
  className?: string
}

// ハードコードされた広告データ
const advertisementAds = [
  {
    id: 'freesia-festival',
    title: 'フリージア祭り開催中！',
    description: '八丈島の春を彩るフリージア祭りが開催中です。',
    period: '2025.3/22（土）～ 4/6（日）',
    contact: '(一社)八丈島観光協会 TEL:04996-2-1377',
    color: 'bg-gradient-to-r from-purple-100 to-pink-100',
    icon: '🌸',
    detailInfo: {
      locations: [
        { name: 'メイン会場', detail: '八形山フリージアまつり特設会場', address: '〒100-1401 東京都八丈島八丈町大賀郷4336' },
        { name: 'サブ会場', detail: '大越園地休憩舎', address: '〒100-1401 東京都八丈町大賀郷' },
        { name: 'サブ会場', detail: 'えこ・あぐりまーと', address: '〒100-1623 東京都八丈町中之郷3201-2' }
      ],
      organizer: '八丈島フリージアまつり実行委員会',
      supporters: '東京都・（公財）東京都島しょ振興公社・八丈町'
    },
    externalLink: 'https://www.freesiafesta.com/'
  },
  {
    id: 'resident-tax',
    title: '住民税の納付をお忘れなく',
    description: '令和6年度住民税の納付期限が近づいています。',
    period: '納期限：各期限まで',
    contact: '八丈町役場 税務課',
    color: 'bg-gradient-to-r from-blue-100 to-indigo-100',
    icon: '📋',
    externalLink: 'https://www.town.hachijo.tokyo.jp/'
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
    <Card className={`${ad.width} ${randomAd.color} border-2 border-gray-200 ${className} transition-all duration-200`}>
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
        {size === 'small' && (
          <div className="text-xs text-gray-400 ml-2">
            広告
          </div>
        )}
      </div>
    </Card>
  )
}