'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

// 広告データ（AdBanner.tsxと同じデータ）
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

export default function AdDetail({ params }: { params: Promise<{ id: string }> }) {
  const [ad, setAd] = useState<typeof advertisementAds[0] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAd = async () => {
      const { id } = await params
      const foundAd = advertisementAds.find(a => a.id === id)
      setAd(foundAd || null)
      setLoading(false)
    }

    fetchAd()
  }, [params])

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>
  }

  if (!ad) {
    return <div>広告が見つかりません</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="secondary" className="text-base">
              広告
            </Badge>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="text-5xl">
              {ad.icon}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">{ad.title}</h1>
          </div>

          <div className="prose max-w-none mb-8">
            <p className="text-lg text-gray-700">
              {ad.description}
            </p>
          </div>

          {/* 開催期間 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 mb-6">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              📅 開催期間
            </h4>
            <p className="text-base text-gray-700">{ad.period}</p>
          </div>

          {/* 開催場所 */}
          {ad.detailInfo?.locations && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200 mb-6">
              <h4 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                📍 開催場所
              </h4>
              <div className="space-y-4">
                {ad.detailInfo.locations.map((location, index) => (
                  <div key={index} className="bg-white/50 p-4 rounded-lg">
                    <p className="font-bold text-gray-800 mb-1">{location.name}</p>
                    <p className="text-base text-gray-700 mb-1">{location.detail}</p>
                    <p className="text-sm text-gray-600">{location.address}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 主催・後援 */}
          {ad.detailInfo && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200 mb-6">
              <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                📋 主催・後援
              </h4>
              <div className="space-y-2">
                <p className="text-base text-gray-700">
                  <span className="font-medium">主催:</span> {ad.detailInfo.organizer}
                </p>
                <p className="text-base text-gray-700">
                  <span className="font-medium">後援:</span> {ad.detailInfo.supporters}
                </p>
              </div>
            </div>
          )}

          {/* お問い合わせ */}
          <div className="border-t border-gray-300 pt-6 mb-6">
            <h3 className="font-semibold mb-3">📞 お問い合わせ</h3>
            <p className="text-lg bg-blue-50 p-4 rounded-lg font-mono border border-blue-200">
              {ad.contact}
            </p>
          </div>

          {/* 外部リンク */}
          {ad.externalLink && (
            <div className="mb-6">
              <a
                href={ad.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 h-10 px-6 py-2 w-full sm:w-auto"
              >
                詳細を見る →
              </a>
            </div>
          )}

          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-blue-50 hover:border-blue-300 h-10 px-4 py-2 w-full sm:w-auto"
            >
              ← 一覧に戻る
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}