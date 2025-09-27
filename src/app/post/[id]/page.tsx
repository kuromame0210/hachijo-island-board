'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import AdBanner from '@/components/ads/AdBanner'
import { Post } from '@/types'

export default function PostDetail({ params }: { params: Promise<{ id: string }> }) {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    const fetchPost = async () => {
      const { id } = await params
      const { data } = await supabase
        .from('hachijo_post_board')
        .select('*')
        .eq('id', id)
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
          {/* 報酬・対価情報 */}
          {(post.reward_type || post.reward_details) && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                💰 報酬・対価
              </h4>
              {post.reward_type && (
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-medium">種別:</span> {
                    post.reward_type === 'money' ? '💰 金銭報酬' :
                    post.reward_type === 'non_money' ? '🎁 非金銭報酬' :
                    post.reward_type === 'both' ? '💎 混合報酬' :
                    '🤝 無償・体験'
                  }
                </p>
              )}
              {post.reward_details && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">詳細:</span> {post.reward_details}
                </p>
              )}
            </div>
          )}

          {/* 作業日時 */}
          {post.work_date && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                📅 実施日時
              </h4>
              <p className="text-sm text-gray-700">{post.work_date}</p>
            </div>
          )}

          {/* 参加条件 */}
          {post.requirements && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                📋 参加・応募条件
              </h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.requirements}</p>
            </div>
          )}

          {/* 注意事項 */}
          {post.conditions && (
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                ⚠️ 条件・注意事項
              </h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.conditions}</p>
            </div>
          )}
        </div>

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

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-blue-50 hover:border-blue-300 h-10 px-4 py-2 w-full sm:w-auto"
          >
            ← 一覧に戻る
          </Link>
        </div>
          </div>
        </Card>
      </div>

      {/* サイドバー */}
      <div className="lg:col-span-1 space-y-6">
        <AdBanner size="small" type="sidebar" />
        <AdBanner size="small" type="sidebar" />
        <AdBanner size="small" type="sidebar" />
      </div>
    </div>
  )
}