'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MobileContextSwitcher() {
  const pathname = usePathname()
  const onOffer = pathname.startsWith('/offer')
  // リクエスト側はトップや /disaster など広めに扱う
  const onRequest = !onOffer

  const baseBtn = 'inline-flex items-center justify-center rounded-full text-xs font-medium px-3 py-1.5 transition-colors border'
  const active = 'bg-slate-800 text-white border-slate-800'
  const inactive = 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'

  return (
    <div className="md:hidden px-3 pt-2 pb-1 bg-slate-50 border-b">
      <div className="flex items-center gap-2" role="tablist" aria-label="画面切替">
        <Link
          href="/"
          role="tab"
          aria-selected={onRequest}
          className={`${baseBtn} ${onRequest ? active : inactive}`}
          title="リクエスト"
        >
          <span className="mr-1.5">🆘</span>リクエスト
        </Link>
        <Link
          href="/offer"
          role="tab"
          aria-selected={onOffer}
          className={`${baseBtn} ${onOffer ? active : inactive}`}
          title="物資提供情報"
        >
          <span className="mr-1.5">📦</span>物資提供
        </Link>
      </div>
    </div>
  )
}

