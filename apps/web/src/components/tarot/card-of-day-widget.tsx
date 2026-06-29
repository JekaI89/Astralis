'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { getTodayIso } from '@astralis/core'
import type { TarotCard } from '@astralis/types'
import Image from 'next/image'

export function CardOfDayWidget() {
  const { data } = useQuery({
    queryKey: ['tarot', 'daily', getTodayIso()],
    queryFn: () => apiClient.get<TarotCard>(`/tarot/daily?date=${getTodayIso()}`),
  })

  if (!data) return null

  return (
    <div className="rounded-2xl bg-[var(--color-surface)] p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-medium">🃏 Карта дня</span>
        <span className="text-xs text-[var(--color-text-muted)]">{data.nameRu}</span>
        {data.isReversed && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-accent)] text-white">
            Перевёрнутая
          </span>
        )}
      </div>
      <div className="flex gap-4">
        <div className={`w-16 h-24 rounded-lg overflow-hidden flex-shrink-0 ${data.isReversed ? 'rotate-180' : ''}`}>
          <Image src={data.imageUrl} alt={data.nameRu} width={64} height={96} className="object-cover" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap gap-1">
            {(data.isReversed ? data.keywordReversed : data.keywordUpright).slice(0, 3).map((kw) => (
              <span key={kw} className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
                {kw}
              </span>
            ))}
          </div>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed line-clamp-3">
            {data.isReversed ? data.descriptionReversed : data.descriptionUpright}
          </p>
        </div>
      </div>
    </div>
  )
}
