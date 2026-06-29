import type { NatalChart, PlanetPosition, Aspect, AspectType } from '@astralis/types'

export interface BirthData {
  date: string        // "YYYY-MM-DD"
  time: string        // "HH:MM"
  lat: number
  lng: number
  timezone: string
}

// Заглушка для расчёта через Swiss Ephemeris / внешнее API
// В продакшне заменяется реальным вызовом к @astralis/api или к ephemeris библиотеке
export async function calculateNatalChart(
  userId: string,
  birthData: BirthData,
  apiBaseUrl: string,
): Promise<NatalChart> {
  const res = await fetch(`${apiBaseUrl}/astro/natal-chart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ...birthData }),
  })
  if (!res.ok) throw new Error(`Natal chart calculation failed: ${res.status}`)
  return res.json() as Promise<NatalChart>
}

export function getAspectOrb(type: AspectType): number {
  const orbs: Record<AspectType, number> = {
    conjunction: 8, opposition: 8, trine: 7, square: 7,
    sextile: 5, quincunx: 3,
  }
  return orbs[type]
}

export function getPlanetsByHouse(chart: NatalChart, house: number): PlanetPosition[] {
  return chart.planets.filter((p) => p.house === house)
}

export function getAspectsBetween(chart: NatalChart, planet1: string, planet2: string): Aspect[] {
  return chart.aspects.filter(
    (a) =>
      (a.planet1 === planet1 && a.planet2 === planet2) ||
      (a.planet1 === planet2 && a.planet2 === planet1),
  )
}

export function formatDegree(degree: number): string {
  const deg = Math.floor(degree)
  const min = Math.round((degree - deg) * 60)
  return `${deg}°${min}'`
}
