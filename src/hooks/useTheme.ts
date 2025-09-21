'use client'

import { useState, useEffect } from 'react'
import { ThemeName, defaultTheme, themes } from '@/lib/themes'

export function useTheme() {
  const [theme, setTheme] = useState<ThemeName>(defaultTheme)

  useEffect(() => {
    // ローカルストレージからテーマを読み込み
    const savedTheme = localStorage.getItem('hachijo-theme') as ThemeName
    if (savedTheme && ['ocean', 'nature', 'geothermal', 'sunset', 'community'].includes(savedTheme)) {
      setTheme(savedTheme)
    }
  }, [])

  const changeTheme = (newTheme: ThemeName) => {
    setTheme(newTheme)
    localStorage.setItem('hachijo-theme', newTheme)
  }

  return {
    theme,
    setTheme: changeTheme,
    themes
  }
}