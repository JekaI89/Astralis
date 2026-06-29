import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { SwissEphemerisService, geocodeCity } from './swiss-ephemeris.service'
import type { NatalChart, LunarDay, Transit } from '@astralis/types'

@Injectable()
export class AstroService {
  constructor(
    private prisma: PrismaService,
    private ephemeris: SwissEphemerisService,
  ) {}

  async getNatalChart(userId: string): Promise<NatalChart> {
    const cached = await this.prisma.natalChart.findUnique({ where: { userId } })
    if (cached) return cached.data as unknown as NatalChart

    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user?.birthDate) {
      throw new NotFoundException('Birth data not set. Please complete your profile.')
    }

    let lat = user.birthLat
    let lng = user.birthLng
    let timezone = user.timezone ?? 'UTC'

    if ((!lat || !lng) && user.birthPlace) {
      const geo = await geocodeCity(user.birthPlace)
      if (geo) {
        lat = geo.lat
        lng = geo.lng
        timezone = geo.timezone
        await this.prisma.user.update({
          where: { id: userId },
          data: { birthLat: lat, birthLng: lng, timezone },
        })
      }
    }

    if (!lat || !lng) {
      throw new NotFoundException('Birth location not set. Please complete your profile.')
    }

    const chart = await this.ephemeris.calculateNatalChart({
      date: user.birthDate.toISOString().split('T')[0]!,
      time: user.birthTime ?? '12:00',
      lat,
      lng,
      timezone,
    })

    await this.prisma.natalChart.create({
      data: { userId, data: chart as object },
    })

    return chart
  }

  async getCurrentTransits(userId: string, date: string): Promise<Transit[]> {
    const chart = await this.getNatalChart(userId)
    return this.ephemeris.getTransits(chart, date)
  }

  async getLunarDay(date: string): Promise<LunarDay> {
    return this.ephemeris.getLunarDay(date)
  }

  async getLunarCalendar(year: number, month: number): Promise<LunarDay[]> {
    const daysInMonth = new Date(year, month, 0).getDate()
    const promises = Array.from({ length: daysInMonth }, (_, i) => {
      const day = String(i + 1).padStart(2, '0')
      const monthStr = String(month).padStart(2, '0')
      return this.ephemeris.getLunarDay(`${year}-${monthStr}-${day}`)
    })
    return Promise.all(promises)
  }
}
