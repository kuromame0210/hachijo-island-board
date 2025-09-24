'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLocation } from '@/hooks/useLocation'

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { locationResult, hasAskedPermission } = useLocation()
  const isIslander = hasAskedPermission && locationResult.status === 'success' && locationResult.isInHachijo

  return (
    <>
      {/* ハンバーガーメニューボタン */}
      <button
        className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="メニューを開く"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* モバイルメニューオーバーレイ */}
      {isOpen && (
        <>
          {/* 背景オーバーレイ */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* メニューパネル */}
          <div className="fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-white shadow-lg z-50 md:hidden transform transition-transform duration-300">
            <div className="p-6">
              {/* ヘッダー */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">🏝️ メニュー</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* 位置情報ステータス */}
              <div className={`p-3 rounded-lg mb-6 ${
                !hasAskedPermission
                  ? 'bg-amber-50 border border-amber-200'
                  : isIslander
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-orange-50 border border-orange-200'
              }`}>
                <div className="text-sm font-medium">
                  {!hasAskedPermission && '📍 位置未確認'}
                  {hasAskedPermission && isIslander && '🏝️ 八丈島内'}
                  {hasAskedPermission && !isIslander && '🌍 八丈島外'}
                </div>
                <div className="text-xs mt-1 opacity-75">
                  {!hasAskedPermission && '位置確認をお願いします'}
                  {hasAskedPermission && isIslander && '全機能利用可能'}
                  {hasAskedPermission && !isIslander && '一部機能制限'}
                </div>
              </div>

              {/* ナビゲーションリンク */}
              <nav className="space-y-1">
                <Link
                  href="/"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-xl">🏠</span>
                  <span className="font-medium">ホーム</span>
                </Link>
                <a
                  href="/location"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-xl">📍</span>
                  <span className="font-medium">位置情報</span>
                </a>
                <a
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-xl">⚙️</span>
                  <span className="font-medium">設定</span>
                </a>

                {/* 投稿リンク（制限表示付き） */}
                <a
                  href="/new"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isIslander
                      ? 'text-white bg-blue-600 hover:bg-blue-700'
                      : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  }`}
                  onClick={() => {
                    if (isIslander) setIsOpen(false)
                  }}
                >
                  <span className="text-xl">✍️</span>
                  <span className="font-medium">投稿する</span>
                  {!isIslander && <span className="text-xs">🔒</span>}
                </a>
              </nav>

              {/* カテゴリ別リンク */}
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-500 mb-3 px-4">カテゴリ</h3>
                <div className="space-y-1">
                  <Link
                    href="/?category=不動産"
                    className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <span>🏠</span>
                    <span>不動産</span>
                  </Link>
                  <a
                    href={isIslander ? "/?category=仕事" : "#"}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                      isIslander
                        ? 'text-gray-600 hover:bg-gray-50'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                    onClick={() => {
                      if (isIslander) setIsOpen(false)
                    }}
                  >
                    <span>💼</span>
                    <span>仕事</span>
                    {!isIslander && <span className="text-xs">🔒</span>}
                  </a>
                  <Link
                    href="/?category=不用品"
                    className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <span>📦</span>
                    <span>不用品</span>
                  </Link>
                </div>
              </div>

              {/* 位置制限の説明 */}
              {!isIslander && (
                <div className="mt-8 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm font-medium text-blue-800 mb-1">
                    📍 位置確認で全機能解放
                  </div>
                  <div className="text-xs text-blue-600">
                    八丈島内からアクセスすると全ての機能をご利用いただけます
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}