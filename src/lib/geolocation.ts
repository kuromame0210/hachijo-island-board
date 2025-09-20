// 八丈島の地理的境界定義
export const HACHIJO_ISLAND_BOUNDS = {
  // 八丈島の緯度経度範囲
  north: 33.1550, // 北端
  south: 33.0450, // 南端
  east: 139.8100,  // 東端
  west: 139.7400   // 西端
}

// 八丈島の中心座標
export const HACHIJO_CENTER = {
  lat: 33.1067,
  lng: 139.7853
}

// 距離計算用（ハーバーサイン公式）
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // 地球の半径（km）
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// 八丈島内かどうかの判定
export function isInHachijoIsland(lat: number, lng: number): boolean {
  return (
    lat >= HACHIJO_ISLAND_BOUNDS.south &&
    lat <= HACHIJO_ISLAND_BOUNDS.north &&
    lng >= HACHIJO_ISLAND_BOUNDS.west &&
    lng <= HACHIJO_ISLAND_BOUNDS.east
  )
}

// 八丈島からの距離を計算
export function getDistanceFromHachijo(lat: number, lng: number): number {
  return calculateDistance(lat, lng, HACHIJO_CENTER.lat, HACHIJO_CENTER.lng)
}

// 位置情報の取得と判定
export interface LocationResult {
  isInHachijo: boolean
  distance: number | null
  location: {
    lat: number
    lng: number
  } | null
  error: string | null
  status: 'loading' | 'success' | 'error' | 'denied'
}

export async function detectHachijoLocation(): Promise<LocationResult> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        isInHachijo: false,
        distance: null,
        location: null,
        error: 'このブラウザは位置情報をサポートしていません',
        status: 'error'
      })
      return
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5分間キャッシュ
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        const isInHachijo = isInHachijoIsland(lat, lng)
        const distance = getDistanceFromHachijo(lat, lng)

        resolve({
          isInHachijo,
          distance: Math.round(distance * 10) / 10, // 小数点1桁
          location: { lat, lng },
          error: null,
          status: 'success'
        })
      },
      (error) => {
        let errorMessage = '位置情報の取得に失敗しました'
        let status: LocationResult['status'] = 'error'

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '位置情報の使用が拒否されました'
            status = 'denied'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置情報が利用できません'
            break
          case error.TIMEOUT:
            errorMessage = '位置情報の取得がタイムアウトしました'
            break
        }

        resolve({
          isInHachijo: false,
          distance: null,
          location: null,
          error: errorMessage,
          status
        })
      },
      options
    )
  })
}

// IPアドレスベースの位置検出（フォールバック）
export async function detectLocationByIP(): Promise<LocationResult> {
  try {
    // 無料のIP位置情報API（例：ipapi.co）
    const response = await fetch('https://ipapi.co/json/')
    const data = await response.json()

    if (data.latitude && data.longitude) {
      const lat = parseFloat(data.latitude)
      const lng = parseFloat(data.longitude)
      const isInHachijo = isInHachijoIsland(lat, lng)
      const distance = getDistanceFromHachijo(lat, lng)

      return {
        isInHachijo,
        distance: Math.round(distance * 10) / 10,
        location: { lat, lng },
        error: null,
        status: 'success'
      }
    }

    throw new Error('IP位置情報が取得できませんでした')
  } catch (error) {
    return {
      isInHachijo: false,
      distance: null,
      location: null,
      error: 'IP位置情報の取得に失敗しました',
      status: 'error'
    }
  }
}