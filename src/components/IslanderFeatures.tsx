'use client'

import { useLocation } from '@/hooks/useLocation'
import { Card } from '@/components/ui/card'

export default function IslanderFeatures() {
  const { locationResult, hasAskedPermission } = useLocation()

  // 位置情報を確認していない、または八丈島内でない場合は表示しない
  if (!hasAskedPermission || locationResult.status !== 'success' || !locationResult.isInHachijo) {
    return null
  }

  return (
    <div className="mb-6">
      <Card className="bg-gradient-to-r from-blue-50 to-emerald-50 border-blue-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🏝️</span>
            <h2 className="text-xl font-bold text-gray-900">島民限定機能</h2>
            <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">LOCALS ONLY</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🚨</span>
                <h3 className="font-semibold text-gray-900">緊急投稿</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                停電・天候・交通など島民向け緊急情報
              </p>
              <button className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors duration-200">
                緊急投稿を作成
              </button>
            </div>

            <div className="bg-white rounded-lg p-4 border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🤝</span>
                <h3 className="font-semibold text-gray-900">ご近所助け合い</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                お互い助け合い・貸し借り・共同購入
              </p>
              <button className="w-full px-3 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors duration-200">
                助け合い投稿
              </button>
            </div>

            <div className="bg-white rounded-lg p-4 border border-amber-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📦</span>
                <h3 className="font-semibold text-gray-900">本土発送代行</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                本土への荷物発送をお手伝い
              </p>
              <button className="w-full px-3 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors duration-200">
                発送依頼
              </button>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 これらの機能は八丈島内からのアクセスでのみ利用できます
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

// 訪問者向けの八丈島紹介
export function VisitorWelcome() {
  const { locationResult, hasAskedPermission } = useLocation()

  // 位置情報を確認していない、八丈島内、または距離情報がない場合は表示しない
  if (!hasAskedPermission || locationResult.status !== 'success' || locationResult.isInHachijo || !locationResult.distance) {
    return null
  }

  return (
    <div className="mb-6">
      <Card className="bg-gradient-to-r from-orange-50 to-pink-50 border-orange-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">✈️</span>
            <h2 className="text-xl font-bold text-gray-900">八丈島へようこそ！</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🌺 島の魅力</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 美しい海と温泉</li>
                <li>• 新鮮な海の幸</li>
                <li>• 豊かな自然と歴史</li>
                <li>• 温かい島民の心</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🛫 アクセス</h3>
              <p className="text-sm text-gray-600">
                あなたの現在地から約 <span className="font-semibold text-orange-600">{locationResult.distance} km</span><br/>
                羽田空港から飛行機で約55分
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}