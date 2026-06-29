import type { LunarDay } from '@astralis/types'

export async function getLunarDay(date: string, apiBaseUrl: string): Promise<LunarDay> {
  const res = await fetch(`${apiBaseUrl}/astro/lunar-day?date=${date}`)
  if (!res.ok) throw new Error(`Lunar day fetch failed: ${res.status}`)
  return res.json() as Promise<LunarDay>
}

export async function getLunarCalendar(
  year: number,
  month: number,
  apiBaseUrl: string,
): Promise<LunarDay[]> {
  const res = await fetch(`${apiBaseUrl}/astro/lunar-calendar?year=${year}&month=${month}`)
  if (!res.ok) throw new Error(`Lunar calendar fetch failed: ${res.status}`)
  return res.json() as Promise<LunarDay[]>
}

export function getMoonPhaseEmoji(phase: LunarDay['moonPhase']): string {
  const emojis: Record<LunarDay['moonPhase'], string> = {
    new: '🌑',
    waxing_crescent: '🌒',
    first_quarter: '🌓',
    waxing_gibbous: '🌔',
    full: '🌕',
    waning_gibbous: '🌖',
    last_quarter: '🌗',
    waning_crescent: '🌘',
  }
  return emojis[phase]
}

export function getMoonPhaseNameRu(phase: LunarDay['moonPhase']): string {
  const names: Record<LunarDay['moonPhase'], string> = {
    new: 'Новолуние',
    waxing_crescent: 'Растущий серп',
    first_quarter: 'Первая четверть',
    waxing_gibbous: 'Растущая луна',
    full: 'Полнолуние',
    waning_gibbous: 'Убывающая луна',
    last_quarter: 'Последняя четверть',
    waning_crescent: 'Убывающий серп',
  }
  return names[phase]
}
