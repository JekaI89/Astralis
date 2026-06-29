'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { getMoonPhaseEmoji } from '@astralis/core'
import type { LunarDay } from '@astralis/types'

const RECOMMENDATION_COLORS = {
  excellent: 'text-green-400',
  good: 'text-green-300',
  neutral: 'text-[var(--color-text-muted)]',
  avoid: 'text-red-400',
}

export function LunarCalendarGrid() {
  const now = new Date()

  const { data } = useQuery({
    queryKey: ['lunar-calendar', now.getFullYear(), now.getMonth() + 1],
    queryFn: () =>
      apiClient.get<LunarDay[]>(
        `/astro/lunar-calendar?year=${now.getFullYear()}&month=${now.getMonth() + 1}`,
      ),
  })

  if (!data) return <div className="h-96 rounded-2xl bg-[var(--color-surface)] animate-pulse" />

  return (
    <div className="space-y-3">
      {/* Легенда */}
      <div className="flex gap-3 text-xs flex-wrap">
        <span className={RECOMMENDATION_COLORS.excellent}>● Отлично</span>
        <span className={RECOMMENDATION_COLORS.good}>● Хорошо</span>
        <span className={RECOMMENDATION_COLORS.neutral}>● Нейтрально</span>
        <span className={RECOMMENDATION_COLORS.avoid}>● Избегать</span>
      </div>

      {/* Сетка дней */}
      <div className="grid grid-cols-7 gap-1">
        {data.map((day) => {
          const date = new Date(day.date)
          const isToday = day.date === new Date().toISOString().split('T')[0]
          return (
            <button
              key={day.date}
              className={`rounded-lg p-1.5 text-center space-y-0.5 transition-colors ${
                isToday ? 'bg-[var(--color-primary)]/30' : 'bg-[var(--color-surface)]'
              }`}
            >
              <p className="text-xs text-[var(--color-text-muted)]">{date.getDate()}</p>
              <p className="text-base">{getMoonPhaseEmoji(day.moonPhase)}</p>
              <p className="text-[9px] text-[var(--color-text-muted)]">{day.lunarDay}л</p>
              <div className="flex justify-center gap-0.5">
                <span className={`text-[6px] ${RECOMMENDATION_COLORS[day.recommendations.haircut]}`}>✂</span>
                <span className={`text-[6px] ${RECOMMENDATION_COLORS[day.recommendations.beauty]}`}>💄</span>
                <span className={`text-[6px] ${RECOMMENDATION_COLORS[day.recommendations.business]}`}>💼</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
