import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { AstroService } from '../astro/astro.service'
import { NumerologyService } from '../numerology/numerology.service'
import { generateMoodInsights } from '@astralis/core'
import type { MoodEntry, MoodValue, MoodEmoji } from '@astralis/types'

@Injectable()
export class MoodService {
  constructor(
    private prisma: PrismaService,
    private astro: AstroService,
    private numerology: NumerologyService,
  ) {}

  async logMood(
    userId: string,
    date: string,
    mood: MoodValue,
    emoji: MoodEmoji,
    note?: string,
  ): Promise<MoodEntry> {
    const [lunarDay, cycle] = await Promise.all([
      this.astro.getLunarDay(date),
      this.numerology.getPersonalCycle(userId, date),
    ])

    const entry = await this.prisma.moodEntry.upsert({
      where: { userId_date: { userId, date: new Date(date) } },
      update: { mood, emoji, note },
      create: {
        userId,
        date: new Date(date),
        mood,
        emoji,
        note,
        moonSign: lunarDay.moonSign,
        lunarDay: lunarDay.lunarDay,
        personalDayNumber: cycle.personalDay,
      },
    })

    return {
      id: entry.id,
      userId: entry.userId,
      date,
      mood: entry.mood as MoodValue,
      emoji: entry.emoji as MoodEmoji,
      note: entry.note ?? undefined,
      moonSign: entry.moonSign as import('@astralis/types').ZodiacSign,
      lunarDay: entry.lunarDay,
      personalDayNumber: entry.personalDayNumber,
      createdAt: entry.createdAt.toISOString(),
    }
  }

  async getMonthEntries(userId: string, year: number, month: number): Promise<MoodEntry[]> {
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0)

    const entries = await this.prisma.moodEntry.findMany({
      where: { userId, date: { gte: start, lte: end } },
      orderBy: { date: 'asc' },
    })

    return entries.map((e) => ({
      id: e.id,
      userId: e.userId,
      date: e.date.toISOString().split('T')[0]!,
      mood: e.mood as MoodValue,
      emoji: e.emoji as MoodEmoji,
      note: e.note ?? undefined,
      moonSign: e.moonSign as import('@astralis/types').ZodiacSign,
      lunarDay: e.lunarDay,
      personalDayNumber: e.personalDayNumber,
      createdAt: e.createdAt.toISOString(),
    }))
  }

  async getInsights(userId: string) {
    const now = new Date()
    const entries = await this.getMonthEntries(userId, now.getFullYear(), now.getMonth() + 1)
    if (entries.length < 7) return null
    return generateMoodInsights(entries, userId)
  }
}
