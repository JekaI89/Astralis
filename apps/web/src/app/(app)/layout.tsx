'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/navigation/bottom-nav'
import { TelegramInit } from '@/components/telegram/telegram-init'
import { useAuthStore } from '@/stores/auth-store'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const birthData = useAuthStore((s) => s.birthData)

  useEffect(() => {
    if (!token && !birthData) {
      router.replace('/onboarding')
    }
  }, [token, birthData, router])

  if (!token && !birthData) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TelegramInit />
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
    </div>
  )
}
