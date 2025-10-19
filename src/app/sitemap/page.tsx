'use client'

import { Card } from '@/components/ui/card'
import Link from 'next/link'

interface SiteMapItem {
  title: string
  path: string
  description: string
  category: string
  icon: string
  status?: 'active' | 'development' | 'planned'
}

const siteMapData: SiteMapItem[] = [
  // メインページ
  {
    title: 'ホーム',
    path: '/',
    description: '投稿一覧とメイン機能（リスト・カード表示）',
    category: 'メイン',
    icon: '🏠',
    status: 'active'
  },
  {
    title: 'サイトマップ',
    path: '/sitemap',
    description: '全ページとAPI一覧',
    category: 'メイン',
    icon: '🗺️',
    status: 'active'
  },

  // 投稿関連
  {
    title: '新規投稿',
    path: '/new',
    description: '新しい投稿を作成（一時非表示）',
    category: '投稿',
    icon: '✍️',
    status: 'development'
  },
  {
    title: '投稿詳細',
    path: '/post/[id]',
    description: '個別投稿の詳細表示・画像ギャラリー',
    category: '投稿',
    icon: '📄',
    status: 'active'
  },
  {
    title: '投稿編集',
    path: '/post/[id]/edit',
    description: '投稿内容の編集・画像管理',
    category: '投稿',
    icon: '✏️',
    status: 'active'
  },

  // 災害支援システム
  {
    title: '災害支援要請',
    path: '/disaster/new',
    description: '台風被害支援の要請フォーム',
    category: '災害支援',
    icon: '🆘',
    status: 'active'
  },

  // 位置情報システム
  {
    title: '位置情報確認',
    path: '/location',
    description: '現在地と島内判定の確認（10km圏内）',
    category: '位置情報',
    icon: '📍',
    status: 'active'
  },

  // 管理機能
  {
    title: '管理画面',
    path: '/admin',
    description: '投稿管理・編集・表示制御・連絡先表示（直接アクセス必要）',
    category: '管理機能',
    icon: '🛠️',
    status: 'active'
  },

  // 法的事項
  {
    title: '利用規約',
    path: '/terms',
    description: 'サービス利用規約',
    category: '法的事項',
    icon: '📋',
    status: 'active'
  },

  // 情報ポータル（固定リンク）
  {
    title: '八丈島インフラ情報',
    path: '/ad/hachijo-infra',
    description: '島内インフラ・交通・生活情報',
    category: '情報ポータル',
    icon: '🏗️',
    status: 'active'
  },
  {
    title: '八丈島災害情報',
    path: '/ad/hachijo-saigai',
    description: '災害・防災・ボランティア情報',
    category: '情報ポータル',
    icon: '🚨',
    status: 'active'
  },

  // API・システム
  {
    title: '投稿API',
    path: '/api/posts/[id]',
    description: '投稿データのREST API',
    category: 'API',
    icon: '🔗',
    status: 'active'
  },
  {
    title: '管理者認証API',
    path: '/api/admin/auth',
    description: '管理者認証システム',
    category: 'API',
    icon: '🔐',
    status: 'active'
  },
  {
    title: '管理者検証API',
    path: '/api/admin/verify',
    description: '管理者セッション検証',
    category: 'API',
    icon: '🔍',
    status: 'active'
  },

  // 開発・テスト
  {
    title: 'テストページ',
    path: '/test',
    description: '開発・テスト用ページ',
    category: '開発',
    icon: '🧪',
    status: 'development'
  }
]

const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-200',
  development: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  planned: 'bg-gray-100 text-gray-800 border-gray-200'
}

const statusLabels = {
  active: '稼働中',
  development: '開発中',
  planned: '計画中'
}

