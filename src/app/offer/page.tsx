'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'
import { BLUR_DATA_URL } from '@/utils/blurDataUrl'
import { Post } from '@/types'

export default function OfferListPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        // タグに 'aid_offer' を含む投稿のみ取得（公開中）
        const { data, error } = await supabase
          .from('hachijo_post_board')
          .select('*')
          .contains('tags', ['aid_offer'])
          .eq('status', 'active')
          .order('created_at', { ascending: false })

        if (error) throw error
        setPosts(data || [])
      } catch (e) {
        console.error('Failed to fetch offers:', e)
        setPosts([])
      } finally {
        setLoading(false)
      }
    }
    fetchOffers()
  }, [])

  const hasPosts = useMemo(() => posts.length > 0, [posts])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">物資提供情報</h1>
        <p className="text-gray-600">支援物資の配布に関する情報を掲載します。公開はエリア名まで、詳細住所は記載しないでください（必要時は個別にご案内）。</p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-500">{hasPosts ? `${posts.length}件` : '0件'}</div>
        <Link
          href="/offer/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          物資掲載
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8">読み込み中...</div>
      ) : !hasPosts ? (
        <div className="text-center py-12 text-gray-500 bg-white border rounded-xl">現在、掲載はありません</div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 overflow-hidden">
          {posts.map((post, index) => {
            const images = post.images && post.images.length > 0 ? post.images : (post.image_url ? [post.image_url] : [])
            const isLast = index === posts.length - 1
            const isGoods = (post.tags || []).includes('goods')
            const isService = (post.tags || []).includes('service')

            return (
              <Link key={post.id} href={`/post/${post.id}`} className="block">
                <div className={`hover:bg-slate-50 transition-colors duration-200 cursor-pointer border-b border-slate-200 ${isLast ? 'border-b-0' : ''}`}>
                  <div className="py-2 px-3">
                    <div className="flex gap-2">
                      <div className="flex-shrink-0">
                        {images.length > 0 ? (
                          <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden border-2 border-slate-300 shadow-sm relative">
                            <Image
                              src={images[0]}
                              alt={post.title}
                              fill
                              className="object-cover"
                              sizes="64px"
                              placeholder="blur"
                              blurDataURL={BLUR_DATA_URL}
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-slate-300 shadow-sm">
                            <span className="text-xl" aria-hidden>🎁</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300">無償提供</span>
                          {isGoods && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">物資配布</span>
                          )}
                          {isService && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">サービス提供</span>
                          )}
                        </div>
                        <h3 className="font-semibold text-base text-gray-900 truncate">{post.title}</h3>
                        {post.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{post.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">{new Date(post.created_at).toLocaleDateString('ja-JP')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
