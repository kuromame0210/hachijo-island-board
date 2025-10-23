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
import { compressMultipleImages } from '@/lib/imageCompression'

export default function NewDisasterPost() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [compressing, setCompressing] = useState(false)
  const [compressionError, setCompressionError] = useState<string | null>(null)
  const [compressionProgress, setCompressionProgress] = useState<{ completed: number; total: number } | null>(null)
  const { locationResult, hasAskedPermission } = useLocation()
  const { canPost, isCurrentlyInIsland, hasRecentIslandAccess, lastIslandAccess } = useLocationAccess()

  // 支援カテゴリの選択肢（あすなろのお手伝い内容に準拠）
  const supportCategories = [
    { id: 'water_supply', label: '飲料水・生活用水の運搬' },
    { id: 'cleaning', label: 'ご自宅の掃除、片付け' },
    { id: 'furniture_disposal', label: '家具、ゴミ出しの搬出' },
    { id: 'other', label: 'その他' }
  ]

  // 八丈島の地区
  const districts = [
    { id: 'okago', label: '大賀郷', kana: 'おおかごう' },
    { id: 'mitsune', label: '三根', kana: 'みつね' },
    { id: 'kashitate', label: '樫立', kana: 'かしたて' },
    { id: 'nakanogo', label: '中之郷', kana: 'なかのごう' },
    { id: 'sueyoshi', label: '末吉', kana: 'すえよし' }
  ]

  // フォーム状態（シンプル化）
  const [formData, setFormData] = useState({
    supportCategory: '',    // 支援カテゴリ
    description: '',       // リクエスト内容詳細
    district: '',          // 地区
    location_detail: '',   // 詳細な場所
    name: '',             // 氏名
    phone: '',            // 電話番号
    email: '',            // メールアドレス
    hasProxy: false,      // 代理人がいるかどうか
    proxyName: '',        // 代理人氏名
    proxyPhone: '',       // 代理人電話番号
    proxyAddress: '',     // 代理人住所
    images: [] as string[] // 被害状況の画像
  })

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newImages = files.slice(0, 5 - selectedImages.length)

    if (selectedImages.length + newImages.length > 5) {
      alert('画像は最大5枚まで選択できます')
      return
    }

    if (newImages.length === 0) return

    setCompressing(true)
    setCompressionError(null)
    setCompressionProgress({ completed: 0, total: newImages.length })

    try {
      // 画像を圧縮　被害状況のデータのため、より高品質で保存
      const compressedFiles = await compressMultipleImages(
        newImages,
        {
          maxSizeMB: 1.5,  // 被害状況は重要なので少し大きめ
          maxWidthOrHeight: 2048,  // 高画質で保存
          useWebWorker: true,
          preserveExif: false
        },
        (completed, total) => {
          setCompressionProgress({ completed, total })
        }
      )

      setSelectedImages(prev => [...prev, ...compressedFiles])

      // 圧縮後の画像でプレビューを作成
      compressedFiles.forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          setImagePreviews(prev => [...prev, e.target?.result as string])
        }
        reader.readAsDataURL(file)
      })
    } catch (error) {
      console.error('画像圧縮エラー:', error)
      setCompressionError(error instanceof Error ? error.message : '画像の圧縮に失敗しました')
    } finally {
      setCompressing(false)
      setCompressionProgress(null)
    }
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

    // 地区選択のバリデーション
    if (!formData.district) {
      alert('地区を選択してください')
      return
    }

    setLoading(true)

    try {
      // 画像をアップロード
      const imageUrls = await uploadImages()

      // 選択されたカテゴリのラベルを取得してタイトルとして使用
      const selectedCategory = supportCategories.find(cat => cat.id === formData.supportCategory)
      const finalTitle = selectedCategory ? selectedCategory.label : '支援要請'

      // 連絡先をフォーマット
      let contactText = ''

      if (formData.hasProxy) {
        // 代理人による投稿の場合
        contactText = `【代理人情報】
氏名: ${formData.proxyName}
電話: ${formData.proxyPhone}
住所: ${formData.proxyAddress}`
      } else {
        // 本人による投稿の場合
        contactText = formData.email
          ? `氏名: ${formData.name}\n電話: ${formData.phone}\nメール: ${formData.email}`
          : `氏名: ${formData.name}\n電話: ${formData.phone}`
      }

      // 場所情報をフォーマット
      const locationText = formData.location_detail
        ? `【場所】${formData.district} - ${formData.location_detail}\n\n${formData.description}`
        : `【場所】${formData.district}\n\n${formData.description}`

      // 投稿データを準備
      const postData = {
        title: finalTitle,
        description: locationText,
        category: 'other', // 一時的にotherカテゴリを使用（DBの制約更新後にdisaster_supportに変更）
        contact: contactText,
        image_url: imageUrls.length > 0 ? imageUrls[0] : null,
        images: imageUrls,
        status: 'active',
        price: null, // 災害支援は無償
        reward_type: 'free', // 無償・体験
        reward_details: null,
        work_date: null,
        requirements: null,
        conditions: null,
        age_friendly: false,
        map_link: null,
        iframe_embed: null,
        // 災害支援投稿の識別は選択されたカテゴリをタグに保存
        tags: [formData.supportCategory]
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
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-blue-800">台風22号・23号による被害について</h3>
                <div className="group relative inline-block">
                  <span className="text-blue-600 cursor-help text-lg">ℹ️</span>
                  <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute z-10 w-80 p-4 bg-white border-2 border-blue-300 rounded-lg shadow-xl left-1/2 -translate-x-1/2 top-8">
                    <div className="text-sm text-blue-700 mb-3 text-left">
                      台風22/23号の影響により、八丈島は大きな被害を受けました。
                      社協ではボランティアを募集していますが、具体的な支援ニーズを把握するため、
                      この機能を通じて必要な支援内容をお知らせください。
                    </div>
                    <div className="text-sm text-blue-700 text-left">
                      <strong>例：</strong>水が欲しい、がれきを捨ててほしい、屋根の修理が必要など<br/>
                      社協ボランティアチームが情報を確認し、対応いたします。
                    </div>
                    {/* 三角形の矢印 */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l-2 border-t-2 border-blue-300 transform rotate-45"></div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-blue-700">
                🔒 連絡先は一般公開されません。社協ボランティアチーム（管理者）のみが閲覧します。
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

          {/* 地区選択 */}
          <div className="mb-8">
            <label className="block text-lg font-medium text-gray-800 mb-4">
              地区を選択してください <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {districts.map((district) => (
                <button
                  key={district.id}
                  type="button"
                  onClick={() => setFormData(prev => ({...prev, district: district.label}))}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.district === district.label
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="font-bold text-lg">{district.label}</div>
                  <div className="text-sm text-gray-600">{district.kana}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 詳細な場所 */}
          <div className="mb-8">
            <label className="block text-lg font-medium text-gray-800 mb-3">
              番地or目印になるもの <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.location_detail}
              onChange={(e) => setFormData(prev => ({...prev, location_detail: e.target.value}))}
              placeholder="例：○○商店の近く、○○公園付近、○○番地など"
              className="text-lg"
              required
            />
            <p className="text-sm text-gray-500 mt-2">※ 正確な支援を行うため、番地や目印となる建物・場所を必ずご入力ください</p>
          </div>

          {/* 画像アップロード */}
          <div className="mb-8">
            <label className="block text-lg font-medium text-gray-800 mb-3">
              状況の画像（最大5枚）
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
                  disabled={compressing}
                />
              ) : (
                /* 画像がある場合：追加ボタン */
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {selectedImages.length}/5枚選択済み
                  </span>
                  {selectedImages.length < 5 && !compressing && (
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

              {/* 圧縮中の表示 */}
              {compressing && (
                <div className="text-center py-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-orange-600 font-medium mb-2">📸 画像を圧縮中...</div>
                  {compressionProgress && (
                    <div className="text-sm text-orange-600">
                      {compressionProgress.completed}/{compressionProgress.total}枚完了
                    </div>
                  )}
                </div>
              )}

              {/* エラー表示 */}
              {compressionError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                  ❌ {compressionError}
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

          {/* 連絡先情報 */}
          <div className="border-t border-gray-300 pt-8 mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-3">連絡先情報</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-green-700 font-medium">
                🔒 プライバシー保護：連絡先は一般公開されません<br/>
                社協ボランティアチーム（管理者）のみが閲覧し、直接ご連絡いたします
              </p>
            </div>

            {/* 投稿者選択 */}
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="posterSelf"
                  name="posterType"
                  checked={!formData.hasProxy}
                  onChange={() => setFormData(prev => ({...prev, hasProxy: false}))}
                  className="w-5 h-5 text-blue-600"
                />
                <label htmlFor="posterSelf" className="ml-2 text-base font-medium text-gray-800">
                  👤 本人が投稿
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="posterProxy"
                  name="posterType"
                  checked={formData.hasProxy}
                  onChange={() => setFormData(prev => ({...prev, hasProxy: true}))}
                  className="w-5 h-5 text-purple-600"
                />
                <label htmlFor="posterProxy" className="ml-2 text-base font-medium text-gray-800">
                  📝 代理人が投稿
                </label>
              </div>
            </div>

            {!formData.hasProxy ? (
              /* 本人情報 */
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
                {/* 氏名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    氏名 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                    placeholder="例: 田中太郎"
                    className="bg-blue-50 border-blue-200 text-lg"
                    required
                  />
                </div>

                {/* 電話番号 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    電話番号 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                    placeholder="090-1234-5678"
                    className="bg-blue-50 border-blue-200 font-mono text-lg"
                    required
                  />
                </div>

                {/* メールアドレス */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス（任意）
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                    placeholder="example@example.com"
                    className="bg-blue-50 border-blue-200 font-mono text-lg"
                  />
                </div>
              </div>
            ) : (
              /* 代理人情報 */
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 space-y-4">
                <p className="text-sm text-purple-700 font-medium mb-4">
                  ℹ️ 本人に代わって投稿する場合は、代理人の情報を入力してください
                </p>

                {/* 代理人氏名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    代理人氏名 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.proxyName}
                    onChange={(e) => setFormData(prev => ({...prev, proxyName: e.target.value}))}
                    placeholder="例: 山田花子"
                    className="bg-purple-50 border-purple-200 text-lg"
                    required
                  />
                </div>

                {/* 代理人電話番号 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    代理人電話番号 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    value={formData.proxyPhone}
                    onChange={(e) => setFormData(prev => ({...prev, proxyPhone: e.target.value}))}
                    placeholder="080-9876-5432"
                    className="bg-purple-50 border-purple-200 font-mono text-lg"
                    required
                  />
                </div>

                {/* 代理人住所 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    代理人住所 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.proxyAddress}
                    onChange={(e) => setFormData(prev => ({...prev, proxyAddress: e.target.value}))}
                    placeholder="例: 八丈町三根123-4"
                    className="bg-purple-50 border-purple-200 text-lg"
                    required
                  />
                </div>
              </div>
            )}
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