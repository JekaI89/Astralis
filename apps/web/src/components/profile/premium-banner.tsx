'use client'

import { useAuthStore } from '@/stores/auth-store'

export function PremiumBanner() {
  const user = useAuthStore((s) => s.user)

  if (user?.isPremium) return null

  return (
    <div className="rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] p-4 space-y-2">
      <p className="font-bold">✨ Astralis Premium</p>
      <p className="text-sm opacity-90">
        ИИ-астролог, полный разбор карты, синастрия и без рекламы
      </p>
      <button className="w-full py-2 rounded-xl bg-white/20 text-sm font-medium">
        Попробовать 7 дней бесплатно
      </button>
    </div>
  )
}
