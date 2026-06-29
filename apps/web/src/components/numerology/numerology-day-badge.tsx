'use client'

import { usePersonalCycle } from '@/hooks/use-numerology'

export function NumerologyDayBadge() {
  const { data } = usePersonalCycle()

  if (!data) return null

  return (
    <div className="rounded-2xl bg-[var(--color-surface)] p-4 flex flex-col justify-between">
      <p className="text-xs text-[var(--color-text-muted)]">Число дня</p>
      <div className="flex items-end gap-2 mt-2">
        <span className="text-4xl font-bold text-[var(--color-primary-light)]">
          {data.personalDay}
        </span>
      </div>
      <p className="text-xs text-[var(--color-text-muted)] mt-1">
        Год {data.personalYear} · Месяц {data.personalMonth}
      </p>
    </div>
  )
}
