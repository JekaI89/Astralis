import type { TarotCard } from '@astralis/types'

export function drawRandomCard(deck: TarotCard[]): TarotCard {
  const index = Math.floor(Math.random() * deck.length)
  const card = deck[index]
  if (!card) throw new Error('Empty deck')
  return { ...card, isReversed: Math.random() < 0.3 }
}

export function drawThreeCards(deck: TarotCard[]): [TarotCard, TarotCard, TarotCard] {
  const shuffled = [...deck].sort(() => Math.random() - 0.5)
  const [past, present, future] = shuffled
  if (!past || !present || !future) throw new Error('Deck too small')
  return [
    { ...past, isReversed: Math.random() < 0.3 },
    { ...present, isReversed: Math.random() < 0.3 },
    { ...future, isReversed: Math.random() < 0.3 },
  ]
}

export async function getDailyCard(userId: string, date: string, apiBaseUrl: string): Promise<TarotCard> {
  const res = await fetch(`${apiBaseUrl}/tarot/daily?userId=${userId}&date=${date}`)
  if (!res.ok) throw new Error(`Daily card fetch failed: ${res.status}`)
  return res.json() as Promise<TarotCard>
}
