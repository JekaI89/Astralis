'use client'

import { useState } from 'react'

const CHAPTERS = [
  { id: 'character', label: 'Характер', planet: 'Солнце ☉', icon: '☀️' },
  { id: 'emotions',  label: 'Эмоции',   planet: 'Луна ☽',   icon: '🌙' },
  { id: 'mind',      label: 'Интеллект', planet: 'Меркурий ☿', icon: '💬' },
  { id: 'love',      label: 'Любовь',    planet: 'Венера ♀', icon: '❤️' },
  { id: 'career',    label: 'Карьера',   planet: 'X Дом',    icon: '🏆' },
]

export function ChartChaptersNav() {
  const [active, setActive] = useState('character')

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-[var(--color-text-muted)]">Главы карты</p>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CHAPTERS.map((ch) => (
          <button
            key={ch.id}
            onClick={() => setActive(ch.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm transition-colors ${
              active === ch.id
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'
            }`}
          >
            {ch.icon} {ch.label}
          </button>
        ))}
      </div>
      {/* Контент главы — будет заполнен данными карты */}
      <div className="rounded-xl bg-[var(--color-surface)] p-4 min-h-[120px]">
        <p className="text-sm text-[var(--color-text-muted)]">
          {CHAPTERS.find((c) => c.id === active)?.planet}
        </p>
      </div>
    </div>
  )
}
