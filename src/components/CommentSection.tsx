'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useLocationAccess } from '@/hooks/useLocationAccess'

interface Comment {
  id: string
  post_id: string
  content: string
  author_name: string | null
  session_id: string | null
  created_at: string
  updated_at: string
  status: string
}

interface CommentSectionProps {
  postId: string
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const { canPost } = useLocationAccess()

  // セッションIDを生成・取得
  useEffect(() => {
    let currentSessionId = sessionStorage.getItem('comment-session-id')
    if (!currentSessionId) {
      currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`
      sessionStorage.setItem('comment-session-id', currentSessionId)
    }
    setSessionId(currentSessionId)
  }, [])

  // コメント一覧取得
  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('hachijo_board_comments')
        .select('*')
        .eq('post_id', postId)
        .eq('status', 'active')
        .order('created_at', { ascending: true })

      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error('コメント取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [postId])

  // コメント投稿
  const handleSubmitComment = async () => {
    if (!newComment.trim() || !canPost || !sessionId) return

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('hachijo_board_comments')
        .insert({
          post_id: postId,
          content: newComment.trim(),
          author_name: authorName.trim() || null,
          session_id: sessionId
        })

      if (error) throw error

      setNewComment('')
      setAuthorName('')
      await fetchComments()
    } catch (error) {
      console.error('コメント投稿エラー:', error)
      alert('コメントの投稿に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  // コメント編集開始
  const startEdit = (comment: Comment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  // コメント編集保存
  const saveEdit = async (commentId: string) => {
    if (!editContent.trim()) return

    try {
      const { error } = await supabase
        .from('hachijo_board_comments')
        .update({
          content: editContent.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('session_id', sessionId) // 同じセッションのみ編集可能

      if (error) throw error

      setEditingId(null)
      setEditContent('')
      await fetchComments()
    } catch (error) {
      console.error('コメント編集エラー:', error)
      alert('コメントの編集に失敗しました。同じセッションで投稿されたコメントのみ編集できます。')
    }
  }

  // コメント削除
  const deleteComment = async (commentId: string) => {
    if (!confirm('このコメントを削除しますか？\n\n※削除されたコメントは復元できません。')) return

    console.log('🗑️ コメント削除試行:', {
      commentId,
      sessionId,
      comments: comments.find(c => c.id === commentId)
    })

    try {
      const { data, error } = await supabase
        .from('hachijo_board_comments')
        .update({ status: 'deleted' })
        .eq('id', commentId)
        .eq('session_id', sessionId) // 同じセッションのみ削除可能
        .select()

      console.log('🗑️ 削除結果:', { data, error })

      if (error) throw error

      if (!data || data.length === 0) {
        throw new Error('該当するコメントが見つからないか、権限がありません')
      }

      await fetchComments()
      alert('コメントを削除しました')
    } catch (error) {
      console.error('コメント削除エラー:', error)
      alert('コメントの削除に失敗しました。同じセッションで投稿されたコメントのみ削除できます。')
    }
  }

  // セッションの所有者かチェック
  const isOwner = (comment: Comment): boolean => {
    return comment.session_id === sessionId
  }

  if (loading) {
    return <div className="text-center py-4">コメントを読み込み中...</div>
  }

  return (
    <div className="mt-8">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">💬 コメント ({comments.length})</h3>
        </div>
        
        {/* 注釈 */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            ℹ️ コメントは同一セッション（ブラウザ）では編集・削除が可能です
          </p>
        </div>

        {/* コメント一覧 */}
        <div className="space-y-4 mb-6">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              まだコメントがありません。最初のコメントを投稿してみませんか？
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {comment.author_name || '匿名'}
                    </span>
                    {isOwner(comment) && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        あなたの投稿
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleString('ja-JP')}
                    </span>
                    {isOwner(comment) && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(comment)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => deleteComment(comment.id)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          削除
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {editingId === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => saveEdit(comment.id)}
                        disabled={!editContent.trim()}
                      >
                        保存
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(null)
                          setEditContent('')
                        }}
                      >
                        キャンセル
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                )}

                {comment.updated_at !== comment.created_at && editingId !== comment.id && (
                  <div className="text-xs text-gray-400 mt-2">
                    編集済み: {new Date(comment.updated_at).toLocaleString('ja-JP')}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* コメント投稿フォーム */}
        {canPost ? (
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium mb-3">新しいコメントを投稿</h4>
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="お名前（任意）"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="max-w-xs"
              />
              <Textarea
                placeholder="コメントを入力してください..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px]"
              />
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || submitting}
                className="w-full sm:w-auto"
              >
                {submitting ? '投稿中...' : 'コメントを投稿'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-t border-gray-200 pt-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <p className="text-orange-700">
                コメントを投稿するには八丈島内からアクセスしてください
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}