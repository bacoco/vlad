'use client'

import { useTheme } from '@/components/providers/ThemeProvider'
import { useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const icons = {
    light: '☀️',
    dark: '🌙',
    system: '💻',
  }

  const labels = {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Theme toggle"
      >
        <span className="text-xl">{icons[theme]}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-36 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-20">
            {(['light', 'dark', 'system'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTheme(t)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 ${
                  theme === t ? 'text-primary' : 'text-gray-700 dark:text-gray-300'
                } ${t === 'light' ? 'rounded-t-lg' : t === 'system' ? 'rounded-b-lg' : ''}`}
              >
                <span>{icons[t]}</span>
                <span className="text-sm">{labels[t]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}