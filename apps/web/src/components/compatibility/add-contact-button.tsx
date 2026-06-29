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

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,.06)',
    border: '1px solid rgba(255,255,255,.14)',
    borderRadius: 16,
    padding: '14px 16px',
    fontSize: 14,
    color: '#fff',
    outline: 'none',
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-[14px] text-[13.5px] font-semibold text-[#0A0915]"
        style={{ background: 'linear-gradient(135deg,#E2B755,#c89a3d)', boxShadow: '0 6px 18px -6px rgba(226,183,85,.6)' }}
      >
        + Партнёр
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end"
          style={{ background: 'rgba(5,4,12,.6)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full anim-sheetup"
            style={{
              background: 'linear-gradient(180deg,#1a1330,#120c22)',
              borderTop: '1px solid rgba(226,183,85,.3)',
              borderRadius: '30px 30px 0 0',
              padding: '22px 24px 40px',
              boxShadow: '0 -20px 50px -10px rgba(0,0,0,.7)',
            }}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'rgba(255,255,255,.22)' }} />
            <h3 className="text-[21px] text-white mb-5" style={{ fontFamily: 'var(--font-serif)' }}>Добавить партнёра</h3>
            <div className="space-y-3">
              <input
                placeholder="Имя"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                style={inputStyle}
              />
              <input
                type="date"
                value={form.birthDate}
                onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div className="flex gap-2.5 mt-5">
              <button onClick={() => setOpen(false)}
                className="flex-1 py-3.5 rounded-[16px] text-[13.5px]"
                style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.16)', color: 'rgba(255,255,255,.75)' }}>
                Отмена
              </button>
              <button
                onClick={() => create.mutate()}
                disabled={!form.name || !form.birthDate}
                className="flex-1 py-3.5 rounded-[16px] text-[13.5px] font-semibold text-[#0A0915] disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#E2B755,#c89a3d)', boxShadow: '0 8px 24px -8px rgba(226,183,85,.6)' }}
              >
                Рассчитать
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
