'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import GoogleMapEmbed from '@/components/GoogleMapEmbed'
import { Post } from '@/types'
import { useLocationAccess } from '@/hooks/useLocationAccess'

// ============================================================
// デモ用広告データ（page.tsxと同期）
// 本番環境では削除するか、データベースから取得する
//
// TODO: データベースに移行する場合
// - is_adフラグを使って広告を判別
// - 通常の投稿と同じテーブルから取得可能にする
// ============================================================
const advertisementCards: Post[] = [
  {
    id: 'ad-hachijo-infra',
    title: '🏗️ 八丈島インフラ情報',
    description: `八丈島の道路、上下水道、交通機関などのインフラ情報をお知らせしています。

島内の交通規制、工事情報、ライフライン関連のお知らせなど、島民の皆様の生活に役立つ最新のインフラ情報を随時更新しています。

台風や災害時の緊急情報も掲載していますので、ぜひブックマークしてご活用ください。`,
    category: '広告',
    created_at: new Date('2025-10-01').toISOString(),
    work_date: '随時更新',
    reward_type: 'free',
    reward_details: '無料',
    requirements: '特になし',
    conditions: '情報は随時更新されます',
    contact: 'https://infra8jo.shuuutaf.workers.dev/',
    age_friendly: true,
    tags: ['広告', '#インフラ', '#八丈島', '#道路情報', '#生活情報'],
    images: []
  },
  {
    id: 'ad-hachijo-saigai',
    title: '🚨 八丈島災害情報',
    description: `八丈島の災害・防災情報を総合的にお知らせするサイトです。

台風接近時の警報・注意報、避難所情報、ライフライン復旧状況など、島民の皆様の安全に関わる重要な情報を迅速にお伝えしています。

緊急時の連絡先、防災マップ、避難場所一覧なども掲載。災害への備えとしてぜひご確認ください。`,
    category: '広告',
    created_at: new Date('2025-10-01').toISOString(),
    work_date: '24時間365日',
    reward_type: 'free',
    reward_details: '無料',
    requirements: '特になし',
    conditions: '緊急時は随時更新',
    contact: 'https://www.8jo-saigai.com/',
    age_friendly: true,
    tags: ['広告', '#災害情報', '#防災', '#八丈島', '#緊急情報'],
    images: []
  }
]
// ============================================================

export default function PostDetail({ params }: { params: Promise<{ id: string }> }) {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showEditWarning, setShowEditWarning] = useState(false)
  const { canPost } = useLocationAccess()

  useEffect(() => {
    const fetchPost = async () => {
      const { id } = await params

      // デモ用: 広告IDの場合はハードコードされたデータを返す
      if (id.startsWith('ad-')) {
        const adPost = advertisementCards.find(ad => ad.id === id)
        setPost(adPost || null)
        setLoading(false)
        return
      }

      // 通常の投稿はデータベースから取得（activeステータスのみ）
      const { data } = await supabase
        .from('hachijo_post_board')
        .select('*')
        .eq('id', id)
        .eq('status', 'active')  // activeステータスのみ取得
        .single()

      setPost(data)
      setLoading(false)
    }

    fetchPost()
  }, [params])

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>
  }

  if (!post) {
    return <div>投稿が見つかりません</div>
  }

  const images = post.images && post.images.length > 0 ? post.images : (post.image_url ? [post.image_url] : [])

  return (
    <>
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* メインコンテンツ */}
      <div className="lg:col-span-3">
        <Card>
          <div className="p-8">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="secondary" className="text-base">
            {post.category}
          </Badge>
          <span className="text-sm text-gray-500">
            {new Date(post.created_at).toLocaleDateString('ja-JP')}
          </span>
        </div>

        <h1 className="text-4xl font-bold mb-8 text-gray-900 leading-tight">{post.title}</h1>

        {post.price !== null && post.price !== undefined && (
          <div className="text-3xl font-bold text-emerald-600 mb-8">
            ¥{post.price.toLocaleString()}
          </div>
        )}

        {/* 画像ギャラリー */}
        {images.length > 0 && (
          <div className="mb-8">
            <div className="mb-4">
              <img
                src={images[selectedImageIndex]}
                alt={`${post.title} - 画像 ${selectedImageIndex + 1}`}
                className="w-full h-80 object-cover rounded-lg"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index ? 'border-blue-600' : 'border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`サムネイル ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="prose max-w-none mb-8">
          <p className="whitespace-pre-wrap text-gray-700">
            {post.description}
          </p>
        </div>

        {/* 新フィールドの表示 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* 作業日時 */}
          {post.work_date && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                📅 実施日時
              </h4>
              <p className="text-base text-gray-700">{post.work_date}</p>
            </div>
          )}

          {/* 参加条件 */}
          {post.requirements && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                📋 参加・応募条件
              </h4>
              <p className="text-base text-gray-700 whitespace-pre-wrap">{post.requirements}</p>
            </div>
          )}

          {/* 注意事項 */}
          {post.conditions && (
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                ⚠️ 条件・注意事項
              </h4>
              <p className="text-base text-gray-700 whitespace-pre-wrap">{post.conditions}</p>
            </div>
          )}
        </div>

        {/* 地図表示 */}
        {(post.map_link || post.iframe_embed) && (
          <div className="mb-8">
            <GoogleMapEmbed 
              mapLink={post.map_link} 
              iframeEmbed={post.iframe_embed}
              title="投稿の場所" 
            />
          </div>
        )}

        {/* タグ表示 */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">🏷️ タグ</h4>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 年少者参加可能フラグ */}
        {post.age_friendly && (
          <div className="mb-6 p-3 bg-gradient-to-r from-green-100 to-teal-100 rounded-lg border border-green-300">
            <p className="text-sm font-medium text-green-800 flex items-center gap-2">
              👦👧 年少者（高校生・中学生等）参加可能
            </p>
          </div>
        )}

        <div className="border-t border-gray-300 pt-6">
          <h3 className="font-semibold mb-3">📞 連絡先</h3>
          <p className="text-lg bg-blue-50 p-4 rounded-lg font-mono border border-blue-200">
            {post.contact}
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-between items-start">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-blue-50 hover:border-blue-300 h-10 px-4 py-2 w-full sm:w-auto"
          >
            ← 一覧に戻る
          </Link>
          
{/* 広告投稿は編集できないようにする */}
          {!post.id.startsWith('ad-') && canPost && (
            <button
              onClick={() => setShowEditWarning(true)}
              className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 h-8 px-3 py-1 text-gray-600"
            >
              🔧 編集
            </button>
          )}
        </div>
          </div>
        </Card>
      </div>

      {/* サイドバー - 広告は一旦削除 */}
      <div className="lg:col-span-1 space-y-6">
        {/* 広告エリア - 後で実装 */}
      </div>
    </div>

    {/* 編集確認ダイアログ */}
    {showEditWarning && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <h3 className="text-lg font-semibold mb-4">投稿を編集しますか？</h3>
          <p className="text-gray-600 mb-6">
            データベースが変更され、元に戻せません。<br/>
            編集を続行しますか？
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowEditWarning(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={() => {
                setShowEditWarning(false)
                window.location.href = `/post/${post?.id}/edit`
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              編集する
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}