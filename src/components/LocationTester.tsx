'use client'

import { useState } from 'react'
import { isInHachijoIsland, getDistanceFromHachijo } from '@/lib/geolocation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LocationTester() {
  const [testLat, setTestLat] = useState<string>('33.1067') // 八丈島中心
  const [testLng, setTestLng] = useState<string>('139.7853')
  const [testResult, setTestResult] = useState<{
    isInHachijo: boolean
    distance: number
    message: string
  } | null>(null)

  const testLocations = [
    { name: '八丈島中心', lat: 33.1067, lng: 139.7853 },
    { name: '八丈島北端', lat: 33.155, lng: 139.7853 },
    { name: '八丈島南端', lat: 33.045, lng: 139.7853 },
    { name: '八丈島東端', lat: 33.1067, lng: 139.81 },
    { name: '八丈島西端', lat: 33.1067, lng: 139.74 },
    { name: '東京（島外）', lat: 35.6762, lng: 139.6503 },
    { name: '横浜（島外）', lat: 35.4437, lng: 139.6380 },
    { name: '八丈島境界外', lat: 33.16, lng: 139.85 }
  ]

  const runTest = () => {
    const lat = parseFloat(testLat)
    const lng = parseFloat(testLng)

    if (isNaN(lat) || isNaN(lng)) {
      setTestResult({
        isInHachijo: false,
        distance: 0,
        message: '無効な座標です'
      })
      return
    }

    const isInHachijo = isInHachijoIsland(lat, lng)
    const distance = getDistanceFromHachijo(lat, lng)

    setTestResult({
      isInHachijo,
      distance: Math.round(distance * 10) / 10,
      message: isInHachijo ? '八丈島内です' : '八丈島外です'
    })
  }

  const setTestLocation = (lat: number, lng: number) => {
    setTestLat(lat.toString())
    setTestLng(lng.toString())
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-6 text-center">🧪 位置制限テスター</h2>

        {/* プリセット位置 */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">プリセット位置</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {testLocations.map((location) => (
              <Button
                key={location.name}
                variant="outline"
                size="sm"
                onClick={() => setTestLocation(location.lat, location.lng)}
                className="text-xs"
              >
                {location.name}
              </Button>
            ))}
          </div>
        </div>

        {/* 手動入力 */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">座標入力</h3>
          <div className="flex gap-2 mb-3">
            <div className="flex-1">
              <label className="text-sm text-gray-600">緯度</label>
              <Input
                type="number"
                step="0.0001"
                value={testLat}
                onChange={(e) => setTestLat(e.target.value)}
                placeholder="33.1067"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-gray-600">経度</label>
              <Input
                type="number"
                step="0.0001"
                value={testLng}
                onChange={(e) => setTestLng(e.target.value)}
                placeholder="139.7853"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={runTest} className="whitespace-nowrap">
                テスト実行
              </Button>
            </div>
          </div>
        </div>

        {/* 結果表示 */}
        {testResult && (
          <div className={`p-4 rounded-lg border-2 ${
            testResult.isInHachijo
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{testResult.isInHachijo ? '✅' : '❌'}</span>
              <span className="font-bold text-lg">{testResult.message}</span>
            </div>
            <div className="text-sm space-y-1">
              <div><strong>座標:</strong> {testLat}, {testLng}</div>
              <div><strong>距離:</strong> 八丈島中心から約{testResult.distance}km</div>
              <div><strong>利用可能機能:</strong></div>
              <ul className="ml-4 space-y-1">
                <li>✅ 掲示板閲覧</li>
                <li>{testResult.isInHachijo ? '✅' : '❌'} 投稿作成</li>
                <li>{testResult.isInHachijo ? '✅' : '❌'} 仕事情報</li>
                <li>{testResult.isInHachijo ? '✅' : '❌'} 島民限定機能</li>
              </ul>
            </div>
          </div>
        )}

        {/* 八丈島の境界情報 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">八丈島の地理的境界</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div><strong>北端:</strong> 33.155°N</div>
            <div><strong>南端:</strong> 33.045°N</div>
            <div><strong>東端:</strong> 139.81°E</div>
            <div><strong>西端:</strong> 139.74°E</div>
            <div><strong>中心:</strong> 33.1067°N, 139.7853°E</div>
          </div>
        </div>
      </div>
    </Card>
  )
}