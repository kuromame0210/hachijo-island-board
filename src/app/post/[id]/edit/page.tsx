'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
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
  const [isDisasterPost, setIsDisasterPost] = useState(false)
  
  // 画像関連のstate
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
  
  const router = useRouter()
  const { locationResult, hasAskedPermission } = useLocation()
  const { canPost } = useLocationAccess()

  // 災害支援投稿かどうかを判定
  const checkIfDisasterPost = (post: Post): boolean => {
    // 災害支援カテゴリのタグで判定
    const disasterCategories = ['tree_removal', 'water_supply', 'transportation', 'shopping', 'other']
    const hasDisasterCategoryTag = post.tags && post.tags.some(tag => disasterCategories.includes(tag))
    
    // タイトルベースの判定（既存の投稿との互換性のため）
    const hasDisasterKeywords = post.title && (
      post.title.includes('倒木を除去してほしい') || 
      post.title.includes('水を持ってきて欲しい') ||
      post.title.includes('移動したい') ||
      post.title.includes('買い出しをお願いしたい') ||
      (post.title.includes('支援') || post.title.includes('災害'))
    )
    
    return Boolean(hasDisasterCategoryTag || hasDisasterKeywords)
  }

  useEffect(() => {
    const fetchPost = async () => {
      const { id } = await params
      console.log('🔍 Edit page loading for post ID:', id)
      console.log('🌍 Location status:', { hasAskedPermission, locationResult, canPost })
      
      // 広告投稿は編集不可
      if (id.startsWith('ad-')) {
        setError('広告投稿は編集できません')
        setLoading(false)
        return
      }
      
      // 管理者権限チェック（編集は管理者のみ）
      const adminAuth = sessionStorage.getItem('admin-auth')
      if (adminAuth !== 'authenticated') {
        setError('編集機能は管理者のみご利用いただけます。管理者としてログインしてください。')
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
        setIsDisasterPost(checkIfDisasterPost(data))
        
        // 既存画像を設定
        const images = data.images && data.images.length > 0 ? data.images : (data.image_url ? [data.image_url] : [])
        setExistingImages(images)
      } catch (error) {
        console.error('投稿取得エラー:', error)
        setError('投稿の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params, router, hasAskedPermission, locationResult.status, canPost])

  // 画像選択処理
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const totalImages = existingImages.length - imagesToDelete.length + selectedImages.length
    const newImages = files.slice(0, 5 - totalImages)

    if (totalImages + newImages.length > 5) {
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

  // 新しい画像の削除
  const removeNewImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
    if (selectedImageIndex >= imagePreviews.length - 1) {
      setSelectedImageIndex(Math.max(0, imagePreviews.length - 2))
    }
  }

  // 既存画像の削除マーク
  const markExistingImageForDeletion = (imageUrl: string) => {
    if (imagesToDelete.includes(imageUrl)) {
      setImagesToDelete(prev => prev.filter(url => url !== imageUrl))
    } else {
      setImagesToDelete(prev => [...prev, imageUrl])
    }
  }

  // 画像のアップロード
  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = []
    
    for (const image of selectedImages) {
      const fileName = `post-${Date.now()}-${Math.random().toString(36).substring(2)}.${image.name.split('.').pop()}`
      
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

  // 不要な画像の削除
  const deleteImages = async (imageUrls: string[]) => {
    for (const imageUrl of imageUrls) {
      try {
        // URLからファイル名を抽出
        const fileName = imageUrl.split('/').pop()
        if (fileName) {
          await supabase.storage
            .from('hachijo-board-posts')
            .remove([fileName])
        }
      } catch (error) {
        console.error('Image deletion error:', error)
        // 削除エラーは致命的ではないので続行
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!post) return

    console.log('🚀 handleSubmit START for post:', post.id)
    console.log('📝 Current post data BEFORE edit:', {
      id: post.id,
      title: post.title,
      description: post.description,
      contact: post.contact,
      category: post.category,
      tags: post.tags
    })
    console.log('📝 Is disaster post:', isDisasterPost)
    console.log('🖼️ Image state:', {
      existingImages: existingImages.length,
      newImages: selectedImages.length,
      toDelete: imagesToDelete.length
    })
    
    setSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const formEntries = Object.fromEntries(formData.entries())
    console.log('📝 Form data from HTML form:', formEntries)

    try {
      // 新しい画像をアップロード
      const newImageUrls = await uploadImages()
      
      // 削除対象でない既存画像を残す
      const remainingImages = existingImages.filter(url => !imagesToDelete.includes(url))
      
      // 最終的な画像リスト
      const finalImages = [...remainingImages, ...newImageUrls]
      
      // 不要な画像を削除
      if (imagesToDelete.length > 0) {
        await deleteImages(imagesToDelete)
      }
      
      let updateData: Record<string, unknown> = {}
      
      if (isDisasterPost) {
        // 災害支援投稿の場合
        const description = formData.get('content')
        const contact = formData.get('contact')
        
        console.log('🔍 DISASTER POST processing:')
        console.log('  - description from form:', description)
        console.log('  - contact from form:', contact)
        
        if (!description || !contact) {
          console.log('❌ Validation failed: missing description or contact')
          setError('内容と連絡先は必須項目です')
          return
        }
        
        updateData = {
          description: description.toString(),
          contact: contact.toString(),
          images: finalImages,
          image_url: finalImages.length > 0 ? finalImages[0] : null,
          updated_at: new Date().toISOString()
        }
        
        console.log('📦 DISASTER POST update data:', updateData)
      } else {
        // 通常投稿の場合
        const title = formData.get('title')
        const description = formData.get('content')
        const category = formData.get('category')
        const contact = formData.get('contact')
        
        if (!title || !description || !category || !contact) {
          setError('タイトル、内容、カテゴリ、連絡先は必須項目です')
          return
        }
        
        updateData = {
          title: title.toString(),
          description: description.toString(),
          category: category.toString(),
          contact: contact.toString(),
          images: finalImages,
          image_url: finalImages.length > 0 ? finalImages[0] : null,
          tags: formData.get('tags')?.toString().split(',').map(tag => tag.trim()).filter(Boolean) || [],
          reward_type: formData.get('reward_type')?.toString() || null,
          reward_details: formData.get('reward_details')?.toString() || null,
          requirements: formData.get('requirements')?.toString() || null,
          age_friendly: formData.get('age_friendly') === 'on',
          map_link: formData.get('map_link')?.toString() || null,
          iframe_embed: formData.get('iframe_embed')?.toString() || null,
          updated_at: new Date().toISOString()
        }
      }
      
      console.log('📤 SENDING TO SUPABASE:')
      console.log('  - Post ID:', post.id)
      console.log('  - Post ID type:', typeof post.id)
      console.log('  - Update data:', JSON.stringify(updateData, null, 2))
      
      // まずレコードが存在するか確認
      console.log('🔍 PRE-CHECK: レコード存在確認...')
      const { data: existCheck, error: existError } = await supabase
        .from('hachijo_post_board')
        .select('id, title, description, contact, status')
        .eq('id', post.id)
      
      console.log('📋 PRE-CHECK結果:')
      console.log('  - Error:', existError)
      console.log('  - Found records:', existCheck)
      console.log('  - Record count:', existCheck?.length)
      
      // 🚨 POLICY TEST: ポリシー制限テスト
      console.log('🔐 POLICY TEST: 権限テスト...')
      
      // テストとして、ポリシーを無視して更新を試す
      const { data: policyTest, error: policyError } = await supabase
        .from('hachijo_post_board')
        .update({ 
          description: 'テスト更新 ' + Date.now(),
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id)
      
      console.log('🔐 POLICY TEST結果:')
      console.log('  - Error details:', policyError)
      console.log('  - Error message:', policyError?.message)
      console.log('  - Error code:', policyError?.code)
      console.log('  - Updated:', policyTest)
      
      // 権限を確認するため、現在のユーザー情報も取得
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log('👤 Current user:', user)
      console.log('👤 User error:', userError)
      
      // 🔍 詳細デバッグ: 更新条件の確認
      console.log('🧪 詳細デバッグ開始...')
      console.log('  - 投稿ID:', post.id)
      console.log('  - 投稿ステータス:', post.status)
      console.log('  - 更新しようとするデータ:', updateData)
      
      // ステップ1: 直接SELECTで対象投稿を確認
      const { data: targetPost, error: targetError } = await supabase
        .from('hachijo_post_board')
        .select('*')
        .eq('id', post.id)
        .eq('status', 'active')
      
      console.log('🎯 対象投稿確認:')
      console.log('  - Error:', targetError)
      console.log('  - Found post:', targetPost)
      console.log('  - Count:', targetPost?.length)
      
      // ステップ2: 最小限のデータで更新テスト
      console.log('🧪 最小限更新テスト...')
      const { data: minimalTest, error: minimalError } = await supabase
        .from('hachijo_post_board')
        .update({ 
          updated_at: new Date().toISOString() 
        })
        .eq('id', post.id)
        .select()
      
      console.log('📝 最小限更新結果:')
      console.log('  - Error:', minimalError)
      console.log('  - Error details:', minimalError ? JSON.stringify(minimalError) : 'none')
      console.log('  - Updated:', minimalTest)
      console.log('  - Count:', minimalTest?.length)
      
      // 元の更新処理（参考用）
      const { data: updateResult, error } = await supabase
        .from('hachijo_post_board')
        .update(updateData)
        .eq('id', post.id)
        .select() // 更新後のデータを取得

      console.log('📨 SUPABASE RESPONSE:')
      console.log('  - Error:', error)
      console.log('  - Updated data returned:', updateResult)

      if (error) {
        console.error('❌ Supabase update error:', error)
        setError(`投稿の更新に失敗しました: ${error.message || JSON.stringify(error)}`)
        return
      }

      console.log('✅ Update successful for post:', post.id)
      
      // 更新後のデータを確認するために再取得
      console.log('🔍 VERIFYING UPDATE - fetching latest data...')
      const { data: verifyData, error: verifyError } = await supabase
        .from('hachijo_post_board')
        .select('*')
        .eq('id', post.id)
        .single()
      
      console.log('📊 VERIFICATION RESULT:')
      console.log('  - Verify error:', verifyError)
      console.log('  - Current data in DB:', verifyData)
      
      console.log('💾 最終確認: データベースの更新状況')
      console.log('  - 更新送信データ:', updateData)
      console.log('  - DB確認結果:', verifyData)
      console.log('  - 更新前データ:', {
        description: post.description,
        contact: post.contact
      })
      console.log('  - 更新後データ:', verifyData ? {
        description: verifyData.description,
        contact: verifyData.contact
      } : 'データなし')
      
      // 実際に更新されたかチェック
      const wasUpdated = verifyData && (
        verifyData.description !== post.description ||
        verifyData.contact !== post.contact
      )
      
      console.log('🔍 更新判定:', wasUpdated ? '成功' : '失敗')
      
      if (wasUpdated) {
        alert('✅ 投稿が正常に更新されました！')
        // 成功時のリダイレクト
        if (typeof window !== 'undefined') {
          window.location.href = `/post/${post.id}?t=${Date.now()}`
        } else {
          router.push(`/post/${post.id}`)
        }
      } else {
        alert('❌ 更新に失敗しました。Supabaseのポリシー設定を確認してください。')
        console.error('❌ 更新失敗: データベースの内容が変更されていません')
        setError('更新に失敗しました。データベースのポリシー設定を確認してください。')
      }
    } catch (error) {
      console.error('更新エラー:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      setError(`投稿の更新に失敗しました: ${errorMessage}`)
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
          <h1 className="text-3xl font-bold text-blue-900 mb-2">🛠️ 管理者編集</h1>
          <p className="text-blue-700">管理者権限で投稿内容を修正できます</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
            <p className="text-sm text-blue-800">
              ✅ 管理者としてログイン中 - 全ての投稿を編集可能
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isDisasterPost ? (
            // 災害支援投稿の編集フォーム
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">🚨 災害支援要請の編集</h3>
              <p className="text-sm text-red-700">
                災害支援投稿ではタイトルとカテゴリは変更できません。内容と連絡先のみ編集可能です。
              </p>
            </div>
          ) : (
            <>
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
            </>
          )}

          {/* 内容 */}
          <div>
            <label className="text-lg font-medium mb-2 block">
              {isDisasterPost ? '詳細内容' : '内容'} <span className="text-red-500">*</span>
            </label>
            <Textarea
              name="content"
              defaultValue={post.description}
              placeholder={
                isDisasterPost 
                  ? "支援が必要な状況の詳細を記入してください..."
                  : "詳しい内容を書いてください..."
              }
              className="text-lg min-h-[200px]"
              required
            />
          </div>

          {/* 連絡先 */}
          <div>
            <label className="text-lg font-medium mb-2 block">
              連絡先 <span className="text-red-500">*</span>
            </label>
            {isDisasterPost && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                <p className="text-sm text-green-700 font-medium">
                  🔒 プライバシー保護：連絡先は一般公開されません<br/>
                  社協ボランティアチーム（管理者）のみが閲覧し、直接ご連絡いたします
                </p>
              </div>
            )}
            <Textarea
              name="contact"
              defaultValue={post.contact}
              placeholder={
                isDisasterPost
                  ? "電話番号、メールアドレス、SNSアカウントなど"
                  : "例：090-1234-5678 または example@email.com"
              }
              className={`text-lg ${isDisasterPost ? 'bg-blue-50 border-blue-200 font-mono' : ''}`}
              rows={isDisasterPost ? 3 : 1}
              required
            />
          </div>

          {/* 画像編集セクション */}
          <div>
            <label className="text-lg font-medium mb-2 block">
              画像（最大5枚）
            </label>
            
            {/* 既存画像 */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">現在の画像</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {existingImages.map((imageUrl, index) => (
                    <div key={index} className="relative">
                      <img
                        src={imageUrl}
                        alt={`既存画像 ${index + 1}`}
                        className={`w-full h-24 object-cover rounded-lg border-2 ${
                          imagesToDelete.includes(imageUrl) 
                            ? 'border-red-500 opacity-50' 
                            : 'border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => markExistingImageForDeletion(imageUrl)}
                        className={`absolute top-1 right-1 w-6 h-6 rounded-full text-white text-sm font-bold ${
                          imagesToDelete.includes(imageUrl)
                            ? 'bg-gray-500 hover:bg-gray-600'
                            : 'bg-red-500 hover:bg-red-600'
                        }`}
                      >
                        {imagesToDelete.includes(imageUrl) ? '↶' : '×'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 新しい画像 */}
            {imagePreviews.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">新しい画像</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`新しい画像 ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-blue-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full text-sm font-bold hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 画像追加ボタン */}
            {existingImages.length - imagesToDelete.length + selectedImages.length < 5 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <label className="cursor-pointer">
                  <div className="text-gray-500 mb-2">
                    📷 画像を追加（残り{5 - (existingImages.length - imagesToDelete.length + selectedImages.length)}枚）
                  </div>
                  <div className="text-sm text-gray-400">
                    クリックまたはドラッグ&ドロップ
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* 通常投稿のみ表示するフィールド */}
          {!isDisasterPost && (
            <>
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
            </>
          )}

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