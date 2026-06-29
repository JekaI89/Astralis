import type { Transit, NatalChart } from '@astralis/types'

export async function getCurrentTransits(
  chart: NatalChart,
  date: string,
  apiBaseUrl: string,
): Promise<Transit[]> {
  const res = await fetch(`${apiBaseUrl}/astro/transits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ natalChart: chart, date }),
  })
  if (!res.ok) throw new Error(`Transits fetch failed: ${res.status}`)
  return res.json() as Promise<Transit[]>
}

export function filterHighImpactTransits(transits: Transit[]): Transit[] {
  return transits.filter((t) => t.intensity === 'high')
}

export function getTransitsByHouse(transits: Transit[], house: number): Transit[] {
  return transits.filter((t) => t.house === house)
}

export function isRetrogradePlanet(planet: string, date: string): boolean {
  // Реализация через ephemeris API
  // Заглушка — в продакшне вызывает расчётный сервис
  void planet
  void date
  return false
}
