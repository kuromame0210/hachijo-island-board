'use client'

import { CompactLocationStatus } from '@/components/LocationRestrictionStatus'
import MobileMenu from '@/components/MobileMenu'
import { useLocation } from '@/hooks/useLocation'

export default function ClientComponents() {
  const { locationResult, hasAskedPermission } = useLocation()

  // 島民判定
  const isIslander = hasAskedPermission && locationResult.status === 'success' && locationResult.isInHachijo

  return (
    <>
      <CompactLocationStatus />
      {isIslander && (
        <a
          href="/settings"
          className="hidden md:flex items-center justify-center w-6 h-6 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors text-sm"
          title="設定"
        >
          ⚙️
        </a>
      )}
      {isIslander && (
        <a
          href="/disaster/new"
          className="md:hidden bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-bold shadow-lg"
        >
          ボランティア要請
        </a>
      )}
      <MobileMenu />
    </>
  )
}