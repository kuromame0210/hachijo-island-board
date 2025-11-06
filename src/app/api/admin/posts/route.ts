import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
)

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')
    if (!sessionToken || !sessionToken.value || !sessionToken.value.startsWith('admin_')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const status = request.nextUrl.searchParams.get('status') || 'all'

    let query = adminSupabase.from('hachijo_post_board').select('*').order('created_at', { ascending: false })
    if (status === 'active' || status === 'hidden' || status === 'deleted') {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    if (error) {
      return NextResponse.json({ error: 'Failed to fetch posts', details: error.message }, { status: 500 })
    }
    return NextResponse.json({ posts: data || [] })
  } catch (error) {
    console.error('Admin posts fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

