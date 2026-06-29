'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { getTodayIso, PLANET_NAMES_RU } from '@astralis/core'
import type { Transit } from '@astralis/types'

export function TransitsPanel() {
  const { data } = useQuery({
    queryKey: ['transits', getTodayIso()],
    queryFn: () => apiClient.get<Transit[]>(`/astro/transits?date=${getTodayIso()}`),
  })

  if (!data?.length) return null

  const highImpact = data.filter((t) => t.intensity === 'high')

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Что на небе прямо сейчас</p>
      <div className="space-y-2">
        {highImpact.slice(0, 5).map((transit, i) => (
          <div key={i} className="rounded-xl bg-[var(--color-surface)] p-3 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {PLANET_NAMES_RU[transit.transitingPlanet]} → {PLANET_NAMES_RU[transit.natalPlanet]}
              </p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-accent)] text-white">
                Дом {transit.house}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">{transit.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
