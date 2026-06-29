import type { DailyHoroscope, PersonalDayForecast } from '@astralis/types'

export async function getDailyHoroscope(
  userId: string,
  date: string,
  apiBaseUrl: string,
): Promise<PersonalDayForecast> {
  const res = await fetch(`${apiBaseUrl}/horoscope/daily?userId=${userId}&date=${date}`)
  if (!res.ok) throw new Error(`Daily horoscope fetch failed: ${res.status}`)
  return res.json() as Promise<PersonalDayForecast>
}

export function formatHoroscopeHeadline(horoscope: DailyHoroscope): string {
  return `${horoscope.headline} | ✨ ${horoscope.affirmation}`
}

export function getEnergyLabel(energy: number): string {
  if (energy >= 9) return 'Максимум энергии'
  if (energy >= 7) return 'Высокая энергия'
  if (energy >= 5) return 'Средняя энергия'
  if (energy >= 3) return 'Низкая энергия'
  return 'День отдыха'
}

export function getEnergyEmoji(energy: number): string {
  if (energy >= 8) return '⚡'
  if (energy >= 6) return '🔥'
  if (energy >= 4) return '💫'
  return '🌙'
}
