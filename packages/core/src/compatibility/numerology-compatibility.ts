import type { NumerologyNumber } from '@astralis/types'
import { calculateCompatibilityScore, reduceToSingleDigit } from '../numerology/calculations'

export interface NumerologyCompatibility {
  unionNumber: NumerologyNumber
  score: number
  title: string
  description: string
  pros: string[]
  cons: string[]
}

const UNION_DESCRIPTIONS: Record<number, { title: string; description: string; pros: string[]; cons: string[] }> = {
  2: {
    title: 'Союз двух душ',
    description: 'Глубокая эмоциональная связь. Вы чувствуете друг друга без слов.',
    pros: ['Взаимопонимание', 'Эмоциональная близость', 'Поддержка'],
    cons: ['Возможная созависимость', 'Избыток чувствительности'],
  },
  3: {
    title: 'Союз радости',
    description: 'Лёгкость общения и взаимное вдохновение. Вам никогда не скучно вместе.',
    pros: ['Веселье', 'Творческий тандем', 'Позитивная энергия'],
    cons: ['Поверхностность в кризис', 'Избегание серьёзных тем'],
  },
  6: {
    title: 'Союз любви и заботы',
    description: 'Один из самых гармоничных союзов. Тепло, уют и взаимная поддержка.',
    pros: ['Глубокая любовь', 'Семейные ценности', 'Преданность'],
    cons: ['Самопожертвование', 'Перфекционизм'],
  },
  9: {
    title: 'Союз мудрых',
    description: 'Духовное и интеллектуальное единение. Вы меняете мир вместе.',
    pros: ['Общие ценности', 'Взаимный рост', 'Глубина'],
    cons: ['Идеализм', 'Отрыв от быта'],
  },
}

export function calculateNumerologyCompatibility(
  lifePathA: NumerologyNumber,
  lifePathB: NumerologyNumber,
): NumerologyCompatibility {
  const score = calculateCompatibilityScore(lifePathA, lifePathB)
  const unionNumber = reduceToSingleDigit(lifePathA + lifePathB)
  const info = UNION_DESCRIPTIONS[unionNumber] ?? {
    title: `Союз ${lifePathA} и ${lifePathB}`,
    description: 'Уникальное сочетание энергий, требующее взаимного уважения.',
    pros: ['Взаимодополнение', 'Разнообразие'],
    cons: ['Необходимость компромиссов'],
  }

  return {
    unionNumber: unionNumber as NumerologyNumber,
    score,
    ...info,
  }
}
