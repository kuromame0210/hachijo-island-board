'use client'

import { useState } from 'react'

const themes = [
  { name: 'Ocean Blue', key: 'ocean', color: 'bg-blue-600', description: '海の青' },
  { name: 'Island Nature', key: 'nature', color: 'bg-emerald-600', description: '島の緑' },
  { name: 'Geothermal', key: 'geothermal', color: 'bg-red-600', description: '地熱' },
  { name: 'Sunset', key: 'sunset', color: 'bg-orange-700', description: '夕景' },
  { name: 'Community', key: 'community', color: 'bg-violet-600', description: 'コミュニティ' }
]

export default function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentTheme, setCurrentTheme] = useState(themes[0])

  const handleThemeChange = (theme: typeof themes[0]) => {
    setCurrentTheme(theme)
    setIsOpen(false)
    // 実際のテーマ変更ロジックは後で実装
    console.log('テーマ変更:', theme.name)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
      >
        <div className={`w-3 h-3 rounded-full ${currentTheme.color}`}></div>
        <span className="hidden sm:inline">{currentTheme.description}</span>
        <span className="text-xs">▼</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-2 py-1">テーマを選択</div>
              {themes.map((theme) => (
                <button
                  key={theme.key}
                  onClick={() => handleThemeChange(theme)}
                  className={`w-full flex items-center gap-3 px-2 py-2 text-sm rounded hover:bg-gray-50 transition-colors ${
                    currentTheme.key === theme.key ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full ${theme.color}`}></div>
                  <div className="text-left">
                    <div className="font-medium">{theme.description}</div>
                    <div className="text-xs text-gray-500">{theme.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}