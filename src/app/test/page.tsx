'use client'

import LocationTester from '@/components/LocationTester'
import LocationRestrictionStatus from '@/components/LocationRestrictionStatus'

export default function TestPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🧪 機能テストページ</h1>
        <p className="text-gray-600">位置制限機能のテストと確認ができます</p>
      </div>

      {/* 現在のステータス */}
      <LocationRestrictionStatus />

      {/* 位置テスター */}
      <LocationTester />

      {/* 制限機能のリンク */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-bold text-lg mb-3">🧪 投稿機能テスト</h3>
          <p className="text-gray-600 mb-4">
            八丈島内からのみアクセス可能。島外からは拒否画面が表示されます。
          </p>
          <a
            href="/new"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            投稿ページへ
          </a>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-bold text-lg mb-3">💼 仕事情報テスト</h3>
          <p className="text-gray-600 mb-4">
            メインページで仕事カテゴリを選択。島外からは選択できません。
          </p>
          <a
            href="/?category=仕事"
            className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            仕事ページへ
          </a>
        </div>
      </div>

      {/* 実装されている制限の説明 */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h3 className="font-bold text-lg mb-3">🔒 実装されている制限</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2">フロントエンド制限</h4>
            <ul className="space-y-1 text-gray-700">
              <li>• UIコンポーネントの表示/非表示</li>
              <li>• ページアクセス制御</li>
              <li>• ボタンの無効化</li>
              <li>• リアルタイム位置ステータス表示</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">バックエンド制限</h4>
            <ul className="space-y-1 text-gray-700">
              <li>• API Routeでの位置検証</li>
              <li>• サーバーサイドでの八丈島判定</li>
              <li>• 位置情報の保存と記録</li>
              <li>• エラーメッセージの返却</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}