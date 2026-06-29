export type NotificationChannel = 'telegram' | 'push' | 'in_app'

export type NotificationType =
  | 'daily_horoscope'
  | 'transit_alert'
  | 'moon_phase'
  | 'angel_number'
  | 'mood_reminder'
  | 'compatibility_day'
  | 'lunar_calendar'

export interface NotificationPreferences {
  userId: string
  channels: NotificationChannel[]
  dailyHoroscopeTime: string    // "08:00"
  timezone: string
  enabled: Record<NotificationType, boolean>
  updatedAt: string
}

export interface ScheduledNotification {
  id: string
  userId: string
  type: NotificationType
  channel: NotificationChannel
  title: string
  body: string
  scheduledAt: string
  sentAt?: string
  payload?: Record<string, unknown>
}