export default function SitemapPage() {
  const categories = [...new Set(siteMapData.map(item => item.category))]

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card className="p-8 mb-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🗺️ サイトマップ</h1>
          <p className="text-lg text-gray-600 mb-4">
            八丈島掲示板の全ページとAPI一覧
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-4xl mx-auto">
            <h3 className="font-semibold text-blue-800 mb-2">🌟 主要機能</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>位置制限システム</strong>：八丈島10km圏内からのみ投稿可能</li>
              <li>• <strong>災害支援機能</strong>：台風被害の支援要請（連絡先非公開）</li>
              <li>• <strong>管理システム</strong>：投稿管理・編集・表示制御</li>
              <li>• <strong>情報ポータル</strong>：インフラ情報・災害情報への固定リンク</li>
              <li>• <strong>画像管理</strong>：最大5枚の画像アップロード・編集</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">稼働中 ({siteMapData.filter(item => item.status === 'active').length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-600">開発中 ({siteMapData.filter(item => item.status === 'development').length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-sm text-gray-600">計画中 ({siteMapData.filter(item => item.status === 'planned').length})</span>
          </div>
        </div>
      </Card>

      {categories.map(category => (
        <Card key={category} className="p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            📁 {category}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {siteMapData
              .filter(item => item.category === category)
              .map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        {item.status && (
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${statusColors[item.status]}`}>
                            {statusLabels[item.status]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">
                      {item.path}
                    </code>
                    
                    {item.status === 'active' && !item.path.includes('[id]') && !item.path.startsWith('/api') && item.path !== '/admin' ? (
                      <Link 
                        href={item.path}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        開く →
                      </Link>
                    ) : item.path === '/admin' ? (
                      <span className="text-orange-600 text-sm font-medium">
                        管理者専用
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">
                        {item.path.includes('[id]') ? '動的ページ' : 
                         item.path.startsWith('/api') ? 'API' : 
                         item.status === 'development' ? '開発中' : '計画中'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </Card>
      ))}

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 統計情報</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{siteMapData.length}</div>
            <div className="text-sm text-blue-800">総ページ数</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {siteMapData.filter(item => item.status === 'active').length}
            </div>
            <div className="text-sm text-green-800">稼働中</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {siteMapData.filter(item => item.status === 'development').length}
            </div>
            <div className="text-sm text-yellow-800">開発中</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{categories.length}</div>
            <div className="text-sm text-purple-800">カテゴリ数</div>
          </div>
        </div>
      </Card>

      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">🔐 管理者向け情報</h2>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-semibold text-orange-800 mb-2">管理画面へのアクセス</h3>
          <p className="text-sm text-orange-700 mb-3">
            管理画面は一般のナビゲーションには表示されません。以下の方法でアクセスしてください：
          </p>
          <ul className="text-sm text-orange-700 space-y-1 mb-3">
            <li>• URLに直接入力: <code className="bg-orange-100 px-1 rounded">/admin</code></li>
            <li>• 管理者パスワード: <code className="bg-orange-100 px-1 rounded">hachijo2025</code></li>
          </ul>
          <p className="text-xs text-orange-600">
            ※ 管理者としてログイン後、投稿詳細ページで編集・ログアウト機能が利用可能になります
          </p>
        </div>
      </Card>

      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">⚙️ 技術仕様</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">フロントエンド</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Next.js 15.5.3 (App Router)</li>
              <li>• TypeScript</li>
              <li>• Tailwind CSS</li>
              <li>• React Hooks</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">バックエンド</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Supabase (PostgreSQL)</li>
              <li>• Row Level Security</li>
              <li>• Storage (画像管理)</li>
              <li>• REST API</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">セキュリティ</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 位置情報ベース制限</li>
              <li>• 管理者認証システム</li>
              <li>• プライバシー保護</li>
              <li>• XSS/CSRF対策</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">機能</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• レスポンシブデザイン</li>
              <li>• 画像アップロード</li>
              <li>• リアルタイム更新</li>
              <li>• キャッシュ管理</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">🔗 外部リンク</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a 
            href="https://infra8jo.shuuutaf.workers.dev/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
          >
            <span className="text-2xl">🏗️</span>
            <div>
              <h3 className="font-semibold text-gray-900">八丈島インフラ情報</h3>
              <p className="text-sm text-gray-600">交通・インフラ・生活情報</p>
            </div>
            <span className="text-blue-600 ml-auto">↗</span>
          </a>
          
          <a 
            href="https://www.8jo-saigai.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
          >
            <span className="text-2xl">🚨</span>
            <div>
              <h3 className="font-semibold text-gray-900">八丈島災害情報</h3>
              <p className="text-sm text-gray-600">災害・防災・ボランティア情報</p>
            </div>
            <span className="text-blue-600 ml-auto">↗</span>
          </a>
        </div>
      </Card>

      <div className="text-center mt-8">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          ← ホームに戻る
        </Link>
      </div>
    </div>
  )
}