'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AdminPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  postId: string
}

export default function AdminPasswordModal({ isOpen, onClose, postId }: AdminPasswordModalProps) {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // モーダルが開かれた時に既存セッションをチェック
  const checkExistingSession = async () => {
    try {
      const response = await fetch('/api/admin/verify')
      if (response.ok) {
        // 既にセッションがある場合は直接編集ページに遷移
        router.push(`/post/${postId}/edit`)
        onClose()
        return true
      }
    } catch {
      console.log('No existing session')
    }
    return false
  }

  // モーダルが開かれた時に自動チェック
  useEffect(() => {
    if (isOpen) {
      checkExistingSession()
    }
  }, [isOpen, postId, router, checkExistingSession])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        // 認証成功 - 編集ページに遷移
        router.push(`/post/${postId}/edit`)
        onClose()
      } else {
        setError('パスワードが正しくありません')
      }
    } catch {
      setError('認証に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setPassword('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">管理者認証</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              管理者パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="パスワードを入力してください"
              required
              autoFocus
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="flex-1 px-4 py-2 text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '認証中...' : '編集画面へ'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-xs text-gray-500 text-center">
          ※このパスワードは管理者のみが知っています
        </div>
      </div>
    </div>
  )
}