'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'

export function ProfileForm() {
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()
  const [form, setForm] = useState({
    birthDate: user?.birthDate?.split('T')[0] ?? '',
    birthTime: user?.birthTime ?? '',
    birthPlace: user?.birthPlace ?? '',
  })

  const update = useMutation({
    mutationFn: () => apiClient.patch('/users/me', form),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['natal-chart'] }),
  })

  return (
    <div className="rounded-2xl bg-[var(--color-surface)] p-4 space-y-4">
      <p className="text-sm font-medium">Данные рождения</p>
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs text-[var(--color-text-muted)]">Дата рождения</label>
          <input
            type="date"
            value={form.birthDate}
            onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))}
            className="w-full bg-[var(--color-surface-2)] rounded-xl px-4 py-3 text-sm outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[var(--color-text-muted)]">Время рождения (необязательно)</label>
          <input
            type="time"
            value={form.birthTime}
            onChange={(e) => setForm((f) => ({ ...f, birthTime: e.target.value }))}
            className="w-full bg-[var(--color-surface-2)] rounded-xl px-4 py-3 text-sm outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[var(--color-text-muted)]">Место рождения</label>
          <input
            value={form.birthPlace}
            onChange={(e) => setForm((f) => ({ ...f, birthPlace: e.target.value }))}
            placeholder="Москва, Россия"
            className="w-full bg-[var(--color-surface-2)] rounded-xl px-4 py-3 text-sm outline-none"
          />
        </div>
      </div>
      <button
        onClick={() => update.mutate()}
        disabled={update.isPending}
        className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-sm font-medium disabled:opacity-40"
      >
        {update.isPending ? 'Сохранение...' : 'Сохранить'}
      </button>
    </div>
  )
}
