'use client'

import { usePersonalCycle } from '@/hooks/use-numerology'

export function PersonalCycleChart() {
  const { data } = usePersonalCycle()

  if (!data) return null

  return (
    <div className="rounded-2xl bg-[var(--color-surface)] p-4 space-y-3">
      <p className="text-sm font-medium">Личные циклы</p>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="space-y-1">
          <p className="text-2xl font-bold text-[var(--color-primary-light)]">{data.personalDay}</p>
          <p className="text-xs text-[var(--color-text-muted)]">День</p>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-[var(--color-gold)]">{data.personalMonth}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Месяц</p>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-[var(--color-accent)]">{data.personalYear}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Год</p>
        </div>
      </div>
    </div>
  )
}
