'use client'

import { useLocation } from '@/hooks/useLocation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface FeatureStatus {
  name: string
  icon: string
  available: boolean
  description: string
  requirement?: string
}

export default function LocationRestrictionStatus() {
  const { locationResult, hasAskedPermission, requestLocation, isLoading, lastChecked } = useLocation()

  const isIslander = hasAskedPermission && locationResult.status === 'success' && locationResult.isInHachijo

  const features: FeatureStatus[] = [
    {
      name: '掲示板閲覧',
      icon: '👀',
      available: true,
      description: '全ての投稿を閲覧できます',
    },
    {
      name: '投稿作成',
      icon: '✍️',
      available: isIslander,
      description: '新しい投稿を作成できます',
      requirement: '八丈島内からのアクセスが必要'
    },
    {
      name: '仕事情報',
      icon: '💼',
      available: isIslander,
      description: '島の仕事情報を閲覧できます',
      requirement: '島民限定機能'
    },
    {
      name: '緊急投稿',
      icon: '🚨',
      available: isIslander,
      description: '緊急情報を投稿できます',
      requirement: '島民限定機能'
    },
    {
      name: '助け合い機能',
      icon: '🤝',
      available: isIslander,
      description: 'ご近所助け合いを利用できます',
      requirement: '島民限定機能'
    },
    {
      name: '発送代行',
      icon: '📦',
      available: isIslander,
      description: '本土発送代行を依頼できます',
      requirement: '島民限定機能'
    }
  ]

  const getLocationStatusInfo = () => {
    if (!hasAskedPermission) {
      return {
        status: '位置未確認',
        color: 'bg-amber-100 text-amber-800 border-amber-300',
        icon: '📍',
        message: '位置情報の確認が必要です'
      }
    }

    if (locationResult.status === 'loading' || isLoading) {
      return {
        status: '確認中...',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: '🔄',
        message: '位置情報を取得しています'
      }
    }

    if (locationResult.status === 'error' || locationResult.status === 'denied') {
      return {
        status: '取得失敗',
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: '❌',
        message: locationResult.error || '位置情報を取得できませんでした'
      }
    }

    if (locationResult.isInHachijo) {
      return {
        status: '八丈島内',
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: '🏝️',
        message: '全機能をご利用いただけます'
      }
    }

    return {
      status: '八丈島外',
      color: 'bg-orange-100 text-orange-700 border-orange-200',
      icon: '🌍',
      message: `八丈島まで${locationResult.distance ? ` ${locationResult.distance}km` : ''} - 一部機能制限`
    }
  }

  const statusInfo = getLocationStatusInfo()
  const availableCount = features.filter(f => f.available).length
  const totalCount = features.length

  return (
    <Card className="max-w-4xl mx-auto">
      <div className="p-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏝️</span>
            <h2 className="text-xl font-bold text-gray-900">八丈島機能制限ステータス</h2>
          </div>
          <Badge className={`${statusInfo.color} text-sm font-medium px-3 py-1`}>
            {statusInfo.icon} {statusInfo.status}
          </Badge>
        </div>

        {/* 現在の状態 */}
        <div className={`${statusInfo.color} rounded-lg p-4 mb-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{statusInfo.icon}</span>
              <div>
                <div className="font-bold text-base">{statusInfo.status}</div>
                <div className="text-sm opacity-90">{statusInfo.message}</div>
              </div>
            </div>
            {!hasAskedPermission && (
              <button
                onClick={() => requestLocation(true)}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
              >
                {isLoading ? '確認中...' : '位置を確認'}
              </button>
            )}
          </div>
        </div>

        {/* 機能利用状況 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">機能利用状況</h3>
            <div className="text-sm text-gray-600">
              {availableCount}/{totalCount} 機能利用可能
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature) => (
              <div
                key={feature.name}
                className={`p-4 rounded-lg border transition-all ${
                  feature.available
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{feature.icon}</span>
                    <span className="font-medium text-gray-900">{feature.name}</span>
                  </div>
                  <span className={`text-lg font-bold ${
                    feature.available ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {feature.available ? '✓' : '✗'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{feature.description}</p>
                {!feature.available && feature.requirement && (
                  <p className="text-xs text-orange-600 font-medium">
                    制限: {feature.requirement}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 位置情報詳細 */}
        {hasAskedPermission && locationResult.location && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">位置情報詳細</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>
                <span className="font-medium">座標:</span> {locationResult.location.lat.toFixed(4)}, {locationResult.location.lng.toFixed(4)}
              </div>
              {locationResult.distance !== null && (
                <div>
                  <span className="font-medium">八丈島からの距離:</span> 約{locationResult.distance}km
                </div>
              )}
              {lastChecked && (
                <div>
                  <span className="font-medium">最終検出:</span> {new Date(lastChecked).toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-2">
                八丈島の範囲: 北緯33.045°〜33.155°、東経139.74°〜139.81°
              </div>
            </div>
          </div>
        )}

        {/* 八丈島への案内 */}
        {hasAskedPermission && !locationResult.isInHachijo && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">✈️</span>
              <h4 className="font-semibold text-gray-900">八丈島へお越しください</h4>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              全ての機能をご利用いただくには、八丈島内からアクセスしてください。
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

// コンパクト版（ヘッダーなどに組み込み用）
export function CompactLocationStatus() {
  const { locationResult, hasAskedPermission } = useLocation()
  const isIslander = hasAskedPermission && locationResult.status === 'success' && locationResult.isInHachijo
  // const availableFeatures = isIslander ? 6 : 1

  if (!hasAskedPermission) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs">
        <span>📍</span>
        <span className="hidden sm:inline">位置未確認 (1/6)</span>
        <span className="sm:hidden">(1/6)</span>
      </div>
    )
  }

  if (locationResult.status === 'loading') {
    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
        <span>🔄</span>
        <span className="hidden sm:inline">確認中...</span>
        <span className="sm:hidden">確認中</span>
      </div>
    )
  }

  if (isIslander) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
        <span>🏝️</span>
        <span className="hidden sm:inline">全機能利用可能 (6/6)</span>
        <span className="sm:hidden">(6/6)</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
      <span>🌍</span>
      <span className="hidden sm:inline">島外 (1/6)</span>
      <span className="sm:hidden">(1/6)</span>
    </div>
  )
}