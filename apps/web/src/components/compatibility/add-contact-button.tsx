'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export function AddContactButton() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', birthDate: '', relation: 'friend' })
  const qc = useQueryClient()

  const create = useMutation({
    mutationFn: () => apiClient.post('/users/contacts', form),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['contacts'] })
      setOpen(false)
      setForm({ name: '', birthDate: '', relation: 'friend' })
    },
  })

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-sm font-medium"
      >
        + Добавить
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
          <div className="w-full bg-[var(--color-surface)] rounded-t-2xl p-6 space-y-4">
            <h3 className="font-bold text-lg">Новый контакт</h3>
            <input
              placeholder="Имя"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full bg-[var(--color-surface-2)] rounded-xl px-4 py-3 text-sm outline-none"
            />
            <input
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))}
              className="w-full bg-[var(--color-surface-2)] rounded-xl px-4 py-3 text-sm outline-none"
            />
            <div className="flex gap-2">
              <button onClick={() => setOpen(false)} className="flex-1 py-3 rounded-xl bg-[var(--color-surface-2)] text-sm">
                Отмена
              </button>
              <button
                onClick={() => create.mutate()}
                disabled={!form.name || !form.birthDate}
                className="flex-1 py-3 rounded-xl bg-[var(--color-primary)] text-sm disabled:opacity-40"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
