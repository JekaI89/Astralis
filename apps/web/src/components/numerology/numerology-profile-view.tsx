'use client'

import { useNumerologyProfile } from '@/hooks/use-numerology'
import { getNumberInterpretation } from '@astralis/core'

export function NumerologyProfileView() {
  const { data, isLoading } = useNumerologyProfile()

  if (isLoading) return <div className="h-40 rounded-2xl bg-[var(--color-surface)] animate-pulse" />
  if (!data) return null

  const lifePath = getNumberInterpretation(data.lifePathNumber)

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#1A1A3A] to-[#2A1A3A] p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[var(--color-text-muted)]">Число жизненного пути</p>
          <p className="text-5xl font-bold text-[var(--color-primary-light)]">{data.lifePathNumber}</p>
          <p className="text-sm font-medium mt-1">{lifePath.title}</p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-xs text-[var(--color-text-muted)]">Выражение: <span className="text-white">{data.expressionNumber}</span></p>
          <p className="text-xs text-[var(--color-text-muted)]">Душа: <span className="text-white">{data.soulUrgeNumber}</span></p>
          <p className="text-xs text-[var(--color-text-muted)]">Личность: <span className="text-white">{data.personalityNumber}</span></p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {lifePath.keywords.map((kw) => (
          <span key={kw} className="text-xs px-3 py-1 rounded-full bg-[var(--color-primary)]/30 text-[var(--color-primary-light)]">
            {kw}
          </span>
        ))}
      </div>

      <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
        {lifePath.description}
      </p>
    </div>
  )
}
