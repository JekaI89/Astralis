'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'

// Инициализирует Telegram Mini App SDK и выполняет авторизацию
export function TelegramInit() {
  const login = useAuthStore((s) => s.loginWithTelegram)

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (!tg) return

    tg.ready()
    tg.expand()
    tg.enableClosingConfirmation()

    if (tg.initData) {
      void login(tg.initData)
    }
  }, [login])

  return null
}

// Расширяем Window для TypeScript
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void
        expand: () => void
        enableClosingConfirmation: () => void
        initData: string
        colorScheme: 'light' | 'dark'
        themeParams: Record<string, string>
        MainButton: {
          setText: (text: string) => void
          show: () => void
          hide: () => void
          onClick: (fn: () => void) => void
        }
        BackButton: {
          show: () => void
          hide: () => void
          onClick: (fn: () => void) => void
        }
        showAlert: (message: string) => void
        showConfirm: (message: string, callback: (ok: boolean) => void) => void
        close: () => void
      }
    }
  }
}
