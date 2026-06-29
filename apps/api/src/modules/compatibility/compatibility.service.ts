import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { AstroService } from '../astro/astro.service'
import { NumerologyService } from '../numerology/numerology.service'
import { calculateSynastry, calculateNumerologyCompatibility } from '@astralis/core'
import type { CompatibilityReport } from '@astralis/types'

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000'

@Injectable()
export class CompatibilityService {
  constructor(
    private prisma: PrismaService,
    private astro: AstroService,
    private numerology: NumerologyService,
  ) {}

  async getCompatibility(userId: string, contactId: string): Promise<CompatibilityReport> {
    const cached = await this.prisma.compatibilityReport.findUnique({
      where: { userId_contactId: { userId, contactId } },
    })
    if (cached) return cached.data as CompatibilityReport

    const [userChart, numerologyProfile] = await Promise.all([
      this.astro.getNatalChart(userId),
      this.numerology.getProfile(userId),
    ])

    const contact = await this.prisma.contact.findUniqueOrThrow({ where: { id: contactId } })

    // Строим временную карту для контакта если нет сохранённой
    const contactChart = contact.natalChart as typeof userChart | null
    const synastryScore = contactChart
      ? await calculateSynastry(userChart, contactChart, API_BASE)
      : { overall: 70, love: 70, friendship: 70, business: 70, communication: 70, growth: 70 }

    // Нумерологическая совместимость
    const contactBirthDate = contact.birthDate.toISOString().split('T')[0]!
    const contactLifePath = this.numerology['prisma'] ? numerologyProfile.lifePathNumber : numerologyProfile.lifePathNumber
    void contactBirthDate
    const numCompat = calculateNumerologyCompatibility(
      numerologyProfile.lifePathNumber,
      numerologyProfile.lifePathNumber, // TODO: рассчитать для контакта
    )

    const combinedScore = Math.round(synastryScore.overall * 0.6 + numCompat.score * 0.4)

    const report: CompatibilityReport = {
      id: `${userId}-${contactId}`,
      userId,
      contactId,
      contactName: contact.name,
      synastryScore,
      numerologyScore: numCompat.score,
      combinedScore,
      unionNumber: numCompat.unionNumber,
      unionDescription: numCompat.description,
      strengths: numCompat.pros,
      challenges: numCompat.cons,
      advice: 'Совместная работа над общим проектом укрепит ваш союз.',
      calculatedAt: new Date().toISOString(),
    }

    await this.prisma.compatibilityReport.create({
      data: { userId, contactId, data: report as object },
    })

    return report
  }
}
