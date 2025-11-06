爆速開発のために、shadcn/uiとTailwind CSSを使用した2022年風のモダンUIで実装します。シンプルな構成で最速開発を目指します。

**技術スタック（爆速開発用）**
- Next.js App Router
- shadcn/ui（コンポーネントライブラリ）
- Tailwind CSS
- Supabase（DB + Storage）
- Vercel（デプロイ）

**初期セットアップ（5分）**

```bash
npx create-next-app@latest hachijo-board --typescript --tailwind --app
cd hachijo-board

# shadcn/ui インストール
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input textarea select badge

# Supabase
npm install @supabase/supabase-js
```

**最小限のテーブル構造（Supabaseで作成）**

```sql
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER,
  category TEXT NOT NULL,
  contact TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**ファイル構成（最小限）**

```
app/
  layout.tsx
  page.tsx
  post/[id]/page.tsx
  new/page.tsx
lib/
  supabase.ts
```

**lib/supabase.ts**

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

**app/layout.tsx（2022年モダンスタイル）**

```tsx
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={`${inter.className} bg-gray-50`}>
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <a href="/" className="text-xl font-semibold text-gray-900">
              八丈掲示板
            </a>
            <a
              href="/new"
              className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              投稿する
            </a>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
```

**app/page.tsx（トップページ）**

```tsx
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const categoryColors = {
  '不動産': 'bg-blue-100 text-blue-800',
  '仕事': 'bg-green-100 text-green-800',
  '不用品': 'bg-purple-100 text-purple-800'
}

export default async function HomePage() {
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      {/* カテゴリフィルター */}
      <div className="flex gap-2 mb-8">
        <button className="px-4 py-2 bg-gray-900 text-white rounded-lg">
          すべて
        </button>
        <button className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">
          🏠 不動産
        </button>
        <button className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">
          💼 仕事
        </button>
        <button className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">
          📦 不用品
        </button>
      </div>

      {/* 投稿グリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts?.map((post) => (
          <a href={`/post/${post.id}`} key={post.id}>
            <Card className="hover:shadow-lg transition cursor-pointer h-full">
              {post.image_url && (
                <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                  <img 
                    src={post.image_url} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <Badge className={categoryColors[post.category as keyof typeof categoryColors]}>
                    {post.category}
                  </Badge>
                  {post.price !== null && (
                    <span className="font-semibold text-lg">
                      ¥{post.price.toLocaleString()}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 line-clamp-3">
                  {post.description}
                </p>
                <p className="text-sm text-gray-400 mt-4">
                  {new Date(post.created_at).toLocaleDateString('ja-JP')}
                </p>
              </div>
            </Card>
          </a>
        ))}
      </div>
    </div>
  )
}
```

**app/new/page.tsx（投稿ページ）**

```tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

export default function NewPost() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    const { error } = await supabase.from('posts').insert({
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.get('category'),
      price: formData.get('price') ? Number(formData.get('price')) : null,
      contact: formData.get('contact'),
    })

    if (!error) {
      router.push('/')
    }
    setLoading(false)
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
            className="flex-1 bg-gray-900 hover:bg-gray-800"
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
```

**app/post/[id]/page.tsx（詳細ページ）**

```tsx
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default async function PostDetail({ params }: { params: { id: string } }) {
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!post) return <div>投稿が見つかりません</div>

  return (
    <Card className="max-w-4xl mx-auto">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="secondary" className="text-base">
            {post.category}
          </Badge>
          <span className="text-sm text-gray-500">
            {new Date(post.created_at).toLocaleDateString('ja-JP')}
          </span>
        </div>

        <h1 className="text-3xl font-semibold mb-6">{post.title}</h1>

        {post.price !== null && (
          <div className="text-2xl font-semibold text-gray-900 mb-6">
            ¥{post.price.toLocaleString()}
          </div>
        )}

        <div className="prose max-w-none mb-8">
          <p className="whitespace-pre-wrap text-gray-700">
            {post.description}
          </p>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold mb-3">連絡先</h3>
          <p className="text-lg bg-gray-100 p-4 rounded-lg font-mono">
            {post.contact}
          </p>
        </div>

        <div className="mt-8">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto"
          >
            ← 一覧に戻る
          </Button>
        </div>
      </div>
    </Card>
  )
}
```

**globals.css（追加）**

```css
@layer utilities {
  .line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
  
  .line-clamp-3 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }
}
```

この構成により、約1時間で基本的な掲示板機能を実装できます。shadcn/uiのコンポーネントを使用することで、2022年風のモダンなUIを簡単に実現でき、カスタマイズも容易です。位置情報制限などの追加機能は、後から段階的に追加できる構造になっています。