'use client'

import { useState, useEffect } from 'react'
import { detectHachijoLocation, detectLocationByIP, LocationResult } from '@/lib/geolocation'

export function useLocation() {
  const [locationResult, setLocationResult] = useState<LocationResult>({
    isInHachijo: false,
    distance: null,
    location: null,
    error: null,
    status: 'success' // 初期状態は'success'にして無限ローディングを防ぐ
  })

  const [hasAskedPermission, setHasAskedPermission] = useState(false)
  const [, setHasConfirmedLocation] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // 位置情報を取得する関数
  const requestLocation = async () => {
    console.log('位置情報取得開始')
    setHasAskedPermission(true)
    setLocationResult(prev => ({ ...prev, status: 'loading' }))

    try {
      // ブラウザサポートチェック
      if (!navigator.geolocation) {
        console.error('このブラウザは位置情報をサポートしていません')
        setLocationResult({
          isInHachijo: false,
          distance: null,
          location: null,
          error: 'このブラウザは位置情報をサポートしていません',
          status: 'error'
        })
        return
      }

      // 開発環境での位置情報テスト用（localhost時）
      if (window.location.hostname === 'localhost') {
        console.log('開発環境検出：テスト位置情報を使用')
        const testLocation = {
          lat: 33.1067, // 八丈島中心
          lng: 139.7853
        }
        const isInHachijo = true // テスト用に八丈島内とする
        const distance = 0

        setLocationResult({
          isInHachijo,
          distance,
          location: testLocation,
          error: null,
          status: 'success'
        })
        setHasConfirmedLocation(true)
        localStorage.setItem('hachijo-location-status', JSON.stringify({
          isInHachijo,
          distance,
          location: testLocation,
          lastChecked: Date.now()
        }))
        console.log('開発環境：位置情報取得完了（テストデータ）')
        return
      }

      console.log('GPS位置情報取得試行中...')
      // まずGPS位置情報を試行
      const gpsResult = await detectHachijoLocation()
      console.log('GPS結果:', gpsResult)

      if (gpsResult.status === 'success') {
        setLocationResult(gpsResult)
        setHasConfirmedLocation(true)
        // ローカルストレージに保存（プライバシーに配慮して簡素化）
        localStorage.setItem('hachijo-location-status', JSON.stringify({
          isInHachijo: gpsResult.isInHachijo,
          distance: gpsResult.distance,
          location: gpsResult.location,
          lastChecked: Date.now()
        }))
        console.log('位置情報取得成功')
      } else if (gpsResult.status === 'denied') {
        console.log('GPS拒否、IPベース位置情報を試行中...')
        const ipResult = await detectLocationByIP()
        console.log('IP結果:', ipResult)
        setLocationResult({
          ...ipResult,
          error: gpsResult.error + ' (IP位置情報で推定)'
        })
      } else {
        console.log('GPS失敗:', gpsResult)
        setLocationResult(gpsResult)
      }
    } catch (error) {
      console.error('位置情報取得エラー:', error)
      setLocationResult({
        isInHachijo: false,
        distance: null,
        location: null,
        error: '位置情報の取得に失敗しました',
        status: 'error'
      })
    }
  }

  // 初回ロード時にキャッシュされた位置情報をチェック
  useEffect(() => {
    // hydration完了を示すフラグ
    setIsHydrated(true)

    const cached = localStorage.getItem('hachijo-location-status')
    if (cached) {
      try {
        const data = JSON.parse(cached)
        const lastChecked = data.lastChecked || 0
        const now = Date.now()

        // 1時間以内のキャッシュなら使用
        if (now - lastChecked < 3600000) {
          setLocationResult(prev => ({
            ...prev,
            isInHachijo: data.isInHachijo,
            distance: data.distance || null,
            location: data.location || null,
            status: 'success'
          }))
          setHasAskedPermission(true)
          return
        }
      } catch (e) {
        console.warn('位置情報キャッシュの解析に失敗:', e)
      }
    }

    // 自動的に位置情報をリクエストしない（ユーザーの許可待ち）
    setLocationResult(prev => ({ ...prev, status: 'success' }))
  }, [])

  return {
    locationResult,
    requestLocation,
    hasAskedPermission: isHydrated ? hasAskedPermission : false, // SSR中は常にfalse
    isLoading: locationResult.status === 'loading'
  }
}