'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { NotificationPreferences, NotificationType } from '@astralis/types'

const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  daily_horoscope: '🌟 Ежедневный гороскоп',
  transit_alert: '⚡ Важные транзиты',
  moon_phase: '🌕 Фазы Луны',
  angel_number: '✨ Ангельские числа',
  mood_reminder: '😊 Напоминание о настроении',
  compatibility_day: '💫 Прогноз для пары',
  lunar_calendar: '📅 Лунный календарь',
}

export function NotificationSettings() {
  const qc = useQueryClient()

  const { data } = useQuery({
    queryKey: ['notifications', 'prefs'],
    queryFn: () => apiClient.get<NotificationPreferences>('/notifications/preferences'),
  })

  const update = useMutation({
    mutationFn: (prefs: Partial<NotificationPreferences>) =>
      apiClient.patch('/notifications/preferences', prefs),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  if (!data) return null

  const toggleNotification = (type: NotificationType) => {
    update.mutate({
      enabled: { ...data.enabled, [type]: !data.enabled[type] },
    })
  }

  return (
    <div className="rounded-2xl bg-[var(--color-surface)] p-4 space-y-3">
      <p className="text-sm font-medium">Уведомления</p>
      <div className="space-y-1">
        <label className="text-xs text-[var(--color-text-muted)]">Время рассылки</label>
        <input
          type="time"
          value={data.dailyHoroscopeTime}
          onChange={(e) => update.mutate({ dailyHoroscopeTime: e.target.value })}
          className="w-full bg-[var(--color-surface-2)] rounded-xl px-4 py-3 text-sm outline-none"
        />
      </div>
      <div className="space-y-2">
        {(Object.keys(NOTIFICATION_LABELS) as NotificationType[]).map((type) => (
          <div key={type} className="flex items-center justify-between">
            <span className="text-sm">{NOTIFICATION_LABELS[type]}</span>
            <button
              onClick={() => toggleNotification(type)}
              className={`w-10 h-6 rounded-full transition-colors ${
                data.enabled[type] ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
              }`}
            >
              <span
                className={`block w-4 h-4 bg-white rounded-full mx-1 transition-transform ${
                  data.enabled[type] ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
