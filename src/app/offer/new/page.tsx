'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { compressMultipleImages } from '@/lib/imageCompression'
import Link from 'next/link'
import { useLocation } from '@/hooks/useLocation'
import { useLocationAccess } from '@/hooks/useLocationAccess'

export default function NewOfferPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [compressing, setCompressing] = useState(false)
  const [compressionError, setCompressionError] = useState<string | null>(null)
  const [compressionProgress, setCompressionProgress] = useState<{ completed: number; total: number } | null>(null)
  const { locationResult, hasAskedPermission } = useLocation()
  const { canPost, isCurrentlyInIsland, hasRecentIslandAccess, lastIslandAccess } = useLocationAccess()

  // エリア（地区）
  const districts = [
    { id: 'okago', label: '大賀郷' },
    { id: 'mitsune', label: '三根' },
    { id: 'kashitate', label: '樫立' },
    { id: 'nakanogo', label: '中之郷' },
    { id: 'sueyoshi', label: '末吉' }
  ]

  const [form, setForm] = useState({
    offerType: 'goods' as 'goods' | 'service',
    title: '',
    district: '',
    timeWindow: '',
    details: '',
    remarks: '',
    name: '',
    phone: '',
    email: ''
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
      const compressedFiles = await compressMultipleImages(
        newImages,
        { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true, preserveExif: false },
        (completed, total) => setCompressionProgress({ completed, total })
      )
      setSelectedImages(prev => [...prev, ...compressedFiles])
      compressedFiles.forEach(file => {
        const reader = new FileReader()
        reader.onload = (ev) => setImagePreviews(prev => [...prev, ev.target?.result as string])
        reader.readAsDataURL(file)
      })
    } catch (err) {
      console.error('画像圧縮エラー:', err)
      setCompressionError(err instanceof Error ? err.message : '画像の圧縮に失敗しました')
    } finally {
      setCompressing(false)
      setCompressionProgress(null)
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async (): Promise<string[]> => {
    const uploaded: string[] = []
    for (const image of selectedImages) {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${image.name.split('.').pop()}`
      const { error } = await supabase.storage
        .from('hachijo-board-posts')
        .upload(fileName, image)
      if (error) throw new Error(`画像のアップロードに失敗しました: ${error.message}`)
      const { data: { publicUrl } } = supabase.storage
        .from('hachijo-board-posts')
        .getPublicUrl(fileName)
      uploaded.push(publicUrl)
    }
    return uploaded
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const images = await uploadImages()

      const offerTypeLabel = form.offerType === 'goods' ? '物資配布' : 'サービス提供'
      // 公開本文（詳細住所は含めない）
      const description = [
        `【提供種別】${offerTypeLabel}`,
        form.details ? `【提供内容】${form.details}` : '',
        form.district ? `【エリア】${districts.find(d => d.id === form.district)?.label}` : '',
        form.timeWindow ? `【対応時間】${form.timeWindow}` : '',
        form.remarks ? `【備考】${form.remarks}` : '',
        '【お願い】住所等の詳細は本文・コメントに記載しないでください（必要時は個別にご案内）'
      ].filter(Boolean).join('\n')

      // 連絡先（既存仕様準拠）
      const contactText = form.email
        ? `氏名: ${form.name}\n電話: ${form.phone}\nメール: ${form.email}`
        : `氏名: ${form.name}\n電話: ${form.phone}`

      const tags = ['aid_offer', form.offerType] // 検索用タグ

      const { error } = await supabase.from('hachijo_post_board').insert({
        title: form.title,
        description,
        category: 'announcement',
        price: null,
        contact: contactText,
        images,
        image_url: images.length > 0 ? images[0] : null,
        status: 'active',
        reward_type: 'free',
        reward_details: null,
        work_date: null,
        requirements: null,
        conditions: null,
        map_link: null,
        iframe_embed: null,
        tags,
        age_friendly: false
      })

      if (error) throw error
      alert('無償提供の投稿を作成しました')
      router.push('/offer')
    } catch (err) {
      console.error('投稿エラー:', err)
      alert('投稿の作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

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
              掲示板の閲覧は島外からでも可能です。投稿は八丈島にお越しの際にお試しください。
            </p>
          </div>
          <div className="mt-6">
            <Link href="/offer" className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">一覧へ戻る</Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">無償提供の掲載</h1>
            <Link href="/offer" className="text-sm text-gray-600 hover:underline">一覧に戻る</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">提供種別</label>
              <div className="flex gap-3">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="radio" name="offerType" value="goods" checked={form.offerType==='goods'} onChange={() => setForm(f=>({...f,offerType:'goods'}))} /> 物資配布
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="radio" name="offerType" value="service" checked={form.offerType==='service'} onChange={() => setForm(f=>({...f,offerType:'service'}))} /> サービス提供
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">エリア（地区）</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm" value={form.district} onChange={(e)=>setForm(f=>({...f,district:e.target.value}))}>
                <option value="">選択してください</option>
                {districts.map(d => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
            <Input value={form.title} onChange={(e)=>setForm(f=>({...f,title:e.target.value}))} placeholder="例: カイロ 60枚（無償配布）" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">対応時間</label>
              <Input value={form.timeWindow} onChange={(e)=>setForm(f=>({...f,timeWindow:e.target.value}))} placeholder="例: 10:00–17:00" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">提供内容（詳細住所は記載しない）</label>
            <Textarea value={form.details} onChange={(e)=>setForm(f=>({...f,details:e.target.value}))} rows={4} placeholder="例: 使い捨てカイロ 60枚／先着／在庫なくなり次第終了" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
            <Textarea value={form.remarks} onChange={(e)=>setForm(f=>({...f,remarks:e.target.value}))} rows={3} placeholder="例: 1世帯2枚まで／受け渡しは店頭にて" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">画像（最大5枚・任意）</label>
            <Input type="file" accept="image/*" multiple onChange={handleImageSelect} disabled={compressing} />
            {compressionError && (
              <p className="mt-2 text-sm text-red-600">{compressionError}</p>
            )}
            {compressionProgress && (
              <p className="mt-2 text-sm text-gray-600">圧縮中 {compressionProgress.completed}/{compressionProgress.total}</p>
            )}
            {imagePreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-3 md:grid-cols-5 gap-2">
                {imagePreviews.map((src, idx) => (
                  <div key={idx} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`preview-${idx}`} className="w-full h-24 object-cover rounded-md border" />
                    <button type="button" onClick={()=>removeImage(idx)} className="absolute -top-2 -right-2 bg-white border rounded-full w-6 h-6 text-xs">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">氏名</label>
              <Input value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
              <Input value={form.phone} onChange={(e)=>setForm(f=>({...f,phone:e.target.value}))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス（任意）</label>
              <Input type="email" value={form.email} onChange={(e)=>setForm(f=>({...f,email:e.target.value}))} />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={loading || compressing} className="w-full md:w-auto">
              {loading ? '投稿中...' : '無償提供を掲載する'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

