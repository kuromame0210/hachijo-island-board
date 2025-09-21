'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTheme } from '@/hooks/useTheme'
import { useLocation } from '@/hooks/useLocation'
import { ThemeName } from '@/lib/themes'

export default function SettingsPage() {
  const { theme, setTheme, themes } = useTheme()
  const { locationResult, hasAskedPermission, requestLocation } = useLocation()
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [notifications, setNotifications] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [showImages, setShowImages] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  // ローカルストレージから設定を読み込み
  useEffect(() => {
    setIsHydrated(true)

    const savedViewMode = localStorage.getItem('viewMode') as 'list' | 'grid'
    const savedNotifications = localStorage.getItem('notifications')
    const savedAutoRefresh = localStorage.getItem('autoRefresh')
    const savedShowImages = localStorage.getItem('showImages')

    if (savedViewMode) setViewMode(savedViewMode)
    if (savedNotifications !== null) setNotifications(savedNotifications === 'true')
    if (savedAutoRefresh !== null) setAutoRefresh(savedAutoRefresh === 'true')
    if (savedShowImages !== null) setShowImages(savedShowImages === 'true')
  }, [])

  // 設定変更時の保存
  const handleViewModeChange = (mode: 'list' | 'grid') => {
    setViewMode(mode)
    localStorage.setItem('viewMode', mode)
  }

  const handleNotificationsChange = (enabled: boolean) => {
    setNotifications(enabled)
    localStorage.setItem('notifications', enabled.toString())
  }

  const handleAutoRefreshChange = (enabled: boolean) => {
    setAutoRefresh(enabled)
    localStorage.setItem('autoRefresh', enabled.toString())
  }

  const handleShowImagesChange = (enabled: boolean) => {
    setShowImages(enabled)
    localStorage.setItem('showImages', enabled.toString())
  }

  const clearLocationData = () => {
    localStorage.removeItem('hachijo-location-status')
    window.location.reload()
  }

  const clearAllData = () => {
    if (confirm('全ての設定とデータをリセットしますか？この操作は元に戻せません。')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ヘッダー */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
          ⚙️ 設定
        </h1>
        <p className="text-xl text-gray-600">
          表示設定やテーマなどをカスタマイズできます
        </p>
      </div>

      {/* テーマ設定 */}
      <Card>
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            🎨 テーマ・外観設定
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                カラーテーマ
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(themes).map(([key, themeData]) => (
                  <button
                    key={key}
                    onClick={() => setTheme(key as ThemeName)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === key
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-4 h-4 rounded-full bg-${themeData.colors.primary}`}
                      />
                      <span className="text-sm font-medium">{themeData.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <div
                        className={`w-3 h-3 rounded bg-${themeData.colors.primary}`}
                      />
                      <div
                        className={`w-3 h-3 rounded bg-${themeData.colors.secondary}`}
                      />
                      <div
                        className={`w-3 h-3 rounded bg-${themeData.colors.accent}`}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                表示モード
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => handleViewModeChange('list')}
                  className={`px-4 py-2 rounded-lg transition ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📋 リスト表示
                </button>
                <button
                  onClick={() => handleViewModeChange('grid')}
                  className={`px-4 py-2 rounded-lg transition ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ⊞ カード表示
                </button>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={showImages}
                  onChange={(e) => handleShowImagesChange(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  画像を表示する
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-7">
                オフにすると通信量を節約できます
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 機能設定 */}
      <Card>
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            ⚡ 機能設定
          </h2>
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => handleNotificationsChange(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  通知を有効にする
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-7">
                新しい投稿やお知らせを通知します
              </p>
            </div>

            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => handleAutoRefreshChange(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  自動更新
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-7">
                5分おきに投稿一覧を自動更新します
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 位置情報設定 */}
      <Card>
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            📍 位置情報設定
          </h2>
          <div className="space-y-6">
            <div className={`p-4 rounded-lg border ${
              !hasAskedPermission
                ? 'bg-amber-50 border-amber-200'
                : locationResult.isInHachijo
                  ? 'bg-green-50 border-green-200'
                  : 'bg-orange-50 border-orange-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">
                    {!hasAskedPermission && '📍 位置未確認'}
                    {hasAskedPermission && locationResult.isInHachijo && '🏝️ 八丈島内'}
                    {hasAskedPermission && !locationResult.isInHachijo && '🌍 八丈島外'}
                  </div>
                  <div className="text-sm mt-1 opacity-75">
                    {!hasAskedPermission && '位置確認をお願いします'}
                    {hasAskedPermission && locationResult.isInHachijo && '全機能利用可能'}
                    {hasAskedPermission && !locationResult.isInHachijo && '一部機能制限'}
                  </div>
                </div>
                <Button
                  onClick={requestLocation}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  位置を確認
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={clearLocationData}
                variant="outline"
                className="text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                位置情報をリセット
              </Button>
              <a
                href="/location"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                位置情報詳細へ
              </a>
            </div>
          </div>
        </div>
      </Card>

      {/* データ管理 */}
      <Card>
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            🗂️ データ管理
          </h2>
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">保存されているデータ</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• テーマ設定</li>
                <li>• 表示設定（リスト/カード表示）</li>
                <li>• 位置情報キャッシュ（1時間で自動削除）</li>
                <li>• 各種機能設定</li>
              </ul>
              <p className="text-xs text-gray-500 mt-2">
                すべてのデータはブラウザのローカルストレージに保存され、サーバーには送信されません
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={clearAllData}
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                全データをリセット
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* アプリ情報 */}
      <Card>
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            ℹ️ アプリ情報
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
              <div>
                <strong>バージョン:</strong> 1.0.0<br/>
                <strong>最終更新:</strong> 2024年12月<br/>
                <strong>開発:</strong> 八丈島掲示板チーム
              </div>
              <div>
                <strong>対応ブラウザ:</strong> Chrome, Firefox, Safari, Edge<br/>
                <strong>必要な機能:</strong> JavaScript, ローカルストレージ<br/>
                <strong>位置情報:</strong> Geolocation API
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* フッターナビゲーション */}
      <div className="text-center py-8 border-t border-gray-200">
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          <a
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🏠 ホームに戻る
          </a>
          <a
            href="/about"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ℹ️ サービス説明
          </a>
          <a
            href="/location"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            📍 位置情報
          </a>
        </div>
        <p className="text-sm text-gray-500">
          設定は自動的に保存されます
        </p>
      </div>
    </div>
  )
}