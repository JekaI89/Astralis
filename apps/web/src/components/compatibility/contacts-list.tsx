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
      <p className="text-center text-[var(--color-text-muted)] text-sm py-12">
        Добавьте первый контакт, чтобы проверить совместимость
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {data.map((contact) => (
        <Link
          key={contact.id}
          href={`/compatibility/${contact.id}`}
          className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-lg font-bold">
            {contact.name[0]}
          </div>
          <div className="flex-1">
            <p className="font-medium">{contact.name}</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {RELATION_LABELS[contact.relation] ?? contact.relation}
            </p>
          </div>
          <span className="text-[var(--color-text-muted)]">›</span>
        </Link>
      ))}
    </div>
  )
}
