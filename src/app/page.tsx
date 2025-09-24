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
  '不動産': 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-2 border-blue-800 shadow-md',
  '仕事': 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-2 border-emerald-800 shadow-md',
  '不用品': 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-2 border-orange-700 shadow-md'
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
  const { locationResult, hasAskedPermission, requestLocation } = useLocation()

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
    try {
      const { data, error } = await supabase
        .from('hachijo_post_board')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        setPosts([])
      } else if (data) {
        setPosts(data)
      }
    } catch (error) {
      console.error('Fetch error:', error)
      setPosts([])
    } finally {
      setLoading(false)
    }
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

  // 位置情報未確認時の大きな確認画面
  if (!hasAskedPermission) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl shadow-2xl border-4 border-blue-200">
          <div className="text-center space-y-8">
            <div className="text-8xl mb-6">🏝️</div>
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              八丈島島民専用掲示板
            </h1>
            <div className="bg-white/80 rounded-2xl p-6 border-2 border-blue-300">
              <h2 className="text-2xl font-semibold text-blue-800 mb-4">
                📍 位置情報の確認が必要です
              </h2>
              <p className="text-lg text-slate-700 mb-6 leading-relaxed">
                この掲示板は八丈島島民専用サービスです。<br/>
                ご利用には位置情報による島内確認が必要となります。
              </p>
              <button
                onClick={() => {
                  console.log('位置確認ボタンクリック')
                  requestLocation()
                }}
                className="px-8 py-4 text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-2xl transition-all shadow-lg transform hover:scale-105"
              >
                位置情報を確認する
              </button>
            </div>
            <div className="text-sm text-slate-600 space-y-2">
              <p>⚠️ 位置情報は島内確認のためのみ使用されます</p>
              <p>🔒 個人情報は収集・保存されません</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 位置情報確認中の画面
  if (locationResult.status === 'loading') {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl shadow-2xl border-4 border-blue-200">
          <div className="text-center space-y-8">
            <div className="text-8xl mb-6 animate-pulse">🔄</div>
            <h1 className="text-3xl font-bold text-slate-800 mb-4">
              位置情報を確認中...
            </h1>
            <p className="text-lg text-slate-700">
              GPSまたはIPアドレスによる位置情報を取得しています
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 八丈島外からのアクセス制限画面
  if (hasAskedPermission && (!locationResult.isInHachijo)) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-red-50 to-orange-100 rounded-3xl shadow-2xl border-4 border-red-200">
          <div className="text-center space-y-8">
            <div className="text-8xl mb-6">🚫</div>
            <h1 className="text-4xl font-bold text-red-800 mb-4">
              アクセス制限
            </h1>
            <div className="bg-white/80 rounded-2xl p-6 border-2 border-red-300">
              <h2 className="text-2xl font-semibold text-red-700 mb-4">
                ここは八丈島ではありません
              </h2>
              <p className="text-lg text-slate-700 mb-4 leading-relaxed">
                このサイトは閲覧できません。
              </p>
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <p className="text-lg font-semibold text-red-800">
                  🏝️ ここは八丈島島民専用掲示板です
                </p>
              </div>
            </div>
            {locationResult.distance !== null && (
              <div className="text-sm text-slate-600">
                <p>現在地から八丈島まで約 {locationResult.distance}km</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
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
                className={`px-5 py-3 rounded-lg transition-all text-sm font-medium relative shadow-sm ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg transform scale-105'
                    : isJobsRestricted
                    ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-white border-2 border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
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
            className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
              viewMode === 'list'
                ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-md'
                : 'bg-white border-2 border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
            }`}
          >
            📋 リスト
          </button>
          <button
            onClick={() => {
              setViewMode('grid')
              localStorage.setItem('viewMode', 'grid')
            }}
            className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
              viewMode === 'grid'
                ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-md'
                : 'bg-white border-2 border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
            }`}
          >
            ⊞ カード
          </button>
        </div>
      </div>

      {/* 仕事カテゴリが選択されているが島民でない場合のアクセス拒否 */}
      {selectedCategory === '仕事' && (!hasAskedPermission || locationResult.status !== 'success' || !locationResult.isInHachijo) ? (
        <SimpleAccessDenied type="jobs" />
      ) : viewMode === 'list' ? (
        // リスト表示
        <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 overflow-hidden">
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
                <div className={`hover:bg-slate-50 transition-colors duration-200 cursor-pointer border-b border-slate-200 ${index === filteredPosts.length - 1 ? 'border-b-0' : ''}`}>
                  <div className="py-2 px-3">
                    <div className="flex gap-2">
                      {/* 画像/アイコン */}
                      <div className="flex-shrink-0">
                        {(post.images && post.images.length > 0) || post.image_url ? (
                          <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden border-2 border-slate-300 shadow-sm">
                            <img
                              src={post.images && post.images.length > 0 ? post.images[0] : post.image_url}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-slate-300 shadow-sm">
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
        <div>
          {/* 最初の広告 */}
          {filteredPosts.length > 3 && (
            <div className="mb-6">
              <AdBanner size="medium" type="banner" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => (
              <React.Fragment key={post.id}>
                {/* 中間広告 */}
                {index === 6 && (
                  <div className="md:col-span-2 lg:col-span-3 my-6">
                    <AdBanner size="medium" type="banner" />
                  </div>
                )}
                {index === 12 && (
                  <div className="md:col-span-2 lg:col-span-3 my-6">
                    <AdBanner size="medium" type="banner" />
                  </div>
                )}

                <a href={`/post/${post.id}`}>
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer h-full border-2 border-slate-200 hover:border-slate-300 bg-white rounded-xl overflow-hidden">
                  {(post.images && post.images.length > 0) || post.image_url ? (
                    <div className="h-72 bg-slate-200 overflow-hidden relative">
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
                  ) : (
                    <div className="h-72 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden relative flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-4">
                          {post.category === '不動産' ? '🏠' :
                           post.category === '仕事' ? '💼' :
                           post.category === '不用品' ? '📦' : '📝'}
                        </div>
                        <div className="text-slate-500 font-medium text-lg">
                          {post.category === '不動産' ? '不動産情報' :
                           post.category === '仕事' ? '求人情報' :
                           post.category === '不用品' ? '不用品情報' : '投稿'}
                        </div>
                        <div className="text-slate-400 text-sm mt-2">
                          画像なし
                        </div>
                      </div>
                      {/* 装飾パターン */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/30 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-slate-300/20 to-transparent"></div>
                    </div>
                  )}
                  <div className="p-6 bg-gradient-to-b from-white to-slate-50">
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
              </React.Fragment>
            ))}
          </div>
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