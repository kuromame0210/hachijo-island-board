import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')

    if (!sessionToken || !sessionToken.value) {
      return NextResponse.json(
        { error: 'No admin session found' },
        { status: 401 }
      )
    }

    // セッションの形式チェック（admin_で始まる）
    if (!sessionToken.value.startsWith('admin_')) {
      return NextResponse.json(
        { error: 'Invalid admin session' },
        { status: 401 }
      )
    }

    return NextResponse.json({ authenticated: true })

  } catch (error) {
    console.error('Admin verify error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}