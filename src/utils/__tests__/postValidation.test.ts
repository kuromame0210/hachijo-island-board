/**
 * 投稿データの検証ユーティリティのテスト
 */

interface PostData {
  title: string
  description: string
  category: string
  price?: number | null
  contact: string
  images?: string[]
}

// 投稿データ検証関数
export function validatePostData(data: Partial<PostData>): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // タイトル検証
  if (!data.title || data.title.trim().length === 0) {
    errors.push('タイトルは必須です')
  } else if (data.title.length > 100) {
    errors.push('タイトルは100文字以内で入力してください')
  }

  // 説明検証
  if (!data.description || data.description.trim().length === 0) {
    errors.push('説明は必須です')
  } else if (data.description.length > 1000) {
    errors.push('説明は1000文字以内で入力してください')
  }

  // カテゴリ検証
  const validCategories = ['不動産', '仕事', '不用品']
  if (!data.category || !validCategories.includes(data.category)) {
    errors.push('有効なカテゴリを選択してください')
  }

  // 価格検証
  if (data.price !== null && data.price !== undefined) {
    if (typeof data.price !== 'number' || data.price < 0) {
      errors.push('価格は0以上の数値で入力してください')
    }
  }

  // 画像検証
  if (data.images && Array.isArray(data.images)) {
    if (data.images.length > 5) {
      errors.push('画像は最大5枚まで選択できます')
    }

    for (const image of data.images) {
      if (typeof image !== 'string' || !image.startsWith('https://')) {
        errors.push('画像URLが不正です')
        break
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// 距離計算関数
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // 地球の半径 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return Math.round(R * c)
}

// 八丈島内判定関数
export function isInHachijo(lat: number, lng: number): boolean {
  const HACHIJO_BOUNDS = {
    north: 33.155,
    south: 33.045,
    east: 139.81,
    west: 139.74
  }

  return lat >= HACHIJO_BOUNDS.south &&
         lat <= HACHIJO_BOUNDS.north &&
         lng >= HACHIJO_BOUNDS.west &&
         lng <= HACHIJO_BOUNDS.east
}

// テスト
describe('投稿データ検証', () => {
  describe('validatePostData', () => {
    it('有効な投稿データを受け入れる', () => {
      const validPost = {
        title: 'テスト投稿',
        description: 'これはテスト投稿の説明です',
        category: '不動産',
        price: 100000,
        contact: 'test@example.com',
        images: ['https://example.com/image1.jpg']
      }

      const result = validatePostData(validPost)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('必須フィールドの不備を検出する', () => {
      const invalidPost = {
        title: '',
        description: '',
        category: '',
      }

      const result = validatePostData(invalidPost)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('タイトルは必須です')
      expect(result.errors).toContain('説明は必須です')
      expect(result.errors).toContain('有効なカテゴリを選択してください')
    })

    it('文字数制限を検証する', () => {
      const longPost = {
        title: 'a'.repeat(101),
        description: 'a'.repeat(1001),
        category: '不動産'
      }

      const result = validatePostData(longPost)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('タイトルは100文字以内で入力してください')
      expect(result.errors).toContain('説明は1000文字以内で入力してください')
    })

    it('価格の妥当性を検証する', () => {
      const negativePrice = {
        title: 'テスト',
        description: 'テスト説明',
        category: '不動産',
        price: -100
      }

      const result = validatePostData(negativePrice)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('価格は0以上の数値で入力してください')
    })

    it('画像数の制限を検証する', () => {
      const tooManyImages = {
        title: 'テスト',
        description: 'テスト説明',
        category: '不動産',
        images: new Array(6).fill('https://example.com/image.jpg')
      }

      const result = validatePostData(tooManyImages)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('画像は最大5枚まで選択できます')
    })
  })

  describe('calculateDistance', () => {
    it('距離計算が正しく動作する', () => {
      // 八丈島の中心から東京駅までの距離（約287km）
      const hachijoLat = 33.1067
      const hachijoLng = 139.7853
      const tokyoLat = 35.6762
      const tokyoLng = 139.6503

      const distance = calculateDistance(hachijoLat, hachijoLng, tokyoLat, tokyoLng)
      expect(distance).toBeCloseTo(287, -1) // ±5kmの誤差を許容
    })

    it('同じ地点の距離は0になる', () => {
      const distance = calculateDistance(33.1067, 139.7853, 33.1067, 139.7853)
      expect(distance).toBe(0)
    })
  })

  describe('isInHachijo', () => {
    it('八丈島内の座標を正しく判定する', () => {
      // 八丈島空港の座標
      expect(isInHachijo(33.115, 139.786)).toBe(true)

      // 八丈島の中心部
      expect(isInHachijo(33.1067, 139.7853)).toBe(true)
    })

    it('八丈島外の座標を正しく判定する', () => {
      // 東京の座標
      expect(isInHachijo(35.6762, 139.6503)).toBe(false)

      // 大阪の座標
      expect(isInHachijo(34.6937, 135.5023)).toBe(false)
    })

    it('境界値を正しく処理する', () => {
      const bounds = {
        north: 33.155,
        south: 33.045,
        east: 139.81,
        west: 139.74
      }

      // 境界ぎりぎり内側
      expect(isInHachijo(bounds.north, bounds.east)).toBe(true)
      expect(isInHachijo(bounds.south, bounds.west)).toBe(true)

      // 境界を超えた外側
      expect(isInHachijo(bounds.north + 0.001, bounds.east)).toBe(false)
      expect(isInHachijo(bounds.south - 0.001, bounds.west)).toBe(false)
    })
  })
})