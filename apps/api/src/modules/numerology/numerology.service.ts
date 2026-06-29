import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import {
  buildNumerologyProfile,
  calculatePersonalCycle,
  getNumberInterpretation,
  analyzeArbitraryNumber,
  detectAngelNumber,
} from '@astralis/core'
import type { NumerologyProfile, PersonalCycle, ArbitraryNumberAnalysis } from '@astralis/types'

@Injectable()
export class NumerologyService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string): Promise<NumerologyProfile> {
    const cached = await this.prisma.numerologyProfile.findUnique({ where: { userId } })
    if (cached) {
      return {
        userId: cached.userId,
        lifePathNumber: cached.lifePathNumber,
        expressionNumber: cached.expressionNumber,
        soulUrgeNumber: cached.soulUrgeNumber,
        personalityNumber: cached.personalityNumber,
        birthdayNumber: cached.birthdayNumber,
        maturityNumber: cached.maturityNumber,
        calculatedAt: cached.calculatedAt.toISOString(),
      } as NumerologyProfile
    }

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } })
    const birthDate = user.birthDate.toISOString().split('T')[0]!
    const profile = buildNumerologyProfile(userId, birthDate, user.name)

    await this.prisma.numerologyProfile.create({
      data: {
        userId,
        lifePathNumber: profile.lifePathNumber,
        expressionNumber: profile.expressionNumber,
        soulUrgeNumber: profile.soulUrgeNumber,
        personalityNumber: profile.personalityNumber,
        birthdayNumber: profile.birthdayNumber,
        maturityNumber: profile.maturityNumber,
      },
    })

    return profile
  }

  async getPersonalCycle(userId: string, date: string): Promise<PersonalCycle> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } })
    const birthDate = user.birthDate.toISOString().split('T')[0]!
    return calculatePersonalCycle(birthDate, date)
  }

  analyzeNumber(input: string): ArbitraryNumberAnalysis {
    const reducedNumber = analyzeArbitraryNumber(input)
    const interpretation = getNumberInterpretation(reducedNumber as import('@astralis/types').NumerologyNumber)
    return {
      input,
      reducedNumber: reducedNumber as import('@astralis/types').NumerologyNumber,
      interpretation,
      energyType: reducedNumber >= 6 ? 'positive' : reducedNumber >= 4 ? 'neutral' : 'challenging',
    }
  }

  getAngelNumber(pattern: string) {
    return detectAngelNumber(pattern)
  }
}
