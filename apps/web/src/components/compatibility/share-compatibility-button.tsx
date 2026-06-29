'use client'

import { buildCompatibilityShareText, buildReferralUrl, shareNative } from '@astralis/core'
import { useAuthStore } from '@/stores/auth-store'

interface Props {
  contactId: string
}

export function ShareCompatibilityButton({ contactId }: Props) {
  const user = useAuthStore((s) => s.user)

  const handleShare = async () => {
    if (!user) return
    const url = buildReferralUrl(
      process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.astralis.io',
      contactId,
    )
    const text = buildCompatibilityShareText(user.name, 'партнёра', 88)
    const shared = await shareNative({ title: 'Astralis', text, url })
    if (!shared) {
      await navigator.clipboard.writeText(url)
    }
  }

  return (
    <button
      onClick={() => void handleShare()}
      className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white font-medium"
    >
      📤 Поделиться результатом
    </button>
  )
}
