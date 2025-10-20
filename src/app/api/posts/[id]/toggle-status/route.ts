import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

// 管理者用のSupabaseクライアント（RLSをバイパス）
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 管理者認証チェック
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')

    if (!sessionToken || !sessionToken.value || !sessionToken.value.startsWith('admin_')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // URLパラメータからステータスを取得
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    console.log('📥 Received status from URL:', status)

    // バリデーション
    if (!status || !['active', 'hidden'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value. Must be "active" or "hidden"' },
        { status: 400 }
      )
    }

    // ステータス更新
    const { data, error } = await adminSupabase
      .from('hachijo_post_board')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Status update error:', error)
      return NextResponse.json(
        { 
          error: 'Failed to update status',
          details: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Status updated successfully',
      post: data?.[0] || null 
    })

  } catch (error) {
    console.error('Toggle status error:', error)
    return NextResponse.json(
      { error: 'Failed to toggle status' },
      { status: 500 }
    )
  }
}