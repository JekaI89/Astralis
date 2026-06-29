import type { ZodiacSign } from './astrology'

export type HoroscopePeriod = 'day' | 'week' | 'month' | 'year'

export interface DailyHoroscope {
  id: string
  userId: string
  date: string
  sign: ZodiacSign
  headline: string           // короткий тезис для пуша
  generalForecast: string
  loveForecast: string
  careerForecast: string
  healthForecast: string
  luckyNumber: number
  luckyColor: string
  luckyTime: string          // "14:00–16:00"
  energy: number             // 1–10
  affirmation: string
  cardOfDay?: import('./astrology').TarotCard
  numerologyNote?: string    // синтез с нумерологией
  transitHighlights: string[]
  createdAt: string
}

export interface PersonalDayForecast extends DailyHoroscope {
  personalDayNumber: number
  personalDaySynthesis: string   // астро + нумеро синтез
  keyTransits: import('./astrology').Transit[]
}
