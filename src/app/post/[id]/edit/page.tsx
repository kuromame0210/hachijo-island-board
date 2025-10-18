'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Post } from '@/types'
import { useLocation } from '@/hooks/useLocation'
import { useLocationAccess } from '@/hooks/useLocationAccess'

export default function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { locationResult, hasAskedPermission } = useLocation()
  const { canPost } = useLocationAccess()

  useEffect(() => {
    const fetchPost = async () => {
      const { id } = await params
      
      // 広告投稿は編集不可
      if (id.startsWith('ad-')) {
        setError('広告投稿は編集できません')
        setLoading(false)
        return
      }
      
      // 位置制限チェック（島民のみ編集可能）
      if (!hasAskedPermission || locationResult.status !== 'success' || !canPost) {
        setError('編集機能は八丈島内、または過去2週間以内に島内からアクセスした記録がある方のみご利用いただけます。')
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('hachijo_post_board')
          .select('*')
          .eq('id', id)
          .eq('status', 'active')  // activeステータスのみ取得
          .single()

        if (error) throw error
        if (!data) throw new Error('投稿が見つかりません')

        setPost(data)
      } catch (error) {
        console.error('投稿取得エラー:', error)
        setError('投稿の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params, router, hasAskedPermission, locationResult.status, canPost])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!post) return

    console.log('🚀 handleSubmit called!')
    setSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    console.log('📝 Form data:', Object.fromEntries(formData.entries()))

    try {
      const updateData = {
        title: formData.get('title'),
        description: formData.get('content'),
        category: formData.get('category'),
        contact: formData.get('contact'),
        tags: formData.get('tags')?.toString().split(',').map(tag => tag.trim()).filter(Boolean) || [],
        reward_type: formData.get('reward_type') || null,
        reward_details: formData.get('reward_details') || null,
        requirements: formData.get('requirements') || null,
        age_friendly: formData.get('age_friendly') === 'on',
        map_link: formData.get('map_link') || null,
        iframe_embed: formData.get('iframe_embed') || null,
        updated_at: new Date().toISOString()
      }
      
      console.log('📤 Updating post directly via Supabase:', JSON.stringify(updateData, null, 2))
      
      const { error } = await supabase
        .from('hachijo_post_board')
        .update(updateData)
        .eq('id', post.id)

      if (error) {
        console.error('Supabase update error:', error)
        throw new Error('投稿の更新に失敗しました')
      }

      // 更新成功 - 詳細ページに戻る
      router.push(`/post/${post.id}`)
    } catch (error) {
      console.error('更新エラー:', error)
      setError('投稿の更新に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Card className="p-8">
          <div className="text-center">
            <div className="text-4xl mb-4">📝</div>
            <h2 className="text-xl font-semibold text-gray-700">投稿を読み込み中...</h2>
          </div>
        </Card>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Card className="p-8">
          <div className="text-center">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-red-600 mb-4">エラー</h2>
            <p className="text-gray-600 mb-6">{error || '投稿が見つかりません'}</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              戻る
            </button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">投稿を編集</h1>
          <p className="text-gray-600">投稿内容を修正できます</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* タイトル */}
          <div>
            <label className="text-lg font-medium mb-2 block">
              タイトル <span className="text-red-500">*</span>
            </label>
            <Input
              name="title"
              defaultValue={post.title}
              placeholder="例：八丈島で美味しいパン屋さんを探しています"
              className="text-lg"
              required
            />
          </div>

          {/* カテゴリー */}
          <div>
            <label className="text-lg font-medium mb-2 block">
              カテゴリー <span className="text-red-500">*</span>
            </label>
            {/* カテゴリー選択肢を変更したい場合は CATEGORY_MANAGEMENT.md を参照 */}
            <select
              name="category"
              defaultValue={post.category}
              className="w-full px-3 py-2 text-lg border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="question">💭 質問</option>
              <option value="info">💡 情報</option>
              <option value="announcement">📢 お知らせ</option>
              <option value="event">🎉 イベント</option>
              <option value="job">💼 仕事</option>
              <option value="real_estate">🏠 不動産</option>
              <option value="secondhand">📦 不用品</option>
              <option value="agriculture">🌱 農業</option>
              <option value="volunteer">🤝 ボランティア</option>
              <option value="other">📝 その他</option>
            </select>
          </div>

          {/* 内容 */}
          <div>
            <label className="text-lg font-medium mb-2 block">
              内容 <span className="text-red-500">*</span>
            </label>
            <Textarea
              name="content"
              defaultValue={post.description}
              placeholder="詳しい内容を書いてください..."
              className="text-lg min-h-[200px]"
              required
            />
          </div>

          {/* 連絡先 */}
          <div>
            <label className="text-lg font-medium mb-2 block">
              連絡先 <span className="text-red-500">*</span>
            </label>
            <Input
              name="contact"
              defaultValue={post.contact}
              placeholder="例：090-1234-5678 または example@email.com"
              className="text-lg"
              required
            />
          </div>

          {/* iframe埋め込み */}
          <div>
            <label className="text-lg font-medium mb-2 block text-green-700">
              📍 地図埋め込み（推奨）
            </label>
            <Textarea
              name="iframe_embed"
              defaultValue={post.iframe_embed || ''}
              placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>'
              className="text-sm font-mono"
              rows={4}
            />
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium mb-1">
                🗺️ 地図を投稿に直接表示するにはこちらを使用してください
              </p>
              <p className="text-sm text-green-700">
                Googleマップで場所を検索 → 「共有」→「地図を埋め込む」→「HTML」をコピーして貼り付け
              </p>
            </div>
          </div>

          {/* 場所（Googleマップリンク） */}
          <div>
            <label className="text-lg font-medium mb-2 block text-gray-600">
              🔗 場所（Googleマップリンク）
            </label>
            <Input
              name="map_link"
              defaultValue={post.map_link || ''}
              placeholder="https://maps.app.goo.gl/... または https://www.google.com/maps/..."
              className="text-lg"
            />
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-1">
                ℹ️ 「Googleマップで開く」ボタンが表示されます
              </p>
              <p className="text-sm text-blue-700">
                Googleマップで場所を検索 → 「共有」→「リンクをコピー」して貼り付け
              </p>
            </div>
          </div>

          {/* タグ */}
          <div>
            <label className="text-lg font-medium mb-2 block">
              タグ（任意）
            </label>
            <Input
              name="tags"
              defaultValue={post.tags?.join(', ') || ''}
              placeholder="例：パン, グルメ, おすすめ（カンマ区切り）"
              className="text-lg"
            />
          </div>

          {/* 求人・仕事関連フィールド */}
          {post.category === 'job' && (
            <>

              <div>
                <label className="text-lg font-medium mb-2 block">
                  必要な経験・スキル
                </label>
                <Textarea
                  name="requirements"
                  defaultValue={post.requirements || ''}
                  placeholder="例：パソコンの基本操作ができる方、普通自動車免許"
                  className="text-lg"
                />
              </div>

              <div>
                <label className="text-lg font-medium mb-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="age_friendly"
                    defaultChecked={post.age_friendly}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  シニア歓迎
                </label>
                <p className="text-sm text-gray-500 ml-7">
                  60歳以上の方も歓迎する求人の場合はチェック
                </p>
              </div>
            </>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* ボタン */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {submitting ? '更新中...' : '投稿を更新'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}