'use client'

import { useLocation } from '@/hooks/useLocation'
import { useState } from 'react'

export default function LocationStatusBar() {
  // 一時的に非表示
  return null

  const { locationResult, hasAskedPermission, requestLocation, isLoading } = useLocation()
  const [isExpanded, setIsExpanded] = useState(false)

  // 位置情報の状態に応じたスタイルとメッセージ
  const getLocationStatus = () => {
    if (!hasAskedPermission) {
      return {
        color: 'bg-gradient-to-r from-orange-50 to-yellow-50 text-orange-800 border-2 border-orange-300 shadow-lg',
        icon: '📍',
        status: '位置情報の確認が必要です',
        detail: '八丈島内からのアクセスで全機能をご利用いただけます',
        action: '位置を確認する'
      }
    }

    if (locationResult.status === 'loading' || isLoading) {
      return {
        color: 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border-2 border-blue-300 shadow-lg',
        icon: '🔄',
        status: '位置情報を確認中...',
        detail: 'GPSまたはIPアドレスによる位置情報を取得しています',
        action: null
      }
    }

    if (locationResult.status === 'error' || locationResult.status === 'denied') {
      return {
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: '❌',
        status: '取得失敗',
        detail: locationResult.error || '位置情報を取得できませんでした',
        action: '再試行'
      }
    }

    if (locationResult.isInHachijo) {
      return {
        color: 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-800 border-2 border-emerald-400 shadow-lg',
        icon: '🏝️',
        status: '八丈島内からのアクセス',
        detail: '全機能をご利用いただけます。投稿・閲覧・連絡機能が利用可能です。',
        action: null
      }
    }

    if (locationResult.distance !== null) {
      return {
        color: 'bg-orange-100 text-orange-700 border-orange-200',
        icon: '📍',
        status: `八丈島まで ${locationResult.distance}km`,
        detail: '八丈島外からアクセス中（一部機能制限）',
        action: null
      }
    }

    return {
      color: 'bg-gradient-to-r from-slate-50 to-gray-50 text-slate-700 border-2 border-slate-300 shadow-lg',
      icon: '🌏',
      status: '八丈島外からのアクセス',
      detail: '閲覧機能のみご利用いただけます。投稿機能は制限されています。',
      action: null
    }
  }

  const statusInfo = getLocationStatus()

  return (
    <div className={`fixed top-24 right-4 z-40 ${statusInfo.color} rounded-xl transition-all duration-300 backdrop-blur-sm ${isExpanded ? 'w-96 max-w-[calc(100vw-2rem)]' : 'max-w-[calc(100vw-2rem)]'}`}>
      <div className="flex items-center">
        {/* メイン情報エリア（クリックで展開） */}
        <div
          className="px-5 py-4 cursor-pointer flex items-center gap-4 flex-1"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="text-3xl">{statusInfo.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-lg">{statusInfo.status}</div>
            {!isExpanded && (
              <div className="text-base mt-1 opacity-80">
                クリックで詳細
              </div>
            )}
            {isExpanded && (
              <div className="text-sm mt-1 opacity-90">
                {statusInfo.detail}
              </div>
            )}
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl">{isExpanded ? '▲' : '▼'}</span>
            {!isExpanded && (
              <span className="text-sm opacity-75">詳細</span>
            )}
          </div>
        </div>

        {/* 確認ボタン（常に表示） */}
        {statusInfo.action && !isExpanded && (
          <div className="px-3">
            <button
              onClick={(e) => {
                e.stopPropagation()
                console.log('位置確認ボタンクリック')
                requestLocation()
              }}
              disabled={isLoading}
              className="px-4 py-2.5 text-base font-bold bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all disabled:opacity-50 shadow-lg whitespace-nowrap transform hover:scale-105"
            >
              {isLoading ? '確認中...' : '確認'}
            </button>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="border-t border-current border-opacity-20 px-3 py-2">
          <div className="space-y-2">
            {/* 詳細情報 */}
            <div className="text-xs space-y-1">
              <div>
                <span className="font-medium">状態:</span> {statusInfo.detail}
              </div>
              {locationResult.location && (
                <div>
                  <span className="font-medium">座標:</span> {locationResult.location.lat.toFixed(4)}, {locationResult.location.lng.toFixed(4)}
                </div>
              )}
              {locationResult.distance !== null && (
                <div>
                  <span className="font-medium">距離:</span> 八丈島まで約{locationResult.distance}km
                </div>
              )}
            </div>

            {/* アクション */}
            {statusInfo.action && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  requestLocation()
                }}
                disabled={isLoading}
                className={`w-full px-3 py-2 text-sm font-bold rounded-lg transition-colors disabled:opacity-50 ${
                  !hasAskedPermission
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75 border border-current border-opacity-30'
                }`}
              >
                {statusInfo.action}
              </button>
            )}

            {/* 権限情報 */}
            <div className="text-sm space-y-2 pt-3 border-t border-current border-opacity-20">
              <div className="font-bold text-center">利用可能機能</div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center p-2 bg-white bg-opacity-30 rounded">
                  <span className="font-medium">掲示板閲覧</span>
                  <span className="text-green-600 font-bold text-lg">✓</span>
                </div>
                <div className={`flex justify-between items-center p-2 rounded ${
                  hasAskedPermission && locationResult.isInHachijo
                    ? 'bg-green-50 bg-opacity-50'
                    : 'bg-amber-50 bg-opacity-50'
                }`}>
                  <span className="font-medium">投稿機能</span>
                  <span className={`font-bold text-lg ${
                    hasAskedPermission && locationResult.isInHachijo ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {hasAskedPermission && locationResult.isInHachijo ? '✓' : '✗'}
                  </span>
                </div>
                <div className={`flex justify-between items-center p-2 rounded ${
                  hasAskedPermission && locationResult.isInHachijo
                    ? 'bg-green-50 bg-opacity-50'
                    : 'bg-amber-50 bg-opacity-50'
                }`}>
                  <span className="font-medium">仕事情報</span>
                  <span className={`font-bold text-lg ${
                    hasAskedPermission && locationResult.isInHachijo ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {hasAskedPermission && locationResult.isInHachijo ? '✓' : '✗'}
                  </span>
                </div>
                <div className={`flex justify-between items-center p-2 rounded ${
                  hasAskedPermission && locationResult.isInHachijo
                    ? 'bg-green-50 bg-opacity-50'
                    : 'bg-amber-50 bg-opacity-50'
                }`}>
                  <span className="font-medium">島民限定機能</span>
                  <span className={`font-bold text-lg ${
                    hasAskedPermission && locationResult.isInHachijo ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {hasAskedPermission && locationResult.isInHachijo ? '✓' : '✗'}
                  </span>
                </div>
              </div>

              {!hasAskedPermission && (
                <div className="bg-blue-100 bg-opacity-80 border border-blue-300 rounded-lg p-2 mt-3">
                  <div className="text-center font-bold text-blue-800">
                    📍 位置確認をお願いします
                  </div>
                  <div className="text-xs text-blue-700 text-center mt-1">
                    確認後、全機能をご利用いただけます
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// シンプル版（ヘッダー内組み込み用）
export function SimpleLocationStatus() {
  const { locationResult, hasAskedPermission } = useLocation()

  if (!hasAskedPermission) {
    return (
      <div className="flex items-center gap-2 text-sm sm:text-base text-amber-600 font-medium">
        <span className="text-lg">📍</span>
        <span className="hidden sm:inline">位置確認</span>
      </div>
    )
  }

  if (locationResult.status === 'loading') {
    return (
      <div className="flex items-center gap-2 text-sm sm:text-base text-blue-600">
        <span className="text-lg">🔄</span>
        <span className="hidden sm:inline">確認中</span>
      </div>
    )
  }

  if (locationResult.isInHachijo) {
    return (
      <div className="flex items-center gap-2 text-sm sm:text-base text-green-600 font-medium">
        <span className="text-lg">🏝️</span>
        <span>八丈島</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm sm:text-base text-orange-600">
      <span className="text-lg">📍</span>
      <span className="hidden sm:inline">島外</span>
    </div>
  )
}