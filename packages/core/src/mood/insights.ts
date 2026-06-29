import type { MoodEntry, MoodInsight, ZodiacSign } from '@astralis/types'
import { calculateAverageMood } from './tracker'
import { ZODIAC_SIGNS } from '../astrology/zodiac-data'

export function generateMoodInsights(entries: MoodEntry[], userId: string): MoodInsight {
  const bySign = Object.fromEntries(
    ZODIAC_SIGNS.map((sign) => {
      const signEntries = entries.filter((e) => e.moonSign === sign)
      return [sign, signEntries.length > 0 ? calculateAverageMood(signEntries) : 0]
    }),
  ) as Record<ZodiacSign, number>

  const byPersonalDay = Object.fromEntries(
    Array.from({ length: 9 }, (_, i) => i + 1).map((day) => {
      const dayEntries = entries.filter((e) => e.personalDayNumber === day)
      return [day, dayEntries.length > 0 ? calculateAverageMood(dayEntries) : 0]
    }),
  )

  const sortedBySign = (Object.entries(bySign) as [ZodiacSign, number][]).sort(([, a], [, b]) => a - b)
  const lowestMoodSign = sortedBySign[0]?.[0] ?? 'scorpio'
  const highestMoodSign = sortedBySign[sortedBySign.length - 1]?.[0] ?? 'leo'

  return {
    period: 'month',
    userId,
    lowestMoodSign,
    highestMoodSign,
    averageMood: calculateAverageMood(entries),
    moodByMoonSign: bySign,
    moodByPersonalDay: byPersonalDay,
    patternDescription: `Ваше настроение чаще всего снижается, когда Луна в знаке ${lowestMoodSign}.`,
    advice: 'В эти периоды уделяйте больше времени отдыху и практикам заземления.',
    generatedAt: new Date().toISOString(),
  }
}
