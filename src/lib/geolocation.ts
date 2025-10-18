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

// 八丈島の主要施設座標
export const HACHIJO_LANDMARKS = {
  airport: { 
    lat: 33.1151, 
    lng: 139.7858, 
    name: "八丈島空港",
    icon: ""
  },
  sottodo_port: { 
    lat: 33.1098, 
    lng: 139.7695, 
    name: "底土港",
    icon: ""
  },
  city_hall: { 
    lat: 33.1073, 
    lng: 139.7932, 
    name: "八丈町役場",
    icon: ""
  }
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

// 八丈島内かどうかの判定（10km圏内を含む）
export function isInHachijoIsland(lat: number, lng: number): boolean {
  // 八丈島中心から10km以内なら「島内」とする
  const distance = getDistanceFromHachijo(lat, lng)
  return distance <= 10
}

// 八丈島からの距離を計算
export function getDistanceFromHachijo(lat: number, lng: number): number {
  return calculateDistance(lat, lng, HACHIJO_CENTER.lat, HACHIJO_CENTER.lng)
}

// 主要施設までの距離を計算
export function calculateDistanceToLandmarks(userLat: number, userLng: number) {
  return Object.entries(HACHIJO_LANDMARKS).map(([key, landmark]) => ({
    key,
    name: landmark.name,
    icon: landmark.icon,
    distance: Math.round(calculateDistance(userLat, userLng, landmark.lat, landmark.lng) * 10) / 10
  }))
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

// 八丈島の地区別郵便番号マップ
const HACHIJO_POSTAL_CODES = {
  '大賀郷': '〒100-1401',
  '樫立': '〒100-1621', 
  '末吉': '〒100-1622',
  '中之郷': '〒100-1623',
  '三根': '〒100-1511',
  '底土': '〒100-1401', // 大賀郷地区に含まれる
}

// 座標から八丈島の地区を判定
function detectHachijoDistrict(lat: number, lng: number): string | null {
  // 大まかな地区判定（座標範囲で判定）
  // 北部（坂下）エリア
  if (lat > 33.105) {
    if (lng < 139.770) return '大賀郷'
    if (lng < 139.785) return '三根'
    return '大賀郷'
  }
  
  // 南部（坂上）エリア
  if (lat < 33.085) {
    if (lng < 139.770) return '末吉'
    if (lng < 139.785) return '中之郷'
    return '樫立'
  }
  
  // 中央部
  return '大賀郷'
}

// 逆ジオコーディング（座標から住所を取得）
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    // 八丈島内かどうかチェック
    if (!isInHachijoIsland(lat, lng)) {
      return `位置情報（緯度: ${lat.toFixed(4)}, 経度: ${lng.toFixed(4)}）`
    }
    
    // 地区を判定
    const district = detectHachijoDistrict(lat, lng)
    if (district && district in HACHIJO_POSTAL_CODES) {
      return `${HACHIJO_POSTAL_CODES[district as keyof typeof HACHIJO_POSTAL_CODES]} 東京都八丈島八丈町${district}`
    }
    
    // フォールバック: OpenStreetMapで詳細取得を試行
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=ja`
    )
    const data = await response.json()
    
    if (data && data.display_name) {
      // 地区名を抽出して郵便番号付きで返す
      const displayName = data.display_name
      for (const [districtName, postalCode] of Object.entries(HACHIJO_POSTAL_CODES)) {
        if (displayName.includes(districtName)) {
          return `${postalCode} 東京都八丈島八丈町${districtName}`
        }
      }
    }
    
    // 最終フォールバック
    return '〒100-1400 東京都八丈島八丈町'
  } catch (error) {
    console.error('逆ジオコーディングエラー:', error)
    return '〒100-1400 東京都八丈島八丈町'
  }
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
  } catch {
    return {
      isInHachijo: false,
      distance: null,
      location: null,
      error: 'IP位置情報の取得に失敗しました',
      status: 'error'
    }
  }
}