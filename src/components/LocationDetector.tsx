'use client'

import { useLocation } from '@/hooks/useLocation'
import { useState } from 'react'
import PrivacyInfo from '@/components/PrivacyInfo'

export default function LocationDetector() {
  const { requestLocation, hasAskedPermission, isLoading } = useLocation()
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible || hasAskedPermission) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white border border-blue-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start gap-3">
        <div className="text-2xl">📍</div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            八丈島からアクセス中ですか？
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            位置情報を使って島民の方に特別な機能を提供します
          </p>
          <div className="mb-3">
            <PrivacyInfo />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => requestLocation(true)}
              disabled={isLoading}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
            >
              {isLoading ? '確認中...' : '位置を確認'}
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              後で
            </button>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  )
}

// 位置情報結果を表示するコンポーネント
export function LocationStatus() {
  const { locationResult, hasAskedPermission } = useLocation()

  // 位置情報を確認していない、ロード中、または確認が成功していない場合は表示しない
  if (!hasAskedPermission || locationResult.status === 'loading' || locationResult.status !== 'success') {
    return null
  }

  if (locationResult.isInHachijo) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-green-600 text-lg">🏝️</span>
          <div>
            <p className="font-semibold text-green-800">八丈島からのアクセスを検出しました！</p>
            <p className="text-sm text-green-600">島民の皆様、いつもありがとうございます</p>
          </div>
        </div>
      </div>
    )
  }

  if (locationResult.distance !== null && locationResult.distance < 100) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-yellow-600 text-lg">✈️</span>
          <div>
            <p className="font-semibold text-yellow-800">八丈島まで約 {locationResult.distance} km</p>
            <p className="text-sm text-yellow-600">ぜひ八丈島にお越しください！</p>
          </div>
        </div>
      </div>
    )
  }

  return null
}