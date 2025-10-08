'use client'

import Link from 'next/link'
import { useLocation } from '@/hooks/useLocation'
import { Card } from '@/components/ui/card'
import { useState, useEffect } from 'react'

export default function LocationPage() {
  const { locationResult, hasAskedPermission, requestLocation, isLoading, address, landmarks } = useLocation()
  const [lastCheckedTime, setLastCheckedTime] = useState<Date | null>(null)

  // ローカルストレージから確認時刻を取得
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('hachijo-location-status')
      if (cached) {
        try {
          const data = JSON.parse(cached)
          if (data.lastChecked) {
            setLastCheckedTime(new Date(data.lastChecked))
          }
        } catch (e) {
          console.warn('位置情報キャッシュの解析に失敗:', e)
        }
      }
    }
  }, [hasAskedPermission, locationResult]) // 位置情報が更新された時に再実行

  // デバッグ情報コンポーネント
  const DebugInfo = ({ hasAskedPermission, locationResult, lastCheckedTime }: {
    hasAskedPermission: boolean
    locationResult: {
      isInHachijo: boolean
      distance: number | null
      location: { lat: number, lng: number } | null
      error: string | null
      status: string
    }
    lastCheckedTime: Date | null
  }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <div className="mb-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-between"
        >
          <span className="text-sm text-gray-600">📊 詳細情報を表示</span>
          <span className="text-sm text-gray-400">{isOpen ? '▲' : '▼'}</span>
        </button>
        
        {isOpen && (
          <div className="mt-2 p-4 bg-gray-50 border rounded-lg text-xs text-gray-600 space-y-2">
            <div><strong>GPS精度:</strong> ±5m | <strong>取得:</strong> {lastCheckedTime ? `${Math.floor((Date.now() - lastCheckedTime.getTime()) / 60000)}分前` : '不明'}</div>
            <div><strong>座標:</strong> {locationResult.location ? `${locationResult.location.lat.toFixed(6)}, ${locationResult.location.lng.toFixed(6)}` : 'なし'}</div>
            <div><strong>制限機能:</strong> {locationResult.isInHachijo ? 'なし（島民権限）' : '投稿・仕事情報'}</div>
            <div><strong>権限確認:</strong> {hasAskedPermission.toString()}</div>
            <div><strong>ステータス:</strong> {locationResult.status}</div>
          </div>
        )}
      </div>
    )
  }

  // 現在の位置情報を表示するコンポーネント
  const CurrentLocationStatus = () => {
    if (!hasAskedPermission) {
      return (
        <Card>
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">📍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">位置情報未確認</h3>
            <p className="text-gray-600 mb-6">
              位置情報を確認して利用可能な機能をご確認ください
            </p>
            <button
              onClick={requestLocation}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              位置情報を確認する
            </button>
          </div>
        </Card>
      )
    }

    if (locationResult.status === 'loading' || isLoading) {
      return (
        <Card>
          <div className="p-8 text-center">
            <div className="text-6xl mb-4 animate-pulse">🔄</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">位置情報確認中...</h3>
            <p className="text-gray-600">
              GPSまたはIPアドレスによる位置情報を取得しています
            </p>
          </div>
        </Card>
      )
    }

    if (locationResult.status === 'error') {
      return (
        <Card>
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-2xl font-bold text-red-600 mb-4">位置情報取得失敗</h3>
            <p className="text-gray-600 mb-6">
              {locationResult.error || '位置情報を取得できませんでした'}
            </p>
            <button
              onClick={requestLocation}
              disabled={isLoading}
              className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              再度検出し直す
            </button>
          </div>
        </Card>
      )
    }

    // 成功時の表示
    const isInHachijo = locationResult.isInHachijo

    return (
      <Card>
        <div className="p-8">
          {/* メイン情報（上部・目立つ） */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg mb-6">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">📍</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">現在地</h3>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-lg font-medium text-gray-700">
                {address || '住所取得中...'}
              </div>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                <span className={`px-3 py-1 rounded-full font-medium ${
                  isInHachijo 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {isInHachijo ? '島民として利用中' : '観光客として利用中'}
                </span>
                {locationResult.distance !== null && (
                  <span className="text-blue-600 font-medium">
                    八丈島中心から {locationResult.distance}km
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 周辺施設（実用的） */}
          {landmarks.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3">🏢 最寄り施設</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {landmarks.map((landmark) => (
                  <div key={landmark.key} className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="text-2xl mb-1">{landmark.icon}</div>
                    <div className="text-sm font-medium text-gray-700">{landmark.name}</div>
                    <div className="text-sm text-blue-600 font-semibold">{landmark.distance}km</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 操作ボタン（アクション） */}
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            <button
              onClick={requestLocation}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
            >
              位置情報を更新
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('hachijo-location-status')
                window.location.reload()
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              キャッシュクリア
            </button>
            <Link href="/" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
              設定
            </Link>
          </div>

          {/* 詳細情報（折りたたみ） */}
          <DebugInfo 
            hasAskedPermission={hasAskedPermission}
            locationResult={locationResult}
            lastCheckedTime={lastCheckedTime}
          />

          {/* 利用可能な機能 */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-4">⚙️ 利用可能な機能</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="font-medium text-green-800">📄 掲示板閲覧</span>
                <span className="text-green-600 font-bold">✓</span>
              </div>

              {isInHachijo && (
                <>
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="font-medium text-green-800">✍️ 投稿機能</span>
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="font-medium text-green-800">💼 仕事情報</span>
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="font-medium text-green-800">🏝️ 島民限定機能</span>
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                </>
              )}

              {!isInHachijo && (
                <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <span className="font-medium text-amber-800">⚠️ 制限機能</span>
                  <span className="text-amber-600 font-bold">投稿・仕事情報は利用不可</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ヘッダー */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
          📍 位置情報・機能制限
        </h1>
        <p className="text-xl text-gray-600">
          現在の位置情報と利用可能な機能を確認できます
        </p>
      </div>

      {/* 現在のステータス */}
      <CurrentLocationStatus />

      {/* フッターナビゲーション */}
      <div className="text-center py-8">
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          🏠 ホームに戻る
        </Link>
      </div>
    </div>
  )
}