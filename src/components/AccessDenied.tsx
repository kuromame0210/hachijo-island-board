'use client'

import { Card } from '@/components/ui/card'
import { useLocation } from '@/hooks/useLocation'

interface AccessDeniedProps {
  type: 'posting' | 'jobs'
  title?: string
  message?: string
}

export default function AccessDenied({ type, title, message }: AccessDeniedProps) {
  const { requestLocation, locationResult } = useLocation()

  const config = {
    posting: {
      icon: '✍️',
      defaultTitle: '投稿機能は八丈島からのみ利用可能です',
      defaultMessage: '新しい投稿の作成は、八丈島内からのアクセスに限定されています。',
      buttonText: '位置情報を確認して投稿する'
    },
    jobs: {
      icon: '💼',
      defaultTitle: '仕事情報は島民限定です',
      defaultMessage: '八丈島の仕事情報は、島民の方のみ閲覧できます。',
      buttonText: '位置情報を確認する'
    }
  }

  const currentConfig = config[type]

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <div className="p-8 text-center">
          <div className="text-6xl mb-4">{currentConfig.icon}</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {title || currentConfig.defaultTitle}
          </h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {message || currentConfig.defaultMessage}
          </p>

          <div className="space-y-4">
            <button
              onClick={() => requestLocation(true)}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              {currentConfig.buttonText}
            </button>

            <div className="text-sm text-gray-500">
              <p>八丈島の範囲内からアクセスしてください</p>
              <p className="text-xs mt-1">北緯33.045°〜33.155°、東経139.74°〜139.81°</p>
            </div>
          </div>

          {locationResult.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{locationResult.error}</p>
            </div>
          )}

        </div>
      </Card>
    </div>
  )
}

// より簡易的なアクセス拒否表示
export function SimpleAccessDenied({ type }: { type: 'posting' | 'jobs' }) {
  const config = {
    posting: {
      icon: '✍️',
      title: '投稿は八丈島からのみ',
      message: '位置情報を確認してください'
    },
    jobs: {
      icon: '💼',
      title: '島民限定コンテンツ',
      message: '八丈島からのアクセスが必要です'
    }
  }

  const currentConfig = config[type]

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
      <div className="text-2xl mb-2">{currentConfig.icon}</div>
      <h3 className="font-semibold text-amber-800 mb-1">{currentConfig.title}</h3>
      <p className="text-sm text-amber-700">{currentConfig.message}</p>
    </div>
  )
}