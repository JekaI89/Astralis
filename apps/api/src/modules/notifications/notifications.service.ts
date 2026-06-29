import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import type { NotificationPreferences } from '@astralis/types'

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getPreferences(userId: string): Promise<NotificationPreferences> {
    const pref = await this.prisma.notificationPreference.findUnique({ where: { userId } })
    if (!pref) {
      return {
        userId,
        channels: ['telegram'],
        dailyHoroscopeTime: '08:00',
        timezone: 'Europe/Moscow',
        enabled: {
          daily_horoscope: true,
          transit_alert: true,
          moon_phase: true,
          angel_number: false,
          mood_reminder: true,
          compatibility_day: false,
          lunar_calendar: false,
        },
        updatedAt: new Date().toISOString(),
      }
    }
    return {
      userId: pref.userId,
      channels: pref.channels as ('telegram' | 'push' | 'in_app')[],
      dailyHoroscopeTime: pref.dailyTime,
      timezone: pref.timezone,
      enabled: pref.enabled as NotificationPreferences['enabled'],
      updatedAt: pref.updatedAt.toISOString(),
    }
  }

  async updatePreferences(userId: string, prefs: Partial<NotificationPreferences>) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      update: {
        channels: prefs.channels,
        dailyTime: prefs.dailyHoroscopeTime,
        timezone: prefs.timezone,
        enabled: prefs.enabled as object,
      },
      create: {
        userId,
        channels: prefs.channels ?? ['telegram'],
        dailyTime: prefs.dailyHoroscopeTime ?? '08:00',
        timezone: prefs.timezone ?? 'Europe/Moscow',
        enabled: (prefs.enabled ?? {}) as object,
      },
    })
  }
}
