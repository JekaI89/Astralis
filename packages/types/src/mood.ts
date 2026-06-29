import type { ZodiacSign } from './astrology'

export type MoodEmoji = '😄' | '😊' | '😐' | '😔' | '😢' | '😤' | '😰' | '🤩' | '😴'

export type MoodValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export interface MoodEntry {
  id: string
  userId: string
  date: string
  mood: MoodValue
  emoji: MoodEmoji
  note?: string
  moonSign: ZodiacSign
  lunarDay: number
  personalDayNumber: number
  createdAt: string
}

export interface MoodInsight {
  period: 'month' | 'quarter'
  userId: string
  lowestMoodSign: ZodiacSign
  highestMoodSign: ZodiacSign
  averageMood: number
  moodByMoonSign: Record<ZodiacSign, number>
  moodByPersonalDay: Record<number, number>
  patternDescription: string
  advice: string
  generatedAt: string
}
