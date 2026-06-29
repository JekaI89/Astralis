'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { ArbitraryNumberAnalysis } from '@astralis/types'

export function NumberAnalyzerTool() {
  const [input, setInput] = useState('')

  const analyze = useMutation({
    mutationFn: (inp: string) =>
      apiClient.post<ArbitraryNumberAnalysis>('/numerology/analyze', { input: inp }),
  })

  return (
    <div className="rounded-2xl bg-[var(--color-surface)] p-4 space-y-3">
      <p className="text-sm font-medium">🔍 Анализ числа</p>
      <p className="text-xs text-[var(--color-text-muted)]">
        Введите номер квартиры, машины, телефона или дату события
      </p>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Например: А123ВС"
          className="flex-1 bg-[var(--color-surface-2)] rounded-xl px-4 py-3 text-sm outline-none"
        />
        <button
          onClick={() => analyze.mutate(input)}
          disabled={!input || analyze.isPending}
          className="px-4 py-3 bg-[var(--color-primary)] rounded-xl disabled:opacity-40"
        >
          →
        </button>
      </div>

      {analyze.data && (
        <div className="rounded-xl bg-[var(--color-surface-2)] p-3 space-y-2">
          <p className="text-sm">
            Число вибрации:{' '}
            <span className="text-[var(--color-primary-light)] font-bold text-lg">
              {analyze.data.reducedNumber}
            </span>
          </p>
          <p className="text-sm font-medium">{analyze.data.interpretation.title}</p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {analyze.data.interpretation.description}
          </p>
        </div>
      )}
    </div>
  )
}
