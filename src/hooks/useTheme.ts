'use client'

import { useState, useEffect } from 'react'
import { ThemeName, defaultTheme } from '@/lib/themes'

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(defaultTheme)

  useEffect(() => {
    // ローカルストレージからテーマを読み込み
    const savedTheme = localStorage.getItem('hachijo-theme') as ThemeName
    if (savedTheme && ['ocean', 'nature', 'geothermal', 'sunset', 'community'].includes(savedTheme)) {
      setCurrentTheme(savedTheme)
    }
  }, [])

  const changeTheme = (theme: ThemeName) => {
    setCurrentTheme(theme)
    localStorage.setItem('hachijo-theme', theme)
  }

  return {
    currentTheme,
    changeTheme
  }
}