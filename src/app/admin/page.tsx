'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Post } from '@/types'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [comments, setComments] = useState<{
    id: string
    post_id: string
    content: string
    author_name: string | null
    session_id: string | null
    created_at: string
    updated_at: string
    status: string
    hachijo_post_board?: {
      id: string
      title: string
    }
  }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'hidden'>('all')
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts')

  // 認証チェック
  useEffect(() => {
    const authStatus = sessionStorage.getItem('admin-auth')
    const loginTime = sessionStorage.getItem('admin-login-time')
    
    if (authStatus === 'authenticated') {
      // セッション期限チェック（24時間）
      if (loginTime) {
        const loginDate = new Date(loginTime)
        const now = new Date()
        const hoursDiff = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60)
        
        if (hoursDiff > 24) {
          // 24時間経過したら自動ログアウト
          sessionStorage.removeItem('admin-auth')
          sessionStorage.removeItem('admin-login-time')
          setError('セッションの有効期限が切れました。再度ログインしてください。')
          setLoading(false)
          return
        }
      }
      
      setIsAuthenticated(true)
      if (activeTab === 'posts') {
        fetchPosts()
      } else {
        fetchComments()
      }
    } else {
      setLoading(false)
    }
  }, [])

  // 管理者認証
  const handleAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      if (response.ok) {
        sessionStorage.setItem('admin-auth', 'authenticated')
        sessionStorage.setItem('admin-login-time', new Date().toISOString())
        setIsAuthenticated(true)
        setError('')
        if (activeTab === 'posts') {
          fetchPosts()
        } else {
          fetchComments()
        }
      } else {
        setError('パスワードが間違っています')
      }
    } catch (error) {
      setError('認証に失敗しました')
    }
  }

  // ログアウト処理
  const handleLogout = () => {
    if (confirm('管理者画面からログアウトしますか？')) {
      sessionStorage.removeItem('admin-auth')
      sessionStorage.removeItem('admin-login-time')
      setIsAuthenticated(false)
      setPassword('')
      setPosts([])
      alert('ログアウトしました')
    }
  }

  // 投稿一覧取得（管理API経由でRLSをバイパス）
  const fetchPosts = async () => {
    try {
      setLoading(true)
      const statusParam = 'all' // まとめて取得し、UI側のフィルタで絞り込み
      const res = await fetch(`/api/admin/posts?status=${statusParam}`, { cache: 'no-store' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || '管理APIからの取得に失敗しました')
      }
      const json = await res.json()
      setPosts(json.posts || [])
    } catch (error) {
      console.error('投稿取得エラー:', error)
      setError('投稿の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // コメント一覧取得
  const fetchComments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('hachijo_board_comments')
        .select(`
          *,
          hachijo_post_board!post_id (
            id,
            title
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error('コメント取得エラー:', error)
      setError('コメントの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // 投稿の表示/非表示切り替え（API経由）
  const togglePostStatus = async (postId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'hidden' : 'active'
    const actionText = newStatus === 'hidden' ? '非表示' : '表示'
    const currentText = currentStatus === 'active' ? '公開中' : '非表示'
    
    // 確認ダイアログ
    const confirmed = confirm(
      `投稿を${actionText}に変更しますか？\n\n` +
      `現在のステータス: ${currentText}\n` +
      `変更後のステータス: ${actionText}\n\n` +
      `※この操作は取り消すことができます`
    )
    
    if (!confirmed) {
      return
    }

    try {
      // API経由でステータス更新（URLパラメータ経由）
      const response = await fetch(`/api/posts/${postId}/toggle-status?status=${newStatus}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'ステータス更新に失敗しました')
      }

      const result = await response.json()
      
      // ローカル状態を更新
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, status: newStatus }
          : post
      ))
      
      // 成功メッセージ
      alert(`投稿を${actionText}に変更しました`)
    } catch (error) {
      console.error('ステータス更新エラー:', error)
      alert('ステータスの更新に失敗しました')
    }
  }

  // 投稿の削除（管理API経由） - hidden状態でのみ表示想定
  const deletePost = async (postId: string) => {
    const confirmed = confirm(
      'この投稿を削除しますか？\n\n※この操作は取り消せません。関連コメントも削除されます。'
    )
    if (!confirmed) return
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || '削除に失敗しました')
      }
      // ローカル状態から削除
      setPosts(prev => prev.filter(p => p.id !== postId))
      alert('投稿を削除しました')
    } catch (error) {
      console.error('投稿削除エラー:', error)
      alert('投稿の削除に失敗しました')
    }
  }

  // コメントの表示/非表示切り替え
  const toggleCommentStatus = async (commentId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'hidden' : 'active'
    const actionText = newStatus === 'hidden' ? '非表示' : '表示'
    const currentText = currentStatus === 'active' ? '表示中' : '非表示'
    
    // 確認ダイアログ
    const confirmed = confirm(
      `コメントを${actionText}に変更しますか？\n\n` +
      `現在のステータス: ${currentText}\n` +
      `変更後のステータス: ${actionText}\n\n` +
      `※この操作は取り消すことができます`
    )
    
    if (!confirmed) {
      return
    }

    try {
      const { error } = await supabase
        .from('hachijo_board_comments')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)

      if (error) throw error

      // ローカル状態を更新
      setComments(comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, status: newStatus }
          : comment
      ))
      
      alert(`コメントを${actionText}に変更しました`)
    } catch (error) {
      console.error('コメントステータス更新エラー:', error)
      alert('コメントステータスの更新に失敗しました')
    }
  }

  // 災害支援投稿判定（一時的に無効化）
  const isDisasterPost = (post: Post): boolean => {
    // 一時的に災害支援判定を無効化
    return false
    
    // const disasterCategories = ['tree_removal', 'water_supply', 'transportation', 'shopping', 'other']
    // const hasDisasterCategoryTag = post.tags && post.tags.some(tag => disasterCategories.includes(tag))
    // const hasDisasterKeywords = post.title && (
    //   post.title.includes('倒木を除去してほしい') || 
    //   post.title.includes('水を持ってきて欲しい') ||
    //   post.title.includes('移動したい') ||
    //   post.title.includes('買い出しをお願いしたい') ||
    //   post.title.includes('支援') || post.title.includes('災害')
    // )
    // return Boolean(hasDisasterCategoryTag || hasDisasterKeywords)
  }

  // フィルター済み投稿
  const filteredPosts = posts.filter(post => {
    if (filter === 'active') return post.status === 'active'
    if (filter === 'hidden') return post.status === 'hidden'
    return true
  })

  // フィルター済みコメント
  const filteredComments = comments.filter(comment => {
    if (filter === 'active') return comment.status === 'active'
    if (filter === 'hidden') return comment.status === 'hidden'
    return true
  })

  // タブ切り替え
  const handleTabChange = (tab: 'posts' | 'comments') => {
    setActiveTab(tab)
    setFilter('all')
    if (tab === 'posts') {
      fetchPosts()
    } else {
      fetchComments()
    }
  }

  // 認証前画面
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">🔐 管理者認証</h1>
            <p className="text-gray-600 mt-2">管理者パスワードを入力してください</p>
          </div>

          <div className="space-y-4">
            <Input
              type="password"
              placeholder="管理者パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            />
            
            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}
            
            <Button 
              onClick={handleAuth}
              className="w-full"
              disabled={!password}
            >
              ログイン
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // 管理画面
  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* ヘッダー */}
      <Card className="p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🛠️ 管理画面</h1>
            <p className="text-gray-600 mt-1">投稿管理・編集・表示制御</p>
            {(() => {
              const loginTime = sessionStorage.getItem('admin-login-time')
              return loginTime && (
                <p className="text-xs text-green-600 mt-1">
                  ✅ ログイン済み ({new Date(loginTime).toLocaleString('ja-JP')})
                </p>
              )
            })()}
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              🏠 サイトに戻る
            </Link>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              🔓 ログアウト
            </Button>
          </div>
        </div>
      </Card>

      {/* タブ切り替え */}
      <Card className="p-6 mb-6">
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'posts' ? 'default' : 'outline'}
            onClick={() => handleTabChange('posts')}
          >
            📝 投稿管理
          </Button>
          <Button
            variant={activeTab === 'comments' ? 'default' : 'outline'}
            onClick={() => handleTabChange('comments')}
          >
            💬 コメント管理
          </Button>
        </div>
      </Card>

      {/* 統計・フィルター */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {activeTab === 'posts' ? posts.length : comments.length}
            </div>
            <div className="text-sm text-blue-800">
              {activeTab === 'posts' ? '総投稿数' : '総コメント数'}
            </div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {activeTab === 'posts' 
                ? posts.filter(p => p.status === 'active').length
                : comments.filter(c => c.status === 'active').length
              }
            </div>
            <div className="text-sm text-green-800">
              {activeTab === 'posts' ? '公開中' : '表示中'}
            </div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {activeTab === 'posts'
                ? posts.filter(p => p.status === 'hidden').length
                : comments.filter(c => c.status === 'hidden').length
              }
            </div>
            <div className="text-sm text-red-800">非表示</div>
          </div>
        </div>

        {/* フィルター */}
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            全て ({activeTab === 'posts' ? posts.length : comments.length})
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('active')}
          >
            {activeTab === 'posts' ? '公開中' : '表示中'} ({activeTab === 'posts' ? posts.filter(p => p.status === 'active').length : comments.filter(c => c.status === 'active').length})
          </Button>
          <Button
            variant={filter === 'hidden' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('hidden')}
          >
            非表示 ({activeTab === 'posts' ? posts.filter(p => p.status === 'hidden').length : comments.filter(c => c.status === 'hidden').length})
          </Button>
        </div>
      </Card>

      {/* 投稿一覧・コメント一覧 */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          {activeTab === 'posts' ? '投稿一覧' : 'コメント一覧'}
        </h2>
        
        {loading ? (
          <div className="text-center py-8">読み込み中...</div>
        ) : activeTab === 'posts' ? (
          filteredPosts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {filter === 'all' ? '投稿がありません' : `${filter === 'active' ? '公開中' : '非表示'}の投稿がありません`}
            </div>
          ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 truncate">{post.title}</h3>
                      <Badge variant={post.status === 'active' ? 'default' : 'secondary'}>
                        {post.status === 'active' ? '公開' : '非表示'}
                      </Badge>
                      {/* 災害支援バッジを一時非表示 */}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{post.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>ID: {post.id.slice(0, 8)}</span>
                      <span>カテゴリ: {post.category}</span>
                      <span>作成: {new Date(post.created_at).toLocaleDateString('ja-JP')}</span>
                      {post.updated_at && post.updated_at !== post.created_at && (
                        <span>更新: {new Date(post.updated_at).toLocaleDateString('ja-JP')}</span>
                      )}
                    </div>

                    {/* 管理者専用：連絡先表示 */}
                    {post.contact && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <div className="text-xs font-medium text-yellow-800 mb-1">📞 連絡先（管理者のみ表示）</div>
                        <div className="text-sm font-mono text-yellow-900">{post.contact}</div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Link
                      href={`/post/${post.id}`}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-center"
                    >
                      詳細
                    </Link>
                    <Link
                      href={`/post/${post.id}/edit`}
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-center"
                    >
                      編集
                    </Link>
                    <Button
                      size="sm"
                      variant={post.status === 'active' ? 'destructive' : 'default'}
                      onClick={() => togglePostStatus(post.id, post.status)}
                      className="text-xs"
                    >
                      {post.status === 'active' ? '非表示' : '公開'}
                    </Button>
                    {post.status === 'hidden' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deletePost(post.id)}
                        className="text-xs"
                      >
                        削除
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )) : (
          // コメント一覧
          filteredComments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {filter === 'all' ? 'コメントがありません' : `${filter === 'active' ? '表示中' : '非表示'}のコメントがありません`}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredComments.map((comment) => (
                <div key={comment.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">
                          {comment.author_name || '匿名'}
                        </span>
                        <Badge variant={comment.status === 'active' ? 'default' : 'secondary'}>
                          {comment.status === 'active' ? '表示中' : '非表示'}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-700 text-sm mb-2 line-clamp-3">{comment.content}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                        <span>ID: {comment.id.slice(0, 8)}</span>
                        <span>投稿: {comment.hachijo_post_board?.title || '削除済み'}</span>
                        <span>作成: {new Date(comment.created_at).toLocaleDateString('ja-JP')}</span>
                        {comment.updated_at !== comment.created_at && (
                          <span>更新: {new Date(comment.updated_at).toLocaleDateString('ja-JP')}</span>
                        )}
                      </div>

                      {/* セッションID表示（管理者用） */}
                      {comment.session_id && (
                        <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded">
                          <div className="text-xs font-medium text-gray-700 mb-1">セッションID（管理者のみ表示）</div>
                          <div className="text-xs font-mono text-gray-600">{comment.session_id}</div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {comment.hachijo_post_board && (
                        <Link
                          href={`/post/${comment.hachijo_post_board.id}`}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-center"
                        >
                          投稿詳細
                        </Link>
                      )}
                      <Button
                        size="sm"
                        variant={comment.status === 'active' ? 'destructive' : 'default'}
                        onClick={() => toggleCommentStatus(comment.id, comment.status)}
                        className="text-xs"
                      >
                        {comment.status === 'active' ? '非表示' : '表示'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </Card>
    </div>
  )
}
