'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLocation } from '@/hooks/useLocation'
import { SimpleAccessDenied } from '@/components/AccessDenied'
import { Post } from '@/types'
import InfoPortalLinks from '@/components/InfoPortalLinks'

// 広告はデータベースから投稿として取得するように変更

import { 
  getCategoryIcon, 
  getCategoryLabel,
  type CategoryKey 
} from '@/lib/categories'

// カテゴリーバッジ用の軽い色バリエーション
// 新しいカテゴリーを追加した場合は、ここにも色を追加してください
// 色は categories.ts の color より薄めのバリエーションを使用
const getCategoryBadgeColor = (category: string): string => {
  const categoryKey = category as CategoryKey
  switch (categoryKey) {
    case 'real_estate': return 'bg-blue-100 text-blue-700'
    case 'job': return 'bg-green-100 text-green-700'
    case 'secondhand': return 'bg-orange-100 text-orange-700'
    case 'agriculture': return 'bg-green-100 text-green-700'
    case 'event': return 'bg-purple-100 text-purple-700'
    case 'volunteer': return 'bg-pink-100 text-pink-700'
    case 'question': return 'bg-indigo-100 text-indigo-700'
    case 'info': return 'bg-amber-100 text-amber-700'
    case 'announcement': return 'bg-red-100 text-red-700'
    case 'other': return 'bg-gray-100 text-gray-700'
    case 'advertisement': return 'bg-yellow-100 text-orange-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([])
  // カテゴリフィルター一時無効化のため'all'に固定
  const selectedCategory = 'all'
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [statusFilter, setStatusFilter] = useState<'active' | 'all'>('active')
  const [isAdmin, setIsAdmin] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { locationResult, hasAskedPermission, requestLocation, lastChecked } = useLocation()

  useEffect(() => {
    fetchPosts()
    setMounted(true)

    // 設定をローカルストレージから読み込み
    const savedViewMode = localStorage.getItem('viewMode') as 'list' | 'grid'
    if (savedViewMode) {
      setViewMode(savedViewMode)
    }

    // 管理者認証状態をチェック
    const authStatus = sessionStorage.getItem('admin-auth')
    setIsAdmin(authStatus === 'authenticated')
  }, [])

  // ステータスフィルターが変更された時にデータを再取得
  useEffect(() => {
    fetchPosts()
  }, [statusFilter])

  // カテゴリフィルター無効化時の投稿リスト（島民以外は仕事カテゴリを除外）
  const filteredPosts = useMemo(() => {
    // 島民以外は仕事カテゴリを除外
    const isIslander = hasAskedPermission && locationResult.status === 'success' && locationResult.isInHachijo
    if (!isIslander) {
      return posts.filter(post => post.category !== 'job')
    }
    return posts
  }, [posts, hasAskedPermission, locationResult])

  // 島民判定のメモ化
  const isIslander = useMemo(() => {
    return hasAskedPermission && locationResult.status === 'success' && locationResult.isInHachijo
  }, [hasAskedPermission, locationResult])

  const fetchPosts = async () => {
    try {
      // 管理者の場合は全ステータス、一般ユーザーはactiveのみ
      let query = supabase
        .from('hachijo_post_board')
        .select('*')

      // ステータスフィルターを適用
      if (statusFilter === 'active' || !isAdmin) {
        // 一般ユーザーまたは管理者が「公開中」を選択した場合
        query = query.eq('status', 'active')
      }
      // 管理者が「全て」を選択した場合は、ステータス条件を追加しない

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        setPosts([]) // エラー時は空の配列
      } else if (data) {
        setPosts(data)
      }
    } catch (error) {
      console.error('Fetch error:', error)
      setPosts([]) // エラー時は空の配列
    } finally {
      setLoading(false)
    }
  }

  // カテゴリフィルター無効化により削除
  // const handleCategoryClick = (category: string) => {
  //   // 島外から仕事カテゴリを選択しようとした場合の処理
  //   if (category === 'job' && !isIslander) {
  //     // 何もしない（ボタンを無効化）
  //     return
  //   }
  //   setSelectedCategory(category)
  // }

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>
  }

  // 位置情報は右下の小さな表示で確認してもらう

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
            <div className="space-y-3">
              {locationResult.distance !== null && (
                <div className="text-sm text-slate-600">
                  <p>現在地から八丈島まで約 {locationResult.distance}km</p>
                </div>
              )}
              {lastChecked && (
                <div className="text-xs text-slate-500">
                  最終検出: {new Date(lastChecked).toLocaleString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              )}
              <button
                onClick={() => requestLocation(true)}
                className="px-6 py-3 text-base font-bold bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all shadow-lg transform hover:scale-105"
              >
                位置情報を再検出する
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        {/* カテゴリーフィルター一時非表示（レコード数が少ないため） */}
        {/* 
        <div className="overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-2">
            {categoriesForFilter.map(({ key, label }) => {
            const isJobsRestricted = key === 'job' && !isIslander
            const displayIcon = key === 'all' ? '' : getCategoryIcon(key as CategoryKey)

            return (
              <button
                key={key}
                onClick={() => handleCategoryClick(key)}
                disabled={isJobsRestricted}
                className={`px-5 py-3 rounded-lg transition-all text-sm font-medium relative shadow-sm whitespace-nowrap ${
                  selectedCategory === key
                    ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg transform scale-105'
                    : isJobsRestricted
                    ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-white border-2 border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                }`}
                title={isJobsRestricted ? '仕事情報は島民限定です' : ''}
              >
                {displayIcon}{label}
                {isJobsRestricted && (
                  <span className="ml-1 text-xs">🔒</span>
                )}
              </button>
            )
          })}
          </div>
        </div>
        */}

        <div className="flex gap-4">
          {/* ステータスフィルター（管理者のみ） */}
          {isAdmin && (
            <div className="flex gap-2 whitespace-nowrap">
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-4 py-2 rounded-lg transition-all text-sm font-medium whitespace-nowrap shadow-sm ${
                  statusFilter === 'active'
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg transform scale-105'
                    : 'bg-white border-2 border-green-300 text-green-700 hover:border-green-400 hover:bg-green-50'
                }`}
              >
                ✅ 公開中
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg transition-all text-sm font-medium whitespace-nowrap shadow-sm ${
                  statusFilter === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                    : 'bg-white border-2 border-blue-300 text-blue-700 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                📋 全て
              </button>
            </div>
          )}

          {/* 表示モード切り替え */}
          <div className="flex gap-2 whitespace-nowrap">
            <button
              onClick={() => {
                setViewMode('list')
                localStorage.setItem('viewMode', 'list')
              }}
              className={`px-5 py-3 rounded-lg transition-all text-sm font-medium whitespace-nowrap shadow-sm ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg transform scale-105'
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
              className={`px-5 py-3 rounded-lg transition-all text-sm font-medium whitespace-nowrap shadow-sm ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg transform scale-105'
                  : 'bg-white border-2 border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
              }`}
            >
              ⊞ カード
            </button>
          </div>
        </div>
      </div>

      {/* 情報ポータルリンク */}
      <div className="mb-6">
        <InfoPortalLinks className="mb-4" />
      </div>

      {/* カテゴリフィルター無効化により仕事カテゴリ選択時のアクセス制限も削除 */}
      {viewMode === 'list' ? (
        // リスト表示
        <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 overflow-hidden">
          {filteredPosts.map((post, index) => (
            <React.Fragment key={post.id}>

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
                              {getCategoryIcon(post.category as CategoryKey)}
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
{/* 報酬表示（災害支援投稿の場合は非表示） */}
                          {!(() => {
                            const disasterCategories = ['tree_removal', 'water_supply', 'transportation', 'shopping', 'other']
                            const hasDisasterCategoryTag = post.tags && post.tags.some(tag => disasterCategories.includes(tag))
                            const hasDisasterKeywords = post.title && (
                              post.title.includes('倒木を除去してほしい') || 
                              post.title.includes('水を持ってきて欲しい') ||
                              post.title.includes('移動したい') ||
                              post.title.includes('買い出しをお願いしたい') ||
                              post.title.includes('支援') || post.title.includes('災害') || post.title.includes('リクエスト') || 
                              post.title.includes('ボランティア') || post.title.includes('台風') || post.title.includes('みつね') || 
                              post.title.includes('テスト')
                            )
                            return hasDisasterCategoryTag || hasDisasterKeywords || post.id === 'f69879ae-e607-4189-85b9-06a8d9b3061d'
                          })() && (
                            post.reward_type === 'non_money' ? (
                              <span className="font-bold text-base text-green-600 flex-shrink-0">
                                {post.reward_details || '非金銭報酬'}
                              </span>
                            ) : post.reward_type === 'both' ? (
                              <span className="font-bold text-base text-blue-600 flex-shrink-0">
                                {post.reward_details || '金銭+現物'}
                              </span>
                            ) : post.reward_type === 'free' ? (
                              <span className="font-bold text-base text-purple-600 flex-shrink-0">
                                無償・体験
                              </span>
                            ) : post.price !== null && post.price !== undefined ? (
                              <span className="font-bold text-lg text-red-600 flex-shrink-0">
                                ¥{post.price.toLocaleString()}
                              </span>
                            ) : (
                              <span className="font-bold text-base text-green-600 flex-shrink-0">
                                無料
                              </span>
                            )
                          )}
                        </div>

                        {/* 2行目: 説明 + 追加情報 */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <p className="text-gray-600 text-xs truncate flex-1">
                              {post.description}
                            </p>
                            {/* 作業日時の簡易表示 */}
                            {post.work_date && (
                              <span className="text-xs text-blue-600 bg-blue-50 px-1 rounded flex-shrink-0">
                                📅
                              </span>
                            )}
                            {/* 参加条件 */}
                            {post.requirements && (
                              <span className="text-xs text-purple-600 bg-purple-50 px-1 rounded flex-shrink-0">
                                📋
                              </span>
                            )}
                            {/* 年少者可能フラグ */}
                            {post.age_friendly && (
                              <span className="text-xs text-green-600 bg-green-50 px-1 rounded flex-shrink-0">
                                👦
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getCategoryBadgeColor(post.category)}`}>
                              {getCategoryLabel(post.category as CategoryKey)}
                            </span>
                            {/* ステータスバッジ（管理者のみ） */}
                            {isAdmin && post.status !== 'active' && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 ml-1">
                                🚫 {post.status === 'hidden' ? '非表示' : post.status}
                              </span>
                            )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => (
              <React.Fragment key={post.id}>

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
                          {getCategoryIcon(post.category as CategoryKey)}
                        </div>
                        <div className="text-slate-500 font-medium text-lg">
                          {getCategoryLabel(post.category as CategoryKey)}
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
                      <div className="flex items-center gap-2">
                        <Badge className={getCategoryBadgeColor(post.category)}>
                          {getCategoryLabel(post.category as CategoryKey)}
                        </Badge>
                        {/* ステータスバッジ（管理者のみ） */}
                        {isAdmin && post.status !== 'active' && (
                          <Badge className="bg-red-100 text-red-700">
                            🚫 {post.status === 'hidden' ? '非表示' : post.status}
                          </Badge>
                        )}
                      </div>
{/* 報酬表示（災害支援投稿の場合は非表示） */}
                      {!(() => {
                        const disasterCategories = ['tree_removal', 'water_supply', 'transportation', 'shopping', 'other']
                        const hasDisasterCategoryTag = post.tags && post.tags.some(tag => disasterCategories.includes(tag))
                        const hasDisasterKeywords = post.title && (
                          post.title.includes('倒木を除去してほしい') || 
                          post.title.includes('水を持ってきて欲しい') ||
                          post.title.includes('移動したい') ||
                          post.title.includes('買い出しをお願いしたい') ||
                          post.title.includes('支援') || post.title.includes('災害') || post.title.includes('リクエスト') || 
                          post.title.includes('ボランティア') || post.title.includes('台風') || post.title.includes('みつね') || 
                          post.title.includes('テスト')
                        )
                        return hasDisasterCategoryTag || hasDisasterKeywords || post.id === 'f69879ae-e607-4189-85b9-06a8d9b3061d'
                      })() && (
                        post.reward_type === 'non_money' ? (
                          <span className="font-bold text-sm text-green-600 max-w-24 truncate">
                            {post.reward_details || '非金銭報酬'}
                          </span>
                        ) : post.reward_type === 'both' ? (
                          <span className="font-bold text-sm text-blue-600 max-w-32 truncate">
                            {post.reward_details || '金銭+現物'}
                          </span>
                        ) : post.reward_type === 'free' ? (
                          <span className="font-bold text-sm text-purple-600">
                            無償・体験
                          </span>
                        ) : post.price !== null && post.price !== undefined ? (
                          <span className="font-bold text-xl text-emerald-600">
                            ¥{post.price.toLocaleString()}
                          </span>
                        ) : null
                      )}
                    </div>
                    <h3 className="font-semibold text-xl mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-3 mb-2">
                      {post.description}
                    </p>
                    {/* アイコン表示 */}
                    <div className="flex gap-2 items-center">
                      {post.work_date && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          📅
                        </span>
                      )}
                      {post.requirements && (
                        <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                          📋
                        </span>
                      )}
                      {post.age_friendly && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                          👦
                        </span>
                      )}
                    </div>
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

      {filteredPosts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          投稿がありません
        </div>
      )}
    </div>
  )
}