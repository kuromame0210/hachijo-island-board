'use client'

import { useState } from 'react'
import { themes, ThemeName } from '@/lib/themes'
import { Card } from '@/components/ui/card'

interface ThemeSelectorProps {
  currentTheme: ThemeName
  onThemeChange: (theme: ThemeName) => void
}

export default function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
      >
        🎨 テーマ: {themes[currentTheme].name}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 z-50">
          <Card className="p-4 bg-white shadow-lg border border-gray-200">
            <h3 className="font-semibold mb-3 text-gray-900">テーマを選択</h3>
            <div className="space-y-2">
              {Object.entries(themes).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => {
                    onThemeChange(key as ThemeName)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                    currentTheme === key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{theme.name}</div>
                      <div className="text-sm text-gray-600">{theme.description}</div>
                    </div>
                    <div className="flex gap-1">
                      <div className={`w-4 h-4 rounded-full bg-${theme.colors.primary}`}></div>
                      <div className={`w-4 h-4 rounded-full bg-${theme.colors.secondary}`}></div>
                      <div className={`w-4 h-4 rounded-full bg-${theme.colors.accent}`}></div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}