'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'

export default function PrivacyInfo() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs text-gray-500 hover:text-gray-700 underline"
      >
        位置情報の利用について
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">位置情報の利用について</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">🎯 利用目的</h3>
                  <ul className="space-y-1 ml-4">
                    <li>• 八丈島内からのアクセスかどうかの判定</li>
                    <li>• 島民限定機能の提供</li>
                    <li>• 八丈島への距離表示</li>
                    <li>• より関連性の高い情報の提供</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">🔒 プライバシー保護</h3>
                  <ul className="space-y-1 ml-4">
                    <li>• 正確な位置情報は保存されません</li>
                    <li>• 八丈島内かどうかの判定結果のみ記録</li>
                    <li>• 第三者への情報提供は一切行いません</li>
                    <li>• ローカルストレージに一時的に保存（1時間）</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">📍 検出方法</h3>
                  <ul className="space-y-1 ml-4">
                    <li>• GPS位置情報（高精度）</li>
                    <li>• IPアドレスベース位置推定（フォールバック）</li>
                    <li>• 位置情報拒否時は通常機能のみ利用可能</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-1">八丈島の範囲定義</h3>
                  <p className="text-blue-800 text-xs">
                    北緯33.045°〜33.155°、東経139.74°〜139.81°<br/>
                    この範囲内にいる場合、島民向け機能が利用できます
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">
                    位置情報の利用はいつでも拒否でき、基本的な掲示板機能は引き続きご利用いただけます。
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                理解しました
              </button>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}