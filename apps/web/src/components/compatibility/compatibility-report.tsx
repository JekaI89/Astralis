'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { getSynastryLabel, getSynastryColor } from '@astralis/core'
import type { CompatibilityReport as Report } from '@astralis/types'

interface Props {
  contactId: string
}

export function CompatibilityReport({ contactId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['compatibility', contactId],
    queryFn: () => apiClient.get<Report>(`/compatibility/${contactId}`),
  })

  if (isLoading) return <div className="h-64 rounded-2xl bg-[var(--color-surface)] animate-pulse" />
  if (!data) return null

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Совместимость с {data.contactName}</h2>

      {/* Спидометр совместимости */}
      <div className="rounded-2xl bg-[var(--color-surface)] p-5 text-center space-y-2">
        <p className="text-5xl font-bold" style={{ color: getSynastryColor(data.combinedScore) }}>
          {data.combinedScore}%
        </p>
        <p className="text-sm text-[var(--color-text-muted)]">{getSynastryLabel(data.combinedScore)}</p>
      </div>

      {/* Детальные показатели */}
      <div className="rounded-2xl bg-[var(--color-surface)] p-4 space-y-3">
        {Object.entries(data.synastryScore).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="capitalize text-[var(--color-text-muted)]">{key}</span>
              <span>{value}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--color-border)]">
              <div
                className="h-1.5 rounded-full transition-all"
                style={{ width: `${value}%`, backgroundColor: getSynastryColor(value) }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Нумерологический союз */}
      <div className="rounded-2xl bg-[var(--color-surface)] p-4 space-y-2">
        <p className="text-sm font-medium">🔢 Число союза: {data.unionNumber}</p>
        <p className="text-sm text-[var(--color-text-muted)]">{data.unionDescription}</p>
      </div>

      {/* Сильные стороны */}
      <div className="rounded-2xl bg-[var(--color-surface)] p-4 space-y-2">
        <p className="text-sm font-medium text-green-400">Сильные стороны</p>
        {data.strengths.map((s) => (
          <p key={s} className="text-sm text-[var(--color-text-muted)]">✓ {s}</p>
        ))}
      </div>
    </div>
  )
}
