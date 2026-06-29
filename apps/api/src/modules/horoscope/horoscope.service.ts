import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { AstroService } from '../astro/astro.service'
import { NumerologyService } from '../numerology/numerology.service'
import { calculatePersonalCycle } from '@astralis/core'
import { synthesizeDayForecast } from '@astralis/core'
import type { PersonalDayForecast } from '@astralis/types'

@Injectable()
export class HoroscopeService {
  constructor(
    private prisma: PrismaService,
    private astro: AstroService,
    private numerology: NumerologyService,
  ) {}

  async getDailyForecast(userId: string, date: string): Promise<PersonalDayForecast> {
    const cached = await this.prisma.dailyHoroscope.findUnique({
      where: { userId_date: { userId, date: new Date(date) } },
    })
    if (cached) return cached.data as PersonalDayForecast

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } })
    const birthDateStr = user.birthDate.toISOString().split('T')[0]!

    const [transits, lunarDay] = await Promise.all([
      this.astro.getCurrentTransits(userId, date),
      this.astro.getLunarDay(date),
    ])

    const personalCycle = calculatePersonalCycle(birthDateStr, date)

    // В продакшне текст гороскопа генерирует AI модуль или берётся из CMS
    const baseForecast: PersonalDayForecast = {
      id: `${userId}-${date}`,
      userId,
      date,
      sign: 'aries', // берётся из натальной карты
      headline: 'День возможностей и внутренней силы',
      generalForecast: 'Планеты благоволят активным действиям...',
      loveForecast: 'В личной жизни акцент на честность...',
      careerForecast: 'Профессиональная сфера требует концентрации...',
      healthForecast: 'Уделите внимание сну и восстановлению...',
      luckyNumber: personalCycle.personalDay,
      luckyColor: '#9B5DE5',
      luckyTime: '14:00–16:00',
      energy: 7,
      affirmation: 'Я создаю свой день намеренно и с радостью',
      transitHighlights: transits.filter((t) => t.intensity === 'high').map((t) => t.description),
      personalDayNumber: personalCycle.personalDay,
      personalDaySynthesis: '',
      keyTransits: transits.filter((t) => t.intensity === 'high'),
      createdAt: new Date().toISOString(),
    }

    const forecast = synthesizeDayForecast(baseForecast, personalCycle)

    await this.prisma.dailyHoroscope.create({
      data: { userId, date: new Date(date), data: forecast as object },
    })

    void lunarDay

    return forecast
  }
}
