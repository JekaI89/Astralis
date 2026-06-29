import type { SynastryScore, NatalChart } from '@astralis/types'

export async function calculateSynastry(
  chartA: NatalChart,
  chartB: NatalChart,
  apiBaseUrl: string,
): Promise<SynastryScore> {
  const res = await fetch(`${apiBaseUrl}/astro/synastry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chartA, chartB }),
  })
  if (!res.ok) throw new Error(`Synastry calculation failed: ${res.status}`)
  return res.json() as Promise<SynastryScore>
}

export function getSynastryLabel(score: number): string {
  if (score >= 90) return 'Идеальный союз'
  if (score >= 75) return 'Отличная совместимость'
  if (score >= 60) return 'Хорошая совместимость'
  if (score >= 45) return 'Умеренная совместимость'
  if (score >= 30) return 'Требует работы'
  return 'Сложный союз'
}

export function getSynastryColor(score: number): string {
  if (score >= 75) return '#4CAF50'
  if (score >= 50) return '#FFC107'
  return '#F44336'
}
