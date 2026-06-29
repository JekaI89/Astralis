import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from '../../prisma/prisma.service'
import { PushService } from './push.service'
import { HoroscopeService } from '../horoscope/horoscope.service'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name)

  constructor(
    private prisma: PrismaService,
    private push: PushService,
    private horoscope: HoroscopeService,
    private config: ConfigService,
  ) {}

  // Каждый час проверяем, у кого наступил запланированный час рассылки
  @Cron(CronExpression.EVERY_HOUR)
  async sendDailyHoroscopes() {
    const currentHour = new Date().getUTCHours()
    const today = new Date().toISOString().split('T')[0]!

    const prefs = await this.prisma.notificationPreference.findMany({
      where: {
        channels: { has: 'telegram' },
      },
      include: { user: true },
    })

    for (const pref of prefs) {
      if (!pref.enabled || !pref.user.telegramId) continue
      const [prefHour] = pref.dailyTime.split(':').map(Number)
      if (prefHour !== currentHour) continue

      try {
        const forecast = await this.horoscope.getDailyForecast(pref.userId, today)
        const text = `🌟 <b>Ваш прогноз на сегодня</b>\n\n${forecast.headline}\n\n✨ <i>${forecast.affirmation}</i>`

        await this.push.sendTelegram(
          Number(pref.user.telegramId),
          text,
          this.config.get('TELEGRAM_BOT_TOKEN') ?? '',
        )
      } catch (err) {
        this.logger.error(`Failed to send horoscope to user ${pref.userId}:`, err)
      }
    }
  }
}
