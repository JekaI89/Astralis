'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { getMoonPhaseEmoji, getMoonPhaseNameRu, getTodayIso } from '@astralis/core'
import type { LunarDay } from '@astralis/types'

export function LunarDayWidget() {
  const { data } = useQuery({
    queryKey: ['lunar-day', getTodayIso()],
    queryFn: () => apiClient.get<LunarDay>(`/astro/lunar-day?date=${getTodayIso()}`),
  })

  if (!data) return null

  return (
    <div className="rounded-2xl bg-[var(--color-surface)] p-4 flex flex-col justify-between">
      <p className="text-xs text-[var(--color-text-muted)]">Лунный день</p>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-3xl">{getMoonPhaseEmoji(data.moonPhase)}</span>
        <span className="text-2xl font-bold">{data.lunarDay}</span>
      </div>
      <p className="text-xs text-[var(--color-text-muted)] mt-1">
        {getMoonPhaseNameRu(data.moonPhase)}
      </p>
    </div>
  )
}
