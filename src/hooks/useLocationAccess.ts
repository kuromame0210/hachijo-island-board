'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLocation } from './useLocation'

// ローカルストレージに保存する島内アクセス記録の型
interface IslandAccessRecord {
  timestamp: number
  isInHachijo: boolean
  location?: {
    lat: number
    lng: number
  }
}

// 2週間のミリ秒
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000

export function useLocationAccess() {
  const { locationResult } = useLocation()
  const [hasRecentIslandAccess, setHasRecentIslandAccess] = useState(false)
  const [lastIslandAccess, setLastIslandAccess] = useState<number | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // 投稿・編集が可能かどうかを判定
  const canPost = locationResult.isInHachijo || hasRecentIslandAccess
  
  // 現在島内にいるかどうか
  const isCurrentlyInIsland = locationResult.isInHachijo

  // 島内アクセス記録を保存する関数（メモ化）
  const saveIslandAccess = useCallback((isInHachijo: boolean, location?: {lat: number, lng: number}) => {
    if (!isInHachijo) return

    const now = Date.now()
    const newRecord: IslandAccessRecord = {
      timestamp: now,
      isInHachijo,
      location
    }

    try {
      // 既存の記録を取得
      const existingRecords = getIslandAccessRecords()
      
      // 新しい記録を追加
      const updatedRecords = [newRecord, ...existingRecords]
        .sort((a, b) => b.timestamp - a.timestamp) // 新しい順にソート
        .slice(0, 50) // 最大50件まで保持

      localStorage.setItem('hachijo-island-access-history', JSON.stringify(updatedRecords))
      
      // 最新の島内アクセス時刻を更新
      setLastIslandAccess(now)
      setHasRecentIslandAccess(true)
      
      console.log('島内アクセス記録を保存しました:', newRecord)
    } catch (error) {
      console.error('島内アクセス記録の保存に失敗:', error)
    }
  }, []) // 依存配列を空にしてメモ化

  // 島内アクセス記録を取得する関数
  const getIslandAccessRecords = (): IslandAccessRecord[] => {
    try {
      const stored = localStorage.getItem('hachijo-island-access-history')
      if (!stored) return []
      
      const records: IslandAccessRecord[] = JSON.parse(stored)
      const now = Date.now()
      
      // 2週間以内の記録のみをフィルタ
      const recentRecords = records.filter(record => 
        record.isInHachijo && (now - record.timestamp <= TWO_WEEKS_MS)
      )
      
      return recentRecords
    } catch (error) {
      console.error('島内アクセス記録の取得に失敗:', error)
      return []
    }
  }

  // 最新の島内アクセス時刻を取得
  const getLastIslandAccessTime = (): number | null => {
    const records = getIslandAccessRecords()
    return records.length > 0 ? records[0].timestamp : null
  }

  // アクセス記録を削除する関数（デバッグ用）
  const clearIslandAccessHistory = () => {
    localStorage.removeItem('hachijo-island-access-history')
    setHasRecentIslandAccess(false)
    setLastIslandAccess(null)
    console.log('島内アクセス記録を削除しました')
  }

  // 2週間以内の島内アクセス状況を確認（メモ化）
  const checkRecentIslandAccess = useCallback(() => {
    const lastAccess = getLastIslandAccessTime()
    const now = Date.now()
    
    if (lastAccess && (now - lastAccess <= TWO_WEEKS_MS)) {
      setHasRecentIslandAccess(true)
      setLastIslandAccess(lastAccess)
      return true
    } else {
      setHasRecentIslandAccess(false)
      setLastIslandAccess(null)
      return false
    }
  }, []) // 依存配列を空にしてメモ化

  // 初期化時の処理
  useEffect(() => {
    setIsHydrated(true)
    
    // 既存の記録をチェック
    checkRecentIslandAccess()
  }, []) // 依存配列を空にして初期化時のみ実行

  // 位置情報が取得されて島内にいる場合、記録を保存
  useEffect(() => {
    if (locationResult.status === 'success' && locationResult.isInHachijo) {
      saveIslandAccess(locationResult.isInHachijo, locationResult.location || undefined)
    }
  }, [locationResult.status, locationResult.isInHachijo, locationResult.location, saveIslandAccess]) // メモ化されたsaveIslandAccessを追加

  return {
    canPost,
    isCurrentlyInIsland,
    hasRecentIslandAccess: isHydrated ? hasRecentIslandAccess : false,
    lastIslandAccess,
    getIslandAccessRecords,
    clearIslandAccessHistory,
    saveIslandAccess,
    checkRecentIslandAccess
  }
}