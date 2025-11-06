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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('🔥 PUT /api/posts/[id] called!')
  try {
    // 管理者認証チェック
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')
    console.log('🔐 Session check:', !!sessionToken?.value)

    if (!sessionToken || !sessionToken.value || !sessionToken.value.startsWith('admin_')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const {
      title,
      description,
      category,
      contact,
      tags,
      reward_type,
      reward_details,
      requirements,
      age_friendly,
      map_link,
      iframe_embed
    } = body

    // 必須フィールドのバリデーション
    if (!title || !description || !category || !contact) {
      console.error('Missing required fields:', { title, description, category, contact })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('Updating post with data:', {
      id,
      title,
      description,
      category,
      contact,
      tags,
      reward_type,
      reward_details,
      requirements,
      age_friendly,
      map_link
    })

    // まず最小限の更新でテスト（管理者クライアント使用）
    console.log('Trying minimal update for post:', id)
    const { error: testError } = await adminSupabase
      .from('hachijo_post_board')
      .update({ title })
      .eq('id', id)
      .select()

    if (testError) {
      console.error('Even minimal update failed:', testError)
      return NextResponse.json(
        { 
          error: 'Minimal update failed',
          details: testError
        },
        { status: 500 }
      )
    }

    console.log('Minimal update succeeded, trying full update')

    // 更新するデータを事前にログ出力
    const updateData = {
      title,
      description,
      category,
      contact,
      tags: tags || [],
      reward_type: reward_type || null,
      reward_details: reward_details || null,
      requirements: requirements || null,
      age_friendly: age_friendly || false,
      map_link: map_link || null,
      iframe_embed: iframe_embed || null,
      updated_at: new Date().toISOString()
    }
    console.log('🔄 About to update with:', JSON.stringify(updateData, null, 2))

    // 完全な更新（管理者クライアント使用）
    const { data, error } = await adminSupabase
      .from('hachijo_post_board')
      .update(updateData)
      .eq('id', id)
      .select()

    console.log('✅ Supabase update result:', { data, error })

    if (error) {
      console.error('Supabase update error details:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return NextResponse.json(
        { 
          error: 'Failed to update post',
          details: error.message,
          supabaseError: error
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Post updated successfully',
      post: data?.[0] || null 
    })

  } catch (error) {
    console.error('Update post error:', error)
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}