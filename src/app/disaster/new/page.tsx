'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useLocation } from '@/hooks/useLocation'
import { useLocationAccess } from '@/hooks/useLocationAccess'

export default function NewDisasterPost() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const { locationResult, hasAskedPermission } = useLocation()
  const { canPost, isCurrentlyInIsland, hasRecentIslandAccess, lastIslandAccess } = useLocationAccess()

  // 支援カテゴリの選択肢
  const supportCategories = [
    { id: 'tree_removal', label: '倒木を除去してほしい' },
    { id: 'water_supply', label: '水を持ってきて欲しい' },
    { id: 'transportation', label: '移動したい' },
    { id: 'shopping', label: '買い出しをお願いしたい' },
    { id: 'other', label: 'その他' }
  ]

  // フォーム状態（シンプル化）
  const [formData, setFormData] = useState({
    supportCategory: '',    // 支援カテゴリ
    description: '',       // リクエスト内容詳細
    location_detail: '',   // 場所
    contact: '',          // 連絡先
    images: [] as string[] // 被害状況の画像
  })

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
    if (selectedImageIndex >= imagePreviews.length - 1) {
      setSelectedImageIndex(Math.max(0, imagePreviews.length - 2))
    }
  }

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = []
    
    for (const image of selectedImages) {
      const fileName = `disaster-${Date.now()}-${Math.random().toString(36).substring(2)}.${image.name.split('.').pop()}`
      
      const { error } = await supabase.storage
        .from('hachijo-board-posts')
        .upload(fileName, image)

      if (error) {
        console.error('Image upload error:', error)
        throw new Error(`画像のアップロードに失敗しました: ${error.message}`)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('hachijo-board-posts')
        .getPublicUrl(fileName)

      uploadedUrls.push(publicUrl)
    }

    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 画像をアップロード
      const imageUrls = await uploadImages()

      // 選択されたカテゴリのラベルを取得してタイトルとして使用
      const selectedCategory = supportCategories.find(cat => cat.id === formData.supportCategory)
      const finalTitle = selectedCategory ? selectedCategory.label : '支援要請'

      // 投稿データを準備
      const postData = {
        title: finalTitle,
        description: formData.description,
        category: 'other', // 一時的にotherカテゴリを使用（DBの制約更新後にdisaster_supportに変更）
        contact: formData.contact,
        image_url: imageUrls.length > 0 ? imageUrls[0] : null,
        images: imageUrls,
        status: 'active',
        // 災害支援投稿の識別用タグ（選択されたカテゴリも追加）
        tags: ['災害支援', '支援要請', 'プライベート連絡先', formData.supportCategory]
      }

      // 既存テーブルに災害支援要請として保存
      const { error } = await supabase.from('hachijo_post_board').insert(postData)

      if (error) throw error

      alert('支援要請が投稿されました！')
      router.push('/') // ホームページにリダイレクト
    } catch (error: unknown) {
      console.error('Error:', error)
      alert(`投稿の作成に失敗しました: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <form onSubmit={handleSubmit} className="p-8">
          {/* ヘッダー */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-red-600 mb-2">支援リクエスト</h1>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">台風22号・23号による被害について</h3>
              <p className="text-sm text-blue-700 mb-3">
                10月13日の台風23号に続き、八丈島は大きな被害を受けました。
                社協ではボランティアを募集していますが、具体的な支援ニーズを把握するため、
                この機能を通じて必要な支援内容をお知らせください。
              </p>
              <p className="text-sm text-blue-700">
                <strong>例：</strong>水が欲しい、がれきを捨ててほしい、屋根の修理が必要など<br/>
                社協ボランティアチームが情報を確認し、対応いたします。
              </p>
            </div>
          </div>

          {/* 支援カテゴリ選択 */}
          <div className="mb-8">
            <label className="block text-lg font-medium text-gray-800 mb-4">
              支援内容 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {supportCategories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="supportCategory"
                    value={category.id}
                    checked={formData.supportCategory === category.id}
                    onChange={(e) => setFormData(prev => ({...prev, supportCategory: e.target.value}))}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-3"
                    required
                  />
                  <span className="text-base font-medium text-gray-700">{category.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* リクエスト内容詳細 */}
          <div className="mb-8">
            <label className="block text-lg font-medium text-gray-800 mb-3">
              詳細内容 <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
              placeholder={
                formData.supportCategory === 'tree_removal' ? "倒木の場所や規模、緊急度などを詳しく教えてください" :
                formData.supportCategory === 'water_supply' ? "必要な水の量、用途、お届け先などを教えてください" :
                formData.supportCategory === 'transportation' ? "移動したい場所、人数、時間帯などを教えてください" :
                formData.supportCategory === 'shopping' ? "必要な物品、お届け先、緊急度などを教えてください" :
                formData.supportCategory === 'other' ? "具体的な支援内容を詳しく教えてください" :
                "選択した支援内容の詳細を教えてください"
              }
              rows={6}
              className="text-lg"
              required
            />
            {formData.supportCategory && (
              <p className="text-sm text-gray-600 mt-2">
                状況の詳細、緊急度、人数、時間帯など、必要な情報をできるだけ詳しく記入してください
              </p>
            )}
          </div>

          {/* 場所 */}
          <div className="mb-8">
            <label className="block text-lg font-medium text-gray-800 mb-3">
              場所 <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.location_detail}
              onChange={(e) => setFormData(prev => ({...prev, location_detail: e.target.value}))}
              placeholder="例：三根地区、坂上地区○○付近、目印となる建物など"
              className="text-lg"
              required
            />
          </div>

          {/* 画像アップロード */}
          <div className="mb-8">
            <label className="block text-lg font-medium text-gray-800 mb-3">
              被害状況の画像（最大5枚）
            </label>
            
            <div className="space-y-4">
              {/* 画像が0枚の場合：通常のファイル選択 */}
              {selectedImages.length === 0 ? (
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="mb-4"
                />
              ) : (
                /* 画像がある場合：追加ボタン */
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {selectedImages.length}/5枚選択済み
                  </span>
                  {selectedImages.length < 5 && (
                    <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      画像を追加
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              )}

              {imagePreviews.length > 0 && (
                <div>
                  <div className="mb-4">
                    <img
                      src={imagePreviews[selectedImageIndex]}
                      alt={`被害状況 ${selectedImageIndex + 1}`}
                      className="w-full h-80 object-cover rounded-lg"
                    />
                  </div>
                  {imagePreviews.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="flex-shrink-0 relative">
                          <button
                            type="button"
                            onClick={() => setSelectedImageIndex(index)}
                            className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                              selectedImageIndex === index ? 'border-blue-600' : 'border-gray-300'
                            }`}
                          >
                            <img
                              src={preview}
                              alt={`サムネイル ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 連絡先 */}
          <div className="border-t border-gray-300 pt-8 mb-8">
            <label className="block text-lg font-medium text-gray-800 mb-3">
              連絡先 <span className="text-red-500">*</span>
            </label>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-green-700 font-medium">
                🔒 プライバシー保護：連絡先は一般公開されません<br/>
                社協ボランティアチーム（管理者）のみが閲覧し、直接ご連絡いたします
              </p>
            </div>
            <Textarea
              value={formData.contact}
              onChange={(e) => setFormData(prev => ({...prev, contact: e.target.value}))}
              placeholder="電話番号、メールアドレス、SNSアカウントなど"
              className="bg-blue-50 border-blue-200 font-mono text-lg"
              rows={3}
              required
            />
          </div>

          {/* 位置情報の状況表示 */}
          {hasAskedPermission && locationResult.status === 'success' && !canPost && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-red-800 mb-2">投稿制限</h4>
              <p className="text-sm text-red-700 mb-3">
                防災支援要請の投稿は八丈島内からのみ可能です。
              </p>
              <div className="bg-white p-3 rounded border">
                <p className="text-sm">
                  <span className="font-medium">現在の位置:</span> {isCurrentlyInIsland ? '八丈島内' : '島外'}
                </p>
                <p className="text-sm">
                  <span className="font-medium">過去2週間の島内アクセス:</span> {hasRecentIslandAccess ? 'あり' : 'なし'}
                </p>
                {lastIslandAccess && (
                  <p className="text-sm">
                    <span className="font-medium">最終島内アクセス:</span> {new Date(lastIslandAccess).toLocaleDateString('ja-JP')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 送信ボタン */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-blue-50 hover:border-blue-300 h-10 px-4 py-2 w-full sm:w-auto"
            >
              ← キャンセル
            </Link>
            
            <Button
              type="submit"
              disabled={loading || (hasAskedPermission && locationResult.status === 'success' && !canPost)}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '投稿中...' : 
               (hasAskedPermission && locationResult.status === 'success' && !canPost) ? '投稿不可（位置制限）' : 
               '支援要請を投稿'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}