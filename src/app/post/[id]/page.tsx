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

        <div className="border-t border-gray-300 pt-6">
          <h3 className="font-semibold mb-3">連絡先</h3>
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