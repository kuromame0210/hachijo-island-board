'use client'

import { useLocation } from '@/hooks/useLocation'

export default function LocationStatusBar() {
  const { locationResult, hasAskedPermission, requestLocation, isLoading } = useLocation()

  // 小さな右下固定表示
  const getLocationStatus = () => {
    if (!hasAskedPermission) {
      return {
        color: 'bg-amber-100 text-amber-800 border border-amber-300',
        text: '位置未確認',
        action: true
      }
    }

    if (locationResult.status === 'loading' || isLoading) {
      return {
        color: 'bg-blue-100 text-blue-800 border border-blue-300',
        text: '確認中...',
        action: false
      }
    }

    if (locationResult.status === 'error' || locationResult.status === 'denied') {
      return {
        color: 'bg-red-100 text-red-800 border border-red-300',
        text: '取得失敗',
        action: true
      }
    }

    if (locationResult.isInHachijo) {
      return {
        color: 'bg-green-100 text-green-800 border border-green-300',
        text: '八丈からのアクセス',
        action: false
      }
    }

    return {
      color: 'bg-gray-100 text-gray-800 border border-gray-300',
      text: '島外',
      action: false
    }
  }

  const statusInfo = getLocationStatus()

  return (
    <div className={`fixed bottom-4 right-4 z-30 ${statusInfo.color} rounded-lg px-3 py-2 text-sm shadow-md max-w-40`}>
      <div className="text-center">
        <div className="font-medium">{statusInfo.text}</div>
        {statusInfo.action && (
          <button
            onClick={() => requestLocation()}
            disabled={isLoading}
            className="text-xs underline hover:no-underline mt-1 disabled:opacity-50"
          >
            確認
          </button>
        )}
      </div>
    </div>
  )
}

// シンプル版（ヘッダー内組み込み用）
export function SimpleLocationStatus() {
  const { locationResult, hasAskedPermission } = useLocation()

  if (!hasAskedPermission) {
    return (
      <div className="flex items-center gap-2 text-sm sm:text-base text-amber-600 font-medium">
        <span className="hidden sm:inline">位置確認</span>
      </div>
    )
  }

  if (locationResult.status === 'loading') {
    return (
      <div className="flex items-center gap-2 text-sm sm:text-base text-blue-600">
        <span className="hidden sm:inline">確認中</span>
      </div>
    )
  }

  if (locationResult.isInHachijo) {
    return (
      <div className="flex items-center gap-2 text-sm sm:text-base text-green-600 font-medium">
        <span>八丈島</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm sm:text-base text-orange-600">
      <span className="hidden sm:inline">島外</span>
    </div>
  )
}