'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import LocationRestrictionStatus from '@/components/LocationRestrictionStatus'
import IslanderFeatures, { VisitorWelcome } from '@/components/IslanderFeatures'

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ヘッダー */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
          🏝️ 八丈島掲示板について
        </h1>
        <p className="text-xl text-gray-600">
          八丈島のローカルコミュニティのための地域密着型掲示板サービスです
        </p>
      </div>

      {/* サービス概要 */}
      <Card>
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            🎯 サービス概要
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🏠</div>
              <h3 className="font-semibold text-lg mb-2">不動産情報</h3>
              <p className="text-gray-600 text-sm">
                賃貸・売買・シェアハウスなど島内の住まい情報
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">💼</div>
              <h3 className="font-semibold text-lg mb-2">仕事情報</h3>
              <p className="text-gray-600 text-sm">
                島民限定の求人・お手伝い・アルバイト情報
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">📦</div>
              <h3 className="font-semibold text-lg mb-2">不用品</h3>
              <p className="text-gray-600 text-sm">
                譲ります・譲ってください・中古品売買
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 現在の機能利用状況 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 text-center text-blue-800">
          📊 あなたの現在の機能利用状況
        </h2>
        <LocationRestrictionStatus />
      </div>

      {/* 島民限定機能 */}
      <IslanderFeatures />

      {/* 訪問者向け案内 */}
      <VisitorWelcome />

      {/* 位置制限について（簡潔版） */}
      <Card>
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            📍 位置情報による機能制限
          </h2>
          <div className="text-center">
            <p className="text-gray-700 mb-4">
              八丈島の位置情報に基づいて、一部機能の利用が制限されます。
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/location"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                📍 位置情報の詳細を確認
              </a>
              <a
                href="/location#test"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                🧪 位置テスト機能
              </a>
            </div>
          </div>
        </div>
      </Card>

      {/* 八丈島について */}
      <Card>
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            🌺 八丈島について
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-3">📍 基本情報</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div><strong>位置:</strong> 東京から南へ約287km</div>
                <div><strong>面積:</strong> 約69km²</div>
                <div><strong>人口:</strong> 約7,400人</div>
                <div><strong>アクセス:</strong> 羽田空港から飛行機で約55分</div>
                <div><strong>気候:</strong> 亜熱帯海洋性気候</div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <a
                  href="/location"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  📍 詳細な地理的境界を確認 →
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-3">🌟 島の魅力</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div>🏝️ 美しい海と豊かな自然</div>
                <div>♨️ 天然温泉が多数</div>
                <div>🐟 新鮮な海の幸</div>
                <div>🌺 亜熱帯植物が豊富</div>
                <div>🤝 温かい島民コミュニティ</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 使い方 */}
      <Card>
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            📖 使い方
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">1. 位置情報の確認</h3>
              <p className="text-gray-700 text-sm mb-2">
                サイト右上の位置情報ステータスで「位置を確認」ボタンを押してください。
              </p>
              <div className="bg-gray-50 p-3 rounded text-xs text-gray-600">
                八丈島内の方：全機能をご利用いただけます<br/>
                島外の方：閲覧機能をお楽しみください
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">2. 投稿の閲覧</h3>
              <p className="text-gray-700 text-sm">
                ホームページでカテゴリを選択して投稿を閲覧できます。気になる投稿をクリックして詳細をご覧ください。
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">3. 新規投稿（島民のみ）</h3>
              <p className="text-gray-700 text-sm">
                「投稿する」ボタンから新しい投稿を作成できます。写真も最大5枚まで投稿可能です。
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* お問い合わせ・注意事項 */}
      <Card>
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            📞 お問い合わせ・注意事項
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">⚠️ ご利用上の注意</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 個人情報の投稿はお控えください</li>
                <li>• 法令に違反する内容は禁止です</li>
                <li>• 商用利用は事前にご相談ください</li>
                <li>• 不適切な投稿は削除する場合があります</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">📱 技術的な問題</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 位置情報が取得できない場合はブラウザ設定をご確認ください</li>
                <li>• HTTPSが必要な場合があります</li>
                <li>• 古いブラウザでは一部機能が制限される場合があります</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* フッターリンク */}
      <div className="text-center py-8 border-t border-gray-200">
        <div className="flex justify-center gap-4 mb-4">
          <a
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🏠 ホームに戻る
          </a>
          <a
            href="/location"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            📍 位置情報詳細
          </a>
        </div>
        <p className="text-sm text-gray-500">
          八丈島掲示板 - 島のコミュニティをつなぐ場所
        </p>
      </div>
    </div>
  )
}