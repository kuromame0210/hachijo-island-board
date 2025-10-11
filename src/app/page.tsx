'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AdBanner from '@/components/ads/AdBanner'
import { LocationStatus } from '@/components/LocationDetector'
import { useLocation } from '@/hooks/useLocation'
import { SimpleAccessDenied } from '@/components/AccessDenied'
import { Post } from '@/types'

// ============================================================
// デモ用広告カード（ハードコーディング）
// 本番環境では削除するか、データベースから取得する
//
// TODO: データベースに移行する場合の実装方針
// 1. hachijo_post_boardテーブルに`is_ad: boolean`カラムを追加
// 2. 広告レコードには`is_ad = true`を設定
// 3. 一覧取得時に`WHERE is_ad = false`で広告を除外するか、
//    広告専用のクエリで取得して上部に表示
// 4. カテゴリ「広告」を維持するか、is_adフラグで判別するか検討
// ============================================================
const advertisementCards: Post[] = [
  {
    id: 'ad-freesia-festival',
    title: '🌸 八丈島フリージアまつり 2025',
    description: `八丈島の春を彩る「フリージアまつり」が今年も開催されます！

色とりどりのフリージアが咲き誇る八形山の特設会場で、約35万本のフリージアをお楽しみいただけます。無料シャトルバスも運行しており、島内各所からアクセス可能です。

期間中は、フリージアの摘み取り体験や地元特産品の販売、ステージイベントなども予定しています。春の八丈島で、美しい花々と共に素敵な時間をお過ごしください。`,
    category: '広告',
    created_at: new Date('2025-03-01').toISOString(),
    work_date: '2025年3月22日(土)～4月6日(日)',
    reward_type: 'free',
    reward_details: '入場無料',
    requirements: '特になし。どなたでもご参加いただけます。',
    conditions: '天候により内容が変更になる場合があります。',
    contact: '(一社)八丈島観光協会 TEL: 04996-2-1377',
    age_friendly: true,
    tags: ['広告', '#フリージア祭り', '#八丈島', '#春のイベント', '#観光'],
    images: []
  },
  {
    id: 'ad-tax-reminder',
    title: '📋 令和6年度 住民税納付のご案内',
    description: `令和6年度住民税の納付期限が近づいています。

納付書をお持ちの方は、各金融機関またはコンビニエンスストアでお支払いください。納付書を紛失された方や、お手元に届いていない方は、八丈町役場税務課までご連絡ください。

口座振替をご利用の方は、残高不足にご注意ください。納付が困難な場合は、分納のご相談も承っておりますので、お気軽にお問い合わせください。`,
    category: '広告',
    created_at: new Date('2025-09-01').toISOString(),
    work_date: '納期限：第1期 6月末、第2期 8月末、第3期 10月末、第4期 1月末',
    reward_type: 'free',
    contact: '八丈町役場 税務課 TEL: 04996-2-1121',
    age_friendly: false,
    tags: ['広告', '#住民税', '#納税', '#八丈町', '#お知らせ'],
    images: []
  }
]
// ============================================================

import { 
  getCategoriesForFilter, 
  getCategoryIcon, 
  getCategoryLabel,
  type CategoryKey 
} from '@/lib/categories'

const categoriesForFilter = getCategoriesForFilter()

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
    default: return 'bg-gray-100 text-gray-700'
  }
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
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
  }, [])

  // パフォーマンス最適化: useMemoでフィルタリング処理をメモ化
  const filteredPosts = useMemo(() => {
    let filtered = posts

    // 島民以外は仕事カテゴリを除外
    const isIslander = hasAskedPermission && locationResult.status === 'success' && locationResult.isInHachijo
    if (!isIslander) {
      filtered = posts.filter(post => post.category !== 'job')
    }

    if (selectedCategory === 'all') {
      return filtered
    } else {
      return filtered.filter(post => post.category === selectedCategory)
    }
  }, [posts, selectedCategory, hasAskedPermission, locationResult])

  // 島民判定のメモ化
  const isIslander = useMemo(() => {
    return hasAskedPermission && locationResult.status === 'success' && locationResult.isInHachijo
  }, [hasAskedPermission, locationResult])

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('hachijo_post_board')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        setPosts(advertisementCards) // エラー時は広告カードのみ表示
      } else if (data) {
        // 広告カードを通常の投稿に混合
        const allPosts = [...advertisementCards, ...data]
        setPosts(allPosts)
      }
    } catch (error) {
      console.error('Fetch error:', error)
      setPosts(advertisementCards) // エラー時は広告カードのみ表示
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (category: string) => {
    // 島外から仕事カテゴリを選択しようとした場合の処理
    if (category === 'job' && !isIslander) {
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
                onClick={requestLocation}
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
      {/* 位置情報ステータス */}
      <LocationStatus />

      {/* トップバナー広告 */}
      <AdBanner size="large" type="banner" className="mb-4" />

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        {/* カテゴリーボタンを追加/変更したい場合は CATEGORY_MANAGEMENT.md を参照 */}
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

      {/* 仕事カテゴリが選択されているが島民でない場合のアクセス拒否 */}
      {selectedCategory === '仕事' && !isIslander ? (
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
{/* 報酬表示 */}
                          {post.reward_type === 'non_money' ? (
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
                      <Badge className={getCategoryBadgeColor(post.category)}>
                        {getCategoryLabel(post.category as CategoryKey)}
                      </Badge>
{/* 報酬表示 */}
                      {post.reward_type === 'non_money' ? (
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
                      ) : null}
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

      {filteredPosts.length === 0 && selectedCategory !== '仕事' && (
        <div className="text-center py-8 text-gray-500">
          {selectedCategory === 'すべて' ? '投稿がありません' : `${selectedCategory}の投稿がありません`}
        </div>
      )}
    </div>
  )
}