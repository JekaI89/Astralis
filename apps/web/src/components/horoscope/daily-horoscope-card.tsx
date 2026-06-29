'use client'

import { useDailyHoroscope } from '@/hooks/use-daily-horoscope'
import { getEnergyEmoji, getEnergyLabel } from '@astralis/core'
import { formatDateRu } from '@astralis/core'

export function DailyHoroscopeCard() {
  const { data, isLoading } = useDailyHoroscope()

  if (isLoading) return <DailyHoroscopeCardSkeleton />

  if (!data) return null

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#1E1E38] to-[#2A1A4A] p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--color-text-muted)]">{formatDateRu(data.date)}</p>
        <span className="text-sm">
          {getEnergyEmoji(data.energy)} {getEnergyLabel(data.energy)}
        </span>
      </div>

      <h2 className="text-lg font-semibold leading-snug">{data.headline}</h2>

      <p className="text-sm text-[var(--color-text-muted)] leading-relaxed line-clamp-3">
        {data.generalForecast}
      </p>

      {data.numerologyNote && (
        <div className="rounded-xl bg-[var(--color-surface-2)] px-3 py-2">
          <p className="text-xs text-[var(--color-primary-light)]">
            🔢 Число дня: {data.personalDayNumber} · {data.numerologyNote}
          </p>
        </div>
      )}

      <p className="text-sm italic text-[var(--color-gold)]">✨ {data.affirmation}</p>
    </div>
  )
}

function DailyHoroscopeCardSkeleton() {
  return (
    <div className="rounded-2xl bg-[var(--color-surface)] p-5 space-y-3 animate-pulse">
      <div className="h-3 bg-[var(--color-border)] rounded w-1/3" />
      <div className="h-5 bg-[var(--color-border)] rounded w-3/4" />
      <div className="h-3 bg-[var(--color-border)] rounded w-full" />
      <div className="h-3 bg-[var(--color-border)] rounded w-2/3" />
    </div>
  )
}
