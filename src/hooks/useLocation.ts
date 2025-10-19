'use client'

import { useState, useEffect } from 'react'
import { 
  detectHachijoLocation, 
  detectLocationByIP, 
  LocationResult, 
  calculateDistanceToLandmarks, 
  reverseGeocode 
} from '@/lib/geolocation'

export function useLocation() {
  const [locationResult, setLocationResult] = useState<LocationResult>({
    isInHachijo: false,
    distance: null,
    location: null,
    error: null,
    status: 'success' // 初期状態は'success'にして無限ローディングを防ぐ
  })
  const [lastChecked, setLastChecked] = useState<number | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [landmarks, setLandmarks] = useState<Array<{key: string, name: string, icon: string, distance: number}>>([])

  const [hasAskedPermission, setHasAskedPermission] = useState(false)
  const [, setHasConfirmedLocation] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // 位置情報を取得する関数
  const requestLocation = async (forceRefresh = false) => {
    console.log('位置情報取得開始', forceRefresh ? '（強制再取得）' : '')
    setHasAskedPermission(true)
    setLocationResult(prev => ({ ...prev, status: 'loading' }))
    
    // 強制再取得の場合はキャッシュをクリア
    if (forceRefresh) {
      localStorage.removeItem('hachijo-location-status')
      console.log('位置情報キャッシュをクリアしました')
    }

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

        const timestamp = Date.now()
        setLocationResult({
          isInHachijo,
          distance,
          location: testLocation,
          error: null,
          status: 'success'
        })
        setLastChecked(timestamp)
        setHasConfirmedLocation(true)
        localStorage.setItem('hachijo-location-status', JSON.stringify({
          isInHachijo,
          distance,
          location: testLocation,
          lastChecked: timestamp
        }))
        console.log('開発環境：位置情報取得完了（テストデータ）')
        return
      }

      console.log('GPS位置情報取得試行中...')
      // まずGPS位置情報を試行
      const gpsResult = await detectHachijoLocation()
      console.log('GPS結果:', gpsResult)

      if (gpsResult.status === 'success') {
        const timestamp = Date.now()
        setLocationResult(gpsResult)
        setLastChecked(timestamp)
        setHasConfirmedLocation(true)
        
        // 住所と施設距離を取得
        if (gpsResult.location) {
          const { lat, lng } = gpsResult.location
          
          // 住所を取得
          try {
            const addressResult = await reverseGeocode(lat, lng)
            setAddress(addressResult)
          } catch (error) {
            console.error('住所取得エラー:', error)
          }
          
          // 施設距離を計算
          const landmarkDistances = calculateDistanceToLandmarks(lat, lng)
          setLandmarks(landmarkDistances)
        }
        
        // ローカルストレージに保存（プライバシーに配慮して簡素化）
        localStorage.setItem('hachijo-location-status', JSON.stringify({
          isInHachijo: gpsResult.isInHachijo,
          distance: gpsResult.distance,
          location: gpsResult.location,
          lastChecked: timestamp
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

        // 24時間以内のキャッシュなら使用
        if (now - lastChecked < 86400000) { // 24時間 * 60分 * 60秒 * 1000ミリ秒
          setLocationResult(prev => ({
            ...prev,
            isInHachijo: data.isInHachijo,
            distance: data.distance || null,
            location: data.location || null,
            status: 'success'
          }))
          setLastChecked(lastChecked)
          setHasAskedPermission(true)
          
          // キャッシュされた位置情報で住所と施設距離を再計算
          if (data.location) {
            const { lat, lng } = data.location
            
            // 住所を非同期で取得
            reverseGeocode(lat, lng)
              .then(addressResult => setAddress(addressResult))
              .catch(error => console.error('住所取得エラー:', error))
            
            const landmarkDistances = calculateDistanceToLandmarks(lat, lng)
            setLandmarks(landmarkDistances)
          }
          
          return
        }

        // キャッシュが24時間以上経過している場合は自動的に再取得
        console.log('キャッシュ期限切れ：位置情報を自動再取得します')
        requestLocation(true) // 強制再取得
        return
      } catch (e) {
        console.warn('位置情報キャッシュの解析に失敗:', e)
      }
    }

    // キャッシュが存在しない場合も自動的に位置情報を取得
    console.log('キャッシュなし：位置情報を自動取得します')
    requestLocation()
  }, [])

  return {
    locationResult,
    requestLocation,
    hasAskedPermission: isHydrated ? hasAskedPermission : false, // SSR中は常にfalse
    isLoading: locationResult.status === 'loading',
    lastChecked,
    address,
    landmarks
  }
}