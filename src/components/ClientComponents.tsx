'use client'

import { CompactLocationStatus } from '@/components/LocationRestrictionStatus'
import MobileMenu from '@/components/MobileMenu'

export default function ClientComponents() {
  return (
    <>
      <CompactLocationStatus />
      <a
        href="/settings"
        className="hidden md:flex items-center justify-center w-6 h-6 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors text-sm"
        title="設定"
      >
        ⚙️
      </a>
      <a
        href="/new"
        className="md:hidden bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors duration-200 text-xs"
      >
        投稿
      </a>
      <MobileMenu />
    </>
  )
}