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
  const [showAdvanced, setShowAdvanced] = useState(false)
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

      // カテゴリのデフォルト値設定
      const category = formData.get('category') || '未設定'

      // 投稿を作成（新フィールド対応）
      const { error } = await supabase.from('hachijo_post_board').insert({
        title: formData.get('title'),
        description: formData.get('description'),
        category: category,
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
        age_friendly: formData.get('age_friendly') === 'on',
        map_link: formData.get('map_link'),
        iframe_embed: formData.get('iframe_embed')
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
    <div className="max-w-2xl mx-auto">
      <Card className="hidden sm:block">
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">新規投稿</h1>
          <p className="text-base text-gray-600">
            <span className="text-red-600 font-bold">※</span> は必須項目です
          </p>
        </div>

        {/* 1. 画像 - 最優先 */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <label className="text-xl font-bold mb-3 block">
            写真を載せましょう（最大5枚）
          </label>
          <div className="space-y-4">
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              disabled={selectedImages.length >= 5}
              className="text-lg"
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
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-red-600 transition-colors duration-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2. 報酬・メリット */}
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <label className="text-xl font-bold mb-3 block">
            いくらですか？何がもらえますか？
            <span className="text-red-600 text-xl">※</span>
          </label>
          <p className="text-base text-gray-600 mb-4">例: 時給1000円、野菜お裾分け、無料</p>

          <div className="space-y-4">
            <div>
              <label className="text-lg font-medium mb-2 block">
                報酬の種類 <span className="text-red-600">※</span>
              </label>
              <Select name="reward_type" required>
                <SelectTrigger className="text-lg">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="money">金銭報酬</SelectItem>
                  <SelectItem value="non_money">非金銭報酬（物品・サービス）</SelectItem>
                  <SelectItem value="both">金銭+現物</SelectItem>
                  <SelectItem value="free">無償・体験</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-lg font-medium mb-2 block">
                報酬の詳細
              </label>
              <Textarea
                name="reward_details"
                rows={3}
                placeholder="例: 時給1000円、収穫物のお裾分け、入場無料"
                className="text-lg"
              />
            </div>

            <div>
              <label className="text-lg font-medium mb-2 block">
                金額（円）
              </label>
              <Input
                name="price"
                type="number"
                placeholder="金銭報酬がある場合のみ"
                className="text-lg"
              />
            </div>
          </div>
        </div>

        {/* 3. タイトル */}
        <div>
          <label className="text-xl font-bold mb-3 block">
            タイトルを付けましょう
            <span className="text-red-600 text-xl">※</span>
          </label>
          <p className="text-base text-gray-600 mb-3">例: レモン収穫手伝い募集、冷蔵庫あげます</p>
          <Input
            name="title"
            required
            placeholder="例: レモン収穫手伝い募集"
            className="text-lg py-6"
          />
        </div>

        {/* 4. 詳細説明 */}
        <div>
          <label className="text-xl font-bold mb-3 block">
            詳しく教えてください
            <span className="text-red-600 text-xl">※</span>
          </label>
          <p className="text-base text-gray-600 mb-3">「いつ」「どこで」「何が必要」など、応募者が知りたいことを書いてください</p>
          <Textarea
            name="description"
            required
            rows={8}
            placeholder={"例：\n・日時：11月29日(土) 9:00-15:00\n・場所：八丈町大賀郷のレモン畑\n・内容：レモンの収穫作業\n・持ち物：軍手、作業着、飲み物\n・その他：雨天中止、お昼ご飯付き"}
            className="text-lg"
          />
        </div>

        {/* 5. 連絡先 */}
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <label className="text-xl font-bold mb-3 block">
            連絡先を忘れずに！
            <span className="text-red-600 text-xl">※</span>
          </label>
          <Input
            name="contact"
            required
            placeholder="電話番号またはメールアドレス"
            className="text-lg py-6"
          />
        </div>

        {/* 6. カテゴリ */}
        <div>
          <label className="text-xl font-bold mb-3 block">
            カテゴリを選んでください
          </label>
          <p className="text-base text-gray-600 mb-3">未選択の場合は「未設定」になります</p>
          {/* カテゴリー選択肢を変更したい場合は CATEGORY_MANAGEMENT.md を参照 */}
          <Select name="category">
            <SelectTrigger className="text-lg py-6">
              <SelectValue placeholder="未設定" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="不動産">不動産</SelectItem>
              <SelectItem value="仕事">仕事</SelectItem>
              <SelectItem value="不用品">不用品</SelectItem>
              <SelectItem value="農業">農業</SelectItem>
              <SelectItem value="イベント">イベント</SelectItem>
              <SelectItem value="ボランティア">ボランティア</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 詳細設定（折りたたみ） */}
        <div className="border-t pt-6">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between text-left text-xl font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 p-4 rounded-lg transition-all duration-200 border border-gray-300"
          >
            <span>
              詳細設定（任意）
            </span>
            <span className="text-xl">{showAdvanced ? '▼' : '▶'}</span>
          </button>

          {showAdvanced && (
            <div className="mt-6 space-y-6 pl-4">
              <div>
                <label className="text-lg font-medium mb-2 block">
                  作業・実施日時
                </label>
                <Input
                  name="work_date"
                  placeholder="例: 11月29日(土)、30(日)、毎週土日など"
                  className="text-lg"
                />
              </div>

              <div>
                <label className="text-lg font-medium mb-2 block">
                  参加・応募条件
                </label>
                <Textarea
                  name="requirements"
                  rows={3}
                  placeholder="例: 軍手・作業着持参、普通免許必要、年齢制限なし"
                  className="text-lg"
                />
              </div>

              <div>
                <label className="text-lg font-medium mb-2 block">
                  条件・注意事項
                </label>
                <Textarea
                  name="conditions"
                  rows={3}
                  placeholder="例: 雨天中止、道具は貸与、飲み物持参など"
                  className="text-lg"
                />
              </div>

              <div>
                <label className="text-lg font-medium mb-2 block">
                  タグ（複数可、カンマ区切り）
                </label>
                <Input
                  name="tags"
                  placeholder="例: #八丈島, #農業体験, #レモン"
                  className="text-lg"
                />
              </div>

              <div>
                <label className="text-lg font-medium mb-2 block text-green-700">
                  📍 地図埋め込み（推奨）
                </label>
                <Textarea
                  name="iframe_embed"
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

              <div>
                <label className="text-lg font-medium mb-2 block text-gray-600">
                  🔗 場所（Googleマップリンク）
                </label>
                <Input
                  name="map_link"
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

              <div>
                <label className="text-lg font-medium mb-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="age_friendly"
                    className="w-5 h-5 rounded border-gray-300"
                  />
                  年少者（高校生・中学生等）参加可能
                </label>
              </div>

              {/* TODO: 広告フラグ（仮実装・現在未対応） */}
              <div className="border border-yellow-300 bg-yellow-50 p-4 rounded-lg">
                <label className="text-base font-medium mb-2 flex items-center gap-2 text-gray-500">
                  <input
                    type="checkbox"
                    name="is_ad"
                    className="w-5 h-5 rounded border-gray-300"
                    disabled
                  />
                  <span className="flex items-center gap-2">
                    広告として投稿
                    <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">
                      仮実装・未対応
                    </span>
                  </span>
                </label>
                <p className="text-sm text-gray-500 mt-1 ml-7">
                  ※現在この機能は実装されていません。データベース対応後に有効化されます。
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-lg py-6"
          >
            {loading ? '投稿中...' : '投稿する'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/')}
            className="text-base py-6 sm:w-32"
          >
            キャンセル
          </Button>
        </div>
        </form>
      </Card>
      <div className="sm:hidden p-4">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">新規投稿</h1>
            <p className="text-base text-gray-600">
              <span className="text-red-600 font-bold">※</span> は必須項目です
            </p>
          </div>

          {/* 1. 画像 - 最優先 */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <label className="text-xl font-bold mb-3 block">
              写真を載せましょう（最大5枚）
            </label>
            <div className="space-y-4">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                disabled={selectedImages.length >= 5}
                className="text-lg"
              />

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
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
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-red-600 transition-colors duration-200"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 2. 報酬・メリット */}
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <label className="text-xl font-bold mb-3 block">
              いくらですか？何がもらえますか？
              <span className="text-red-600 text-xl">※</span>
            </label>
            <p className="text-base text-gray-600 mb-4">例: 時給1000円、野菜お裾分け、無料</p>

            <div className="space-y-4">
              <div>
                <label className="text-lg font-medium mb-2 block">
                  報酬の種類 <span className="text-red-600">※</span>
                </label>
                <Select name="reward_type" required>
                  <SelectTrigger className="text-lg">
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="money">金銭報酬</SelectItem>
                    <SelectItem value="non_money">非金銭報酬（物品・サービス）</SelectItem>
                    <SelectItem value="both">金銭+現物</SelectItem>
                    <SelectItem value="free">無償・体験</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-lg font-medium mb-2 block">
                  報酬の詳細
                </label>
                <Textarea
                  name="reward_details"
                  rows={3}
                  placeholder="例: 時給1000円、収穫物のお裾分け、入場無料"
                  className="text-lg"
                />
              </div>

              <div>
                <label className="text-lg font-medium mb-2 block">
                  金額（円）
                </label>
                <Input
                  name="price"
                  type="number"
                  placeholder="金銭報酬がある場合のみ"
                  className="text-lg"
                />
              </div>
            </div>
          </div>

          {/* 3. タイトル */}
          <div>
            <label className="text-xl font-bold mb-3 block">
              タイトルを付けましょう
              <span className="text-red-600 text-xl">※</span>
            </label>
            <p className="text-base text-gray-600 mb-3">例: レモン収穫手伝い募集、冷蔵庫あげます</p>
            <Input
              name="title"
              required
              placeholder="例: レモン収穫手伝い募集"
              className="text-lg py-6"
            />
          </div>

          {/* 4. 詳細説明 */}
          <div>
            <label className="text-xl font-bold mb-3 block">
              詳しく教えてください
              <span className="text-red-600 text-xl">※</span>
            </label>
            <p className="text-base text-gray-600 mb-3">「いつ」「どこで」「何が必要」など、応募者が知りたいことを書いてください</p>
            <Textarea
              name="description"
              required
              rows={8}
              placeholder={"例：\n・日時：11月29日(土) 9:00-15:00\n・場所：八丈町大賀郷のレモン畑\n・内容：レモンの収穫作業\n・持ち物：軍手、作業着、飲み物\n・その他：雨天中止、お昼ご飯付き"}
              className="text-lg"
            />
          </div>

          {/* 5. 連絡先 */}
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <label className="text-xl font-bold mb-3 block">
              連絡先を忘れずに！
              <span className="text-red-600 text-xl">※</span>
            </label>
            <Input
              name="contact"
              required
              placeholder="電話番号またはメールアドレス"
              className="text-lg py-6"
            />
          </div>

          {/* 6. カテゴリ */}
          <div>
            <label className="text-xl font-bold mb-3 block">
              カテゴリを選んでください
            </label>
            <p className="text-base text-gray-600 mb-3">未選択の場合は「未設定」になります</p>
            <Select name="category">
              <SelectTrigger className="text-lg py-6">
                <SelectValue placeholder="未設定" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="不動産">不動産</SelectItem>
                <SelectItem value="仕事">仕事</SelectItem>
                <SelectItem value="不用品">不用品</SelectItem>
                <SelectItem value="農業">農業</SelectItem>
                <SelectItem value="イベント">イベント</SelectItem>
                <SelectItem value="ボランティア">ボランティア</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 詳細設定（折りたたみ） */}
          <div className="border-t pt-6">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between text-left text-xl font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 p-4 rounded-lg transition-all duration-200 border border-gray-300"
            >
              <span>
                詳細設定（任意）
              </span>
              <span className="text-xl">{showAdvanced ? '▼' : '▶'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-6 space-y-6 pl-4">
                <div>
                  <label className="text-lg font-medium mb-2 block">
                    作業・実施日時
                  </label>
                  <Input
                    name="work_date"
                    placeholder="例: 11月29日(土)、30(日)、毎週土日など"
                    className="text-lg"
                  />
                </div>

                <div>
                  <label className="text-lg font-medium mb-2 block">
                    参加・応募条件
                  </label>
                  <Textarea
                    name="requirements"
                    rows={3}
                    placeholder="例: 軍手・作業着持参、普通免許必要、年齢制限なし"
                    className="text-lg"
                  />
                </div>

                <div>
                  <label className="text-lg font-medium mb-2 block">
                    条件・注意事項
                  </label>
                  <Textarea
                    name="conditions"
                    rows={3}
                    placeholder="例: 雨天中止、道具は貸与、飲み物持参など"
                    className="text-lg"
                  />
                </div>

                <div>
                  <label className="text-lg font-medium mb-2 block">
                    タグ（複数可、カンマ区切り）
                  </label>
                  <Input
                    name="tags"
                    placeholder="例: #八丈島, #農業体験, #レモン"
                    className="text-lg"
                  />
                </div>

                <div>
                  <label className="text-lg font-medium mb-2 block">
                    場所（Googleマップリンク）
                  </label>
                  <Input
                    name="map_link"
                    placeholder="https://maps.app.goo.gl/... または https://www.google.com/maps/..."
                    className="text-lg"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    ※Googleマップで場所を検索→共有→リンクをコピーして貼り付けてください
                  </p>
                </div>

                <div>
                  <label className="text-lg font-medium mb-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="age_friendly"
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    年少者（高校生・中学生等）参加可能
                  </label>
                </div>

                {/* TODO: 広告フラグ（仮実装・現在未対応） */}
                <div className="border border-yellow-300 bg-yellow-50 p-4 rounded-lg">
                  <label className="text-base font-medium mb-2 flex items-center gap-2 text-gray-500">
                    <input
                      type="checkbox"
                      name="is_ad"
                      className="w-5 h-5 rounded border-gray-300"
                      disabled
                    />
                    <span className="flex items-center gap-2">
                      広告として投稿
                      <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">
                        仮実装・未対応
                      </span>
                    </span>
                  </label>
                  <p className="text-sm text-gray-500 mt-1 ml-7">
                    ※現在この機能は実装されていません。データベース対応後に有効化されます。
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-lg py-6"
            >
              {loading ? '投稿中...' : '投稿する'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/')}
              className="text-base py-6"
            >
              キャンセル
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}