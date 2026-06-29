'use client'

import { CompatibilityReport } from '@/components/compatibility/compatibility-report'
import { ShareCompatibilityButton } from '@/components/compatibility/share-compatibility-button'
import { useAuthStore } from '@/stores/auth-store'

interface Props {
  params: { contactId: string }
}

export default function CompatibilityDetailPage({ params }: Props) {
  const user = useAuthStore((s) => s.user)
  const birthData = useAuthStore((s) => s.birthData)
  const name = user?.name ?? birthData?.name ?? 'Вы'
  const initial = name.charAt(0).toUpperCase()

  return (
    <div className="px-4 pt-4 pb-8">
      <div className="text-center mb-2">
        <div className="text-[11px] font-medium uppercase tracking-[2.5px]"
          style={{ color: 'rgba(226,183,85,.85)' }}>
          Синастрия
        </div>
        <h1 className="text-[26px] text-white mt-1" style={{ fontFamily: 'var(--font-serif)' }}>
          Совместимость
        </h1>
      </div>
      <CompatibilityReport
        contactId={params.contactId}
        contactName="Партнёр"
        userInitial={initial}
      />
      <div className="mt-6">
        <ShareCompatibilityButton contactId={params.contactId} />
      </div>
    </div>
  )
}
