'use client'

import { useNatalChart } from '@/hooks/use-natal-chart'
import { ZODIAC_NAMES_RU, PLANET_NAMES_RU, ZODIAC_EMOJIS } from '@astralis/core'

export function NatalChartView() {
  const { data, isLoading } = useNatalChart()

  if (isLoading) return <div className="h-48 rounded-2xl bg-[var(--color-surface)] animate-pulse" />

  if (!data) return null

  const sun = data.planets.find((p) => p.planet === 'sun')
  const moon = data.planets.find((p) => p.planet === 'moon')

  return (
    <div className="rounded-2xl bg-[var(--color-surface)] p-5 space-y-4">
      {/* Главные показатели */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-xs text-[var(--color-text-muted)]">Солнце</p>
          <p className="text-xl">{sun ? ZODIAC_EMOJIS[sun.sign] : '?'}</p>
          <p className="text-xs font-medium">{sun ? ZODIAC_NAMES_RU[sun.sign] : '—'}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--color-text-muted)]">Луна</p>
          <p className="text-xl">{moon ? ZODIAC_EMOJIS[moon.sign] : '?'}</p>
          <p className="text-xs font-medium">{moon ? ZODIAC_NAMES_RU[moon.sign] : '—'}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--color-text-muted)]">Асцендент</p>
          <p className="text-xl">{ZODIAC_EMOJIS[data.ascendant.sign]}</p>
          <p className="text-xs font-medium">{ZODIAC_NAMES_RU[data.ascendant.sign]}</p>
        </div>
      </div>

      {/* Планеты по знакам */}
      <div className="space-y-2">
        {data.planets.slice(0, 7).map((p) => (
          <div key={p.planet} className="flex items-center justify-between text-sm">
            <span className="text-[var(--color-text-muted)] w-28">{PLANET_NAMES_RU[p.planet]}</span>
            <span>{ZODIAC_EMOJIS[p.sign]} {ZODIAC_NAMES_RU[p.sign]}</span>
            <span className="text-[var(--color-text-muted)] text-xs">Дом {p.house}</span>
            {p.isRetrograde && <span className="text-[var(--color-accent)] text-xs">Rx</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
