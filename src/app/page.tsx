'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AdBanner from '@/components/ads/AdBanner'
import { LocationStatus } from '@/components/LocationDetector'
import { useLocation } from '@/hooks/useLocation'
import { SimpleAccessDenied } from '@/components/AccessDenied'
import { Post } from '@/types'

const categoryColors = {
  '不動産': 'bg-blue-50 text-blue-700 border border-blue-200',
  '仕事': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  '不用品': 'bg-amber-50 text-amber-700 border border-amber-200'
}

const categories = ['すべて', '不動産', '仕事', '不用品']
const categoryIcons = {
  'すべて': '',
  '不動産': '🏠 ',
  '仕事': '💼 ',
  '不用品': '📦 '
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [selectedCategory, setSelectedCategory] = useState('すべて')
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [mounted, setMounted] = useState(false)
  const { locationResult, hasAskedPermission } = useLocation()

  useEffect(() => {
    fetchPosts()
    setMounted(true)

    // 設定をローカルストレージから読み込み
    const savedViewMode = localStorage.getItem('viewMode') as 'list' | 'grid'
    if (savedViewMode) {
      setViewMode(savedViewMode)
    }
  }, [])

  useEffect(() => {
    let filtered = posts

    // 島民以外は仕事カテゴリを除外
    const isIslander = hasAskedPermission && locationResult.status === 'success' && locationResult.isInHachijo
    if (!isIslander) {
      filtered = posts.filter(post => post.category !== '仕事')
    }

    if (selectedCategory === 'すべて') {
      setFilteredPosts(filtered)
    } else {
      setFilteredPosts(filtered.filter(post => post.category === selectedCategory))
    }
  }, [posts, selectedCategory, hasAskedPermission, locationResult])

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('hachijo_post_board')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setPosts(data)
    }
    setLoading(false)
  }

  const handleCategoryClick = (category: string) => {
    // 島外から仕事カテゴリを選択しようとした場合の処理
    const isIslander = hasAskedPermission && locationResult.status === 'success' && locationResult.isInHachijo
    if (category === '仕事' && !isIslander) {
      // 何もしない（ボタンを無効化）
      return
    }
    setSelectedCategory(category)
  }

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>
  }

  return (
    <div>
      {/* 位置情報ステータス */}
      <LocationStatus />

      {/* トップバナー広告 */}
      <AdBanner size="large" type="banner" className="mb-4" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-2">
          {categories.map((category) => {
            const isIslander = hasAskedPermission && locationResult.status === 'success' && locationResult.isInHachijo
            const isJobsRestricted = category === '仕事' && !isIslander

            return (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                disabled={isJobsRestricted}
                className={`px-4 py-2 rounded-lg transition text-sm relative ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : isJobsRestricted
                    ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-300 hover:bg-blue-50'
                }`}
                title={isJobsRestricted ? '仕事情報は島民限定です' : ''}
              >
                {categoryIcons[category as keyof typeof categoryIcons]}{category}
                {isJobsRestricted && (
                  <span className="ml-1 text-xs">🔒</span>
                )}
              </button>
            )
          })}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setViewMode('list')
              localStorage.setItem('viewMode', 'list')
            }}
            className={`px-3 py-2 rounded-lg transition text-sm ${
              viewMode === 'list'
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 hover:bg-gray-50'
            }`}
          >
            📋 リスト
          </button>
          <button
            onClick={() => {
              setViewMode('grid')
              localStorage.setItem('viewMode', 'grid')
            }}
            className={`px-3 py-2 rounded-lg transition text-sm ${
              viewMode === 'grid'
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 hover:bg-gray-50'
            }`}
          >
            ⊞ カード
          </button>
          <a
            href="/settings"
            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition text-sm flex items-center gap-1"
            title="設定で詳細な表示オプションを変更"
          >
            ⚙️ 設定
          </a>
        </div>
      </div>

      {/* 仕事カテゴリが選択されているが島民でない場合のアクセス拒否 */}
      {selectedCategory === '仕事' && (!hasAskedPermission || locationResult.status !== 'success' || !locationResult.isInHachijo) ? (
        <SimpleAccessDenied type="jobs" />
      ) : viewMode === 'list' ? (
        // リスト表示
        <div className="bg-white border-t border-b border-gray-400">
          {filteredPosts.map((post, index) => (
            <React.Fragment key={post.id}>
              {/* 広告挿入 */}
              {index === 5 && (
                <div className="border-b border-gray-100 bg-blue-50/30">
                  <AdBanner size="medium" type="banner" className="my-3 mx-3" />
                </div>
              )}
              {index === 12 && (
                <div className="border-b border-gray-100 bg-blue-50/30">
                  <AdBanner size="medium" type="banner" className="my-3 mx-3" />
                </div>
              )}

              <a href={`/post/${post.id}`} className="block">
                <div className={`hover:bg-gray-50 transition-colors duration-200 cursor-pointer border-b border-gray-400 ${index === filteredPosts.length - 1 ? 'border-b-0' : ''}`}>
                  <div className="py-2 px-3">
                    <div className="flex gap-2">
                      {/* 画像/アイコン */}
                      <div className="flex-shrink-0">
                        {(post.images && post.images.length > 0) || post.image_url ? (
                          <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden border border-gray-400">
                            <img
                              src={post.images && post.images.length > 0 ? post.images[0] : post.image_url}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center border border-gray-400">
                            <span className="text-lg">
                              {post.category === '不動産' ? '🏠' :
                               post.category === '仕事' ? '💼' :
                               post.category === '不用品' ? '📦' : '📝'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 投稿情報 */}
                      <div className="flex-1 min-w-0">
                        {/* 1行目: タイトル + 価格 */}
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <h3 className="font-medium text-gray-900 text-sm leading-tight truncate flex-1">
                            {post.title}
                          </h3>
                          {post.price !== null && post.price !== undefined ? (
                            <span className="font-bold text-lg text-red-600 flex-shrink-0">
                              ¥{post.price.toLocaleString()}
                            </span>
                          ) : (
                            <span className="font-bold text-base text-green-600 flex-shrink-0">
                              無料
                            </span>
                          )}
                        </div>

                        {/* 2行目: 説明 + メタ情報 */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <p className="text-gray-600 text-xs truncate flex-1">
                              {post.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                              post.category === '不動産' ? 'bg-blue-100 text-blue-700' :
                              post.category === '仕事' ? 'bg-green-100 text-green-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {post.category}
                            </span>
                            {post.images && post.images.length > 1 && (
                              <span className="text-xs text-gray-500">
                                📷{post.images.length}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {mounted ? new Date(post.created_at).toLocaleDateString('ja-JP', {
                                month: 'numeric',
                                day: 'numeric'
                              }) : '--/--'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            </React.Fragment>
          ))}
        </div>
      ) : (
        // カード表示（既存）
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post, index) => (
            <div key={post.id}>
              {/* 広告挿入 */}
              {index === 2 && (
                <div className="md:col-span-2 lg:col-span-3 my-4">
                  <AdBanner size="medium" type="banner" />
                </div>
              )}
              {index === 5 && (
                <div className="md:col-span-2 lg:col-span-3 my-4">
                  <AdBanner size="medium" type="banner" />
                </div>
              )}

              <a href={`/post/${post.id}`}>
                <Card className="hover:shadow-lg transition cursor-pointer h-full">
                  {(post.images && post.images.length > 0) || post.image_url ? (
                    <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden relative">
                      <img
                        src={post.images && post.images.length > 0 ? post.images[0] : post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                      {post.images && post.images.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                          +{post.images.length - 1}
                        </div>
                      )}
                    </div>
                  ) : null}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={categoryColors[post.category as keyof typeof categoryColors]}>
                        {post.category}
                      </Badge>
                      {post.price !== null && post.price !== undefined && (
                        <span className="font-bold text-xl text-emerald-600">
                          ¥{post.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-xl mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-3">
                      {post.description}
                    </p>
                    <p className="text-sm text-gray-400 mt-4">
                      {mounted ? new Date(post.created_at).toLocaleDateString('ja-JP') : '--/--/--'}
                    </p>
                  </div>
                </Card>
              </a>
            </div>
          ))}
        </div>
      )}

      {filteredPosts.length === 0 && selectedCategory !== '仕事' && (
        <div className="text-center py-8 text-gray-500">
          {selectedCategory === 'すべて' ? '投稿がありません' : `${selectedCategory}の投稿がありません`}
        </div>
      )}
    </div>
  )
}