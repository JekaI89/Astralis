'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { getTodayIso } from '@astralis/core'
import type { MoodValue, MoodEmoji } from '@astralis/types'

const MOOD_OPTIONS: { value: MoodValue; emoji: MoodEmoji; label: string }[] = [
  { value: 2, emoji: '😢', label: 'Плохо' },
  { value: 4, emoji: '😐', label: 'Нейтрально' },
  { value: 6, emoji: '😊', label: 'Хорошо' },
  { value: 8, emoji: '😄', label: 'Отлично' },
  { value: 9, emoji: '🤩', label: 'Восторг' },
]

export function MoodTrackerWidget() {
  const [selected, setSelected] = useState<MoodValue | null>(null)
  const queryClient = useQueryClient()

  const log = useMutation({
    mutationFn: ({ mood, emoji }: { mood: MoodValue; emoji: MoodEmoji }) =>
      apiClient.post('/mood/log', { date: getTodayIso(), mood, emoji }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['mood'] })
    },
  })

  const handleSelect = (value: MoodValue, emoji: MoodEmoji) => {
    setSelected(value)
    log.mutate({ mood: value, emoji })
  }

  return (
    <div className="rounded-2xl bg-[var(--color-surface)] p-4 space-y-3">
      <p className="text-sm font-medium">Как вы себя чувствуете сегодня?</p>
      <div className="flex justify-between">
        {MOOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value, opt.emoji)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              selected === opt.value
                ? 'bg-[var(--color-primary)] scale-110'
                : 'hover:bg-[var(--color-surface-2)]'
            }`}
          >
            <span className="text-2xl">{opt.emoji}</span>
            <span className="text-[9px] text-[var(--color-text-muted)]">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
