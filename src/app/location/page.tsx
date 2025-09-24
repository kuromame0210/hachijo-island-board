'use client'

import Link from 'next/link'
import { useLocation } from '@/hooks/useLocation'
import { Card } from '@/components/ui/card'
import { useState, useEffect } from 'react'

export default function LocationPage() {
  const { locationResult, hasAskedPermission, requestLocation, isLoading } = useLocation()
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
    const location = locationResult.location

    return (
      <Card>
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">
              {isInHachijo ? '🏝️' : '🌍'}
            </div>
            <h3 className="text-2xl font-bold mb-4">
              {isInHachijo ? '八丈島内からのアクセス' : '八丈島外からのアクセス'}
            </h3>
          </div>

          {/* デバッグ情報 */}
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs">
            <div>Debug Info:</div>
            <div>hasAskedPermission: {hasAskedPermission.toString()}</div>
            <div>locationResult.status: {locationResult.status}</div>
            <div>locationResult.location: {JSON.stringify(locationResult.location)}</div>
            <div>locationResult.isInHachijo: {locationResult.isInHachijo.toString()}</div>
            <div>locationResult.distance: {locationResult.distance}</div>
          </div>

          {/* 位置情報の詳細 */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">📍 現在地</h4>
              {location ? (
                <div className="text-sm text-gray-600 space-y-1">
                  <div>緯度: {location.lat.toFixed(6)}°</div>
                  <div>経度: {location.lng.toFixed(6)}°</div>
                  {locationResult.distance !== null && (
                    <div className="text-blue-600 font-semibold mt-2">
                      八丈島まで約 {locationResult.distance}km
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500">位置情報なし</div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">⏰ 確認時刻</h4>
              <div className="text-sm text-gray-600">
                {lastCheckedTime ? lastCheckedTime.toLocaleString('ja-JP') : '確認時刻なし'}
              </div>
            </div>
          </div>

          {/* 利用可能な機能 */}
          <div className="mb-8">
            <h4 className="font-semibold text-gray-700 mb-4">🔧 利用可能な機能</h4>
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
                  <span className="font-medium text-amber-800">⚠️ 閲覧のみ利用可能</span>
                  <span className="text-amber-600 font-bold">制限中</span>
                </div>
              )}
            </div>
          </div>

          {/* 再検出ボタン */}
          <div className="text-center">
            <button
              onClick={requestLocation}
              disabled={isLoading}
              className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              再度検出し直す
            </button>
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