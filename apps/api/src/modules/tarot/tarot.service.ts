import { Injectable } from '@nestjs/common'
import { drawRandomCard } from '@astralis/core'
import type { TarotCard } from '@astralis/types'
import { MAJOR_ARCANA } from './tarot-data'

@Injectable()
export class TarotService {
  getDailyCard(userId: string, date: string): TarotCard {
    // Детерминированная карта дня: один пользователь — одна карта в день
    const seed = this.hashSeed(`${userId}-${date}`)
    const index = seed % MAJOR_ARCANA.length
    const card = MAJOR_ARCANA[index]
    if (!card) throw new Error('Tarot deck is empty')
    return { ...card, isReversed: seed % 3 === 0 }
  }

  getRandomCard(): TarotCard {
    return drawRandomCard(MAJOR_ARCANA)
  }

  private hashSeed(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i)
      hash |= 0
    }
    return Math.abs(hash)
  }
}
