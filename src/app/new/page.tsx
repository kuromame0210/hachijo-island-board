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

      const { data, error } = await supabase.storage
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

      // 投稿を作成（シンプルなSupabase呼び出し）
      const { error } = await supabase.from('hachijo_post_board').insert({
        title: formData.get('title'),
        description: formData.get('description'),
        category: formData.get('category'),
        price: formData.get('price') ? Number(formData.get('price')) : null,
        contact: formData.get('contact'),
        images: imageUrls,
        image_url: imageUrls.length > 0 ? imageUrls[0] : null
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
            価格（円）
          </label>
          <Input
            name="price"
            type="number"
            placeholder="無料の場合は空欄"
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