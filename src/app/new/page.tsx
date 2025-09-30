'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useLocation } from '@/hooks/useLocation'
import AccessDenied from '@/components/AccessDenied'

export default function NewPost() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const { locationResult, hasAskedPermission } = useLocation()

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newImages = files.slice(0, 5 - selectedImages.length)

    if (selectedImages.length + newImages.length > 5) {
      alert('画像は最大5枚まで選択できます')
      return
    }

    setSelectedImages(prev => [...prev, ...newImages])

    // プレビューを作成
    newImages.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = []

    for (const image of selectedImages) {
      const fileExt = image.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      const { error } = await supabase.storage
        .from('post-images')
        .upload(fileName, image)

      if (error) {
        console.error('Image upload error:', error)
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName)

      uploadedUrls.push(publicUrl)
    }

    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)

      // 画像をアップロード
      const imageUrls = await uploadImages()

      // タグの処理（カンマ区切りの文字列を配列に変換）
      const tagsString = formData.get('tags') as string
      const tagsArray = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag) : []

      // 投稿を作成（新フィールド対応）
      const { error } = await supabase.from('hachijo_post_board').insert({
        title: formData.get('title'),
        description: formData.get('description'),
        category: formData.get('category'),
        price: formData.get('price') ? Number(formData.get('price')) : null,
        contact: formData.get('contact'),
        images: imageUrls,
        image_url: imageUrls.length > 0 ? imageUrls[0] : null,
        // 新フィールド
        work_date: formData.get('work_date'),
        conditions: formData.get('conditions'),
        tags: tagsArray,
        reward_type: formData.get('reward_type'),
        reward_details: formData.get('reward_details'),
        requirements: formData.get('requirements'),
        age_friendly: formData.get('age_friendly') === 'on'
      })

      if (!error) {
        router.push('/')
      } else {
        console.error('Post creation error:', error)
        alert('投稿の作成に失敗しました')
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  // 位置情報確認していない、または八丈島外からのアクセスの場合はアクセス拒否
  if (!hasAskedPermission || locationResult.status !== 'success' || !locationResult.isInHachijo) {
    return <AccessDenied type="posting" />
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold">新規投稿</h1>

        <div>
          <label className="text-sm font-medium mb-2 block">
            カテゴリ
          </label>
          <Select name="category" required>
            <SelectTrigger>
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="不動産">🏠 不動産</SelectItem>
              <SelectItem value="仕事">💼 仕事</SelectItem>
              <SelectItem value="不用品">📦 不用品</SelectItem>
              <SelectItem value="農業">🌱 農業</SelectItem>
              <SelectItem value="イベント">🎉 イベント</SelectItem>
              <SelectItem value="ボランティア">🤝 ボランティア</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            タイトル
          </label>
          <Input name="title" required placeholder="例: 2LDKアパート賃貸" />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            説明
          </label>
          <Textarea
            name="description"
            required
            rows={5}
            placeholder="詳細な説明を入力してください"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            報酬・対価の種別
          </label>
          <Select name="reward_type" required>
            <SelectTrigger>
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="money">💰 金銭報酬</SelectItem>
              <SelectItem value="non_money">🎁 非金銭報酬（物品・サービス）</SelectItem>
              <SelectItem value="both">💎 金銭+現物</SelectItem>
              <SelectItem value="free">🤝 無償・体験</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            報酬・対価の詳細
          </label>
          <Input
            name="reward_details"
            placeholder="例: 時給1000円、収穫物のお裾分け、入場無料など"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            価格（円）※金銭報酬の場合
          </label>
          <Input
            name="price"
            type="number"
            placeholder="金銭報酬がある場合のみ入力"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            画像（最大5枚）
          </label>
          <div className="space-y-4">
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              disabled={selectedImages.length >= 5}
            />

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`プレビュー ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors duration-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            作業・実施日時
          </label>
          <Input
            name="work_date"
            placeholder="例: 11月29日(土)、30(日)、毎週土日など"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            参加・応募条件
          </label>
          <Textarea
            name="requirements"
            rows={3}
            placeholder="例: 軍手・作業着持参、普通免許必要、年齢制限なし"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            条件・注意事項
          </label>
          <Textarea
            name="conditions"
            rows={3}
            placeholder="例: 雨天中止、道具は貸与、飲み物持参など"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            タグ（複数可、カンマ区切り）
          </label>
          <Input
            name="tags"
            placeholder="例: #八丈島, #農業体験, #レモン"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 flex items-center gap-2">
            <input
              type="checkbox"
              name="age_friendly"
              className="rounded border-gray-300"
            />
            年少者（高校生・中学生等）参加可能
          </label>
        </div>

        {/* TODO: 広告フラグ（仮実装・現在未対応）
            データベースに is_ad カラムを追加するまで機能しません
            現在はデモ用にフロント表示のみ */}
        <div className="border border-yellow-300 bg-yellow-50 p-4 rounded-lg">
          <label className="text-sm font-medium mb-2 flex items-center gap-2 text-gray-500">
            <input
              type="checkbox"
              name="is_ad"
              className="rounded border-gray-300"
              disabled
            />
            <span className="flex items-center gap-2">
              広告として投稿
              <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">
                仮実装・未対応
              </span>
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            ※現在この機能は実装されていません。データベース対応後に有効化されます。
          </p>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            連絡先
          </label>
          <Input
            name="contact"
            required
            placeholder="電話番号またはメールアドレス"
          />
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            {loading ? '投稿中...' : '投稿する'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/')}
          >
            キャンセル
          </Button>
        </div>
      </form>
    </Card>
  )
}