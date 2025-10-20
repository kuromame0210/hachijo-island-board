'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useLocation } from '@/hooks/useLocation'
import { useLocationAccess } from '@/hooks/useLocationAccess'
import { getCategoriesForForm } from '@/lib/categories'
import GoogleMapEmbed from '@/components/GoogleMapEmbed'

export default function NewPost() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const { locationResult, hasAskedPermission } = useLocation()
  const { canPost, isCurrentlyInIsland, hasRecentIslandAccess, lastIslandAccess } = useLocationAccess()

  // 八丈島の地区
  const districts = [
    { id: 'okago', label: '大賀郷', kana: 'おおかごう' },
    { id: 'mitsune', label: '三根', kana: 'みつね' },
    { id: 'kashitate', label: '樫立', kana: 'かしたて' },
    { id: 'nakanogo', label: '中之郷', kana: 'なかのごう' },
    { id: 'sueyoshi', label: '末吉', kana: 'すえよし' }
  ]

  // フォーム状態
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: '',
    description: '',
    reward_type: '',
    reward_details: '',
    work_date: '',
    requirements: '',
    conditions: '',
    name: '',
    phone: '',
    email: '',
    district: '',
    location_detail: '',
    map_link: '',
    iframe_embed: '',
    tags: '',
    age_friendly: false
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
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${image.name.split('.').pop()}`
      
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

      // タグの処理（カンマ区切りの文字列を配列に変換）
      const tagsArray = formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []

      // 連絡先をフォーマット
      const contactText = formData.email
        ? `氏名: ${formData.name}\n電話: ${formData.phone}\nメール: ${formData.email}`
        : `氏名: ${formData.name}\n電話: ${formData.phone}`

      // 投稿を作成
      const { error } = await supabase.from('hachijo_post_board').insert({
        title: formData.title,
        description: formData.description,
        category: formData.category || 'other',
        price: formData.price ? Number(formData.price) : null,
        contact: contactText,
        images: imageUrls,
        image_url: imageUrls.length > 0 ? imageUrls[0] : null,
        status: 'active',  // 新規投稿はactiveステータス
        // 新フィールド
        reward_type: formData.reward_type || null,
        reward_details: formData.reward_details || null,
        work_date: formData.work_date || null,
        requirements: formData.requirements || null,
        conditions: formData.conditions || null,
        map_link: formData.map_link || null,
        iframe_embed: formData.iframe_embed || null,
        tags: tagsArray,
        age_friendly: formData.age_friendly
      })

      if (error) throw error

      alert('投稿が作成されました！')
      router.push('/')
    } catch (error) {
      console.error('Error:', error)
      alert('投稿の作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // 投稿・編集権限をチェック（現在島内、または2週間以内に島内アクセス記録があること）
  if (!hasAskedPermission || locationResult.status !== 'success' || !canPost) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">投稿制限</h2>
          <div className="space-y-4 text-left">
            <p className="text-lg">投稿機能は以下の条件を満たす方のみご利用いただけます：</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>現在八丈島内にいる</li>
              <li>または、過去2週間以内に八丈島内からアクセスした記録がある</li>
            </ul>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">現在の状況：</h3>
              <ul className="space-y-1 text-sm">
                <li>現在の位置: {isCurrentlyInIsland ? '八丈島内' : '島外'}</li>
                <li>過去2週間の島内アクセス: {hasRecentIslandAccess ? 'あり' : 'なし'}</li>
                {lastIslandAccess && (
                  <li>最終島内アクセス: {new Date(lastIslandAccess).toLocaleDateString('ja-JP')}</li>
                )}
              </ul>
            </div>
            
            <p className="text-sm text-gray-600">
              掲示板の閲覧は島外からでも可能です。<br/>
              投稿をご希望の方は八丈島にお越しの際にお試しください。
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* メインコンテンツ */}
      <div className="lg:col-span-3">
        <Card>
          <form onSubmit={handleSubmit} className="p-8">
            
            {/* ヘッダー部分 */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    カテゴリー
                  </label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="カテゴリーを選択（任意）" />
                    </SelectTrigger>
                    <SelectContent>
                      {getCategoriesForForm().map((category) => (
                        <SelectItem key={category.key} value={category.key}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-gray-500">
                  新規投稿
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  タイトル <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                  placeholder="投稿のタイトルを入力してください"
                  className="text-2xl font-bold border-none px-0 py-2 focus:ring-0"
                  style={{ fontSize: '2rem', lineHeight: '2.5rem' }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  価格（円）
                </label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({...prev, price: e.target.value}))}
                  placeholder="価格を入力（任意）"
                  className="text-2xl font-bold text-emerald-600 border-none px-0 py-2 focus:ring-0"
                />
              </div>
            </div>

            {/* 画像アップロード */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                画像（最大5枚）
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
                        alt={`プレビュー ${selectedImageIndex + 1}`}
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

            {/* 説明文 */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                説明 <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                placeholder="投稿の詳細な説明を入力してください"
                rows={6}
                className="resize-none"
                required
              />
            </div>

            {/* 詳細情報 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

              {/* 実施日時 */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-4">実施日時</h4>
                <Input
                  value={formData.work_date}
                  onChange={(e) => setFormData(prev => ({...prev, work_date: e.target.value}))}
                  placeholder="例: 11月29日(土)、30(日)、毎週土日など"
                />
              </div>

              {/* 参加・応募条件 */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-4">参加・応募条件</h4>
                <Textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData(prev => ({...prev, requirements: e.target.value}))}
                  placeholder="例: 軍手・作業着持参、普通免許必要、年齢制限なし"
                  rows={3}
                />
              </div>

              {/* 条件・注意事項 */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-4">条件・注意事項</h4>
                <Textarea
                  value={formData.conditions}
                  onChange={(e) => setFormData(prev => ({...prev, conditions: e.target.value}))}
                  placeholder="例: 雨天中止、道具は貸与、飲み物持参など"
                  rows={3}
                />
              </div>
            </div>

            {/* 場所情報 */}
            <div className="border-t border-gray-300 pt-6 mb-8">
              <h3 className="text-sm font-medium text-gray-700 mb-4">場所情報（任意）</h3>

              {/* 地区選択 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  地区
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {districts.map((district) => (
                    <button
                      key={district.id}
                      type="button"
                      onClick={() => setFormData(prev => ({...prev, district: district.label}))}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        formData.district === district.label
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="font-bold text-base">{district.label}</div>
                      <div className="text-xs text-gray-600">{district.kana}</div>
                    </button>
                  ))}
                </div>
                {formData.district && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({...prev, district: ''}))}
                    className="mt-2 text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    選択を解除
                  </button>
                )}
              </div>

              {/* 詳細な場所 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  詳細な場所
                </label>
                <Input
                  value={formData.location_detail}
                  onChange={(e) => setFormData(prev => ({...prev, location_detail: e.target.value}))}
                  placeholder="例：○○商店の近く、○○公園付近など"
                />
              </div>

              {/* 地図情報 */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">地図リンク（任意）</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Google マップリンク
                    </label>
                    <Input
                      value={formData.map_link}
                      onChange={(e) => setFormData(prev => ({...prev, map_link: e.target.value}))}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      iframe埋め込みコード
                    </label>
                    <Textarea
                      value={formData.iframe_embed}
                      onChange={(e) => setFormData(prev => ({...prev, iframe_embed: e.target.value}))}
                      placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>'
                      rows={4}
                    />
                  </div>
                </div>

                {/* プレビュー */}
                {(formData.map_link || formData.iframe_embed) && (
                  <div className="mt-4">
                    <GoogleMapEmbed
                      mapLink={formData.map_link}
                      iframeEmbed={formData.iframe_embed}
                      title="投稿の場所"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* タグ */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                タグ
              </label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({...prev, tags: e.target.value}))}
                placeholder="カンマ区切りでタグを入力（例: 農業, 体験, 初心者歓迎）"
              />
            </div>

            {/* 年少者参加可能 */}
            <div className="mb-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.age_friendly}
                  onChange={(e) => setFormData(prev => ({...prev, age_friendly: e.target.checked}))}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  年少者（高校生・中学生等）参加可能
                </span>
              </label>
            </div>

            {/* 連絡先情報 */}
            <div className="border-t border-gray-300 pt-6 mb-8">
              <h3 className="text-sm font-medium text-gray-700 mb-4">連絡先情報</h3>

              {/* 氏名 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  氏名 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  placeholder="例: 田中太郎"
                  className="bg-blue-50 border-blue-200"
                  required
                />
              </div>

              {/* 電話番号 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  電話番号 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                  placeholder="090-1234-5678"
                  className="bg-blue-50 border-blue-200 font-mono"
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
                  className="bg-blue-50 border-blue-200 font-mono"
                />
              </div>
            </div>

            {/* 必須項目の注釈 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-yellow-800 mb-2">必須項目</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• タイトル</li>
                <li>• 説明</li>
                <li>• 氏名</li>
                <li>• 電話番号</li>
              </ul>
              <p className="text-xs text-yellow-600 mt-2">※ カテゴリーは任意です（未選択時は「その他」になります）</p>
            </div>

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
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? '投稿中...' : '投稿する'}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* サイドバー */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="p-4">
          <h3 className="font-semibold text-gray-800 mb-3">投稿のヒント</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• 明確で分かりやすいタイトルをつけましょう</li>
            <li>• 詳細な説明で相手に魅力を伝えましょう</li>
            <li>• 画像があると注目されやすくなります</li>
            <li>• 連絡先は正確に入力してください</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}