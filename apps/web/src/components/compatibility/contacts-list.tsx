'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import Link from 'next/link'

interface Contact {
  id: string
  name: string
  relation: string
  birthDate: string
}

const RELATION_LABELS: Record<string, string> = {
  partner: '💑 Партнёр',
  friend: '👫 Друг',
  colleague: '💼 Коллега',
  family: '👨‍👩‍👧 Семья',
  other: '👤 Другое',
}

export function ContactsList() {
  const { data } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => apiClient.get<Contact[]>('/users/contacts'),
  })

  if (!data?.length) {
    return (
      <p className="text-center text-sm py-12" style={{ color: 'rgba(255,255,255,.6)' }}>
        Добавьте первый контакт, чтобы рассчитать астрологическую совместимость
      </p>
    )
  }

  return (
    <div className="space-y-2.5">
      {data.map((contact) => (
        <Link
          key={contact.id}
          href={`/compatibility/${contact.id}`}
          className="flex items-center gap-3.5 p-4 rounded-[18px] transition-all"
          style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', backdropFilter: 'blur(14px)' }}
        >
          <div
            className="w-[44px] h-[44px] rounded-full flex items-center justify-center text-[18px] font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(150deg,#8B5CF6,#3a2a66)', border: '1.5px solid rgba(226,183,85,.4)', boxShadow: '0 0 14px rgba(139,92,246,.35)', fontFamily: 'var(--font-serif)' }}
          >
            {contact.name.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="font-medium text-[15px] text-white">{contact.name}</p>
            <p className="text-[12px]" style={{ color: 'rgba(255,255,255,.5)' }}>
              {RELATION_LABELS[contact.relation] ?? contact.relation}
            </p>
          </div>
          <span className="text-[18px]" style={{ color: '#E2B755' }}>›</span>
        </Link>
      ))}
    </div>
  )
}
