'use client'

import LocationRestrictionStatus from '@/components/LocationRestrictionStatus'
import LocationTester from '@/components/LocationTester'
import { Card } from '@/components/ui/card'

export default function LocationPage() {
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
      <LocationRestrictionStatus />

      {/* 位置制限の詳細説明 */}
      <Card>
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            🔒 機能制限の仕組み
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">📍 位置判定方法</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div>
                  <strong className="text-blue-600">1. GPS位置情報</strong>
                  <p className="text-sm text-gray-600 mt-1">
                    ブラウザのGeolocation APIを使用して正確な位置を取得します
                  </p>
                </div>
                <div>
                  <strong className="text-blue-600">2. IPアドレス位置情報</strong>
                  <p className="text-sm text-gray-600 mt-1">
                    GPS が利用できない場合の代替手段として使用します
                  </p>
                </div>
                <div>
                  <strong className="text-blue-600">3. キャッシュ機能</strong>
                  <p className="text-sm text-gray-600 mt-1">
                    一度確認した位置情報は1時間ローカルに保存されます
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">🏝️ 八丈島の地理的境界</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <strong>北端</strong><br/>
                    <span className="text-blue-600">33.155°N</span>
                  </div>
                  <div>
                    <strong>南端</strong><br/>
                    <span className="text-blue-600">33.045°N</span>
                  </div>
                  <div>
                    <strong>東端</strong><br/>
                    <span className="text-blue-600">139.81°E</span>
                  </div>
                  <div>
                    <strong>西端</strong><br/>
                    <span className="text-blue-600">139.74°E</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <strong>中心座標:</strong> <span className="text-blue-600">33.1067°N, 139.7853°E</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">⚙️ プライバシーとセキュリティ</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div>✅ 位置情報はローカルストレージにのみ保存</div>
                <div>✅ データベースには位置情報を保存しません</div>
                <div>✅ 1時間でキャッシュは自動削除</div>
                <div>✅ 必要最小限の情報のみ使用</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 位置テスター */}
      <div id="test">
        <LocationTester />
      </div>

      {/* よくある質問 */}
      <Card>
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            ❓ よくある質問
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-blue-600 mb-2">Q. 位置情報が取得できません</h3>
              <div className="text-sm text-gray-700 space-y-1 ml-4">
                <p>A. 以下をご確認ください：</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>ブラウザで位置情報の使用を許可しているか</li>
                  <li>HTTPS接続になっているか（一部ブラウザで必要）</li>
                  <li>古いブラウザを使用していないか</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-blue-600 mb-2">Q. 八丈島にいるのに島外判定されます</h3>
              <div className="text-sm text-gray-700 space-y-1 ml-4">
                <p>A. 以下の原因が考えられます：</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>GPS の精度が低い場合があります</li>
                  <li>位置テスターで正確な座標を確認してください</li>
                  <li>Wi-Fi接続時は位置精度が変わる場合があります</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-blue-600 mb-2">Q. なぜ位置制限があるのですか？</h3>
              <div className="text-sm text-gray-700 ml-4">
                <p>A. 八丈島のローカルコミュニティを保護し、島民向けのサービスを適切に提供するためです。特に仕事情報や島民限定機能は、現地の方々のための機能として設計されています。</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-blue-600 mb-2">Q. VPNを使用している場合はどうなりますか？</h3>
              <div className="text-sm text-gray-700 ml-4">
                <p>A. VPNを使用している場合、実際の位置とは異なる場所と判定される可能性があります。正確な判定のため、VPNを無効にして再度お試しください。</p>
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
            href="/test"
            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
          >
            🧪 テストページ
          </a>
        </div>
        <p className="text-sm text-gray-500">
          位置情報について不明な点がある場合は、お気軽にお問い合わせください
        </p>
      </div>
    </div>
  )
}