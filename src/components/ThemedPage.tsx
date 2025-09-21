'use client'

import { useTheme } from '@/hooks/useTheme'
import ThemeSelector from '@/components/ThemeSelector'

interface ThemedPageProps {
  children: React.ReactNode
}

export default function ThemedPage({ children }: ThemedPageProps) {
  const { theme: currentTheme, setTheme: changeTheme, themes } = useTheme()
  const theme = themes[currentTheme]

  return (
    <div className={`theme-${currentTheme}`}>
      <style jsx global>{`
        .theme-${currentTheme} .btn-primary {
          background-color: rgb(var(--color-${theme.colors.primary.replace('-', '-')}));
        }
        .theme-${currentTheme} .btn-primary:hover {
          background-color: rgb(var(--color-${theme.colors.primaryHover.replace('-', '-')}));
        }
        .theme-${currentTheme} .text-primary {
          color: rgb(var(--color-${theme.colors.primary.replace('-', '-')}));
        }
        .theme-${currentTheme} .text-accent {
          color: rgb(var(--color-${theme.colors.accent.replace('-', '-')}));
        }
      `}</style>

      <div className="fixed top-20 right-4 z-50">
        <ThemeSelector
          currentTheme={currentTheme}
          onThemeChange={changeTheme}
        />
      </div>

      {children}
    </div>
  )
}