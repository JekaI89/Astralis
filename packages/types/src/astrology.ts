export type ZodiacSign =
  | 'aries' | 'taurus' | 'gemini' | 'cancer'
  | 'leo' | 'virgo' | 'libra' | 'scorpio'
  | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces'

export type Planet =
  | 'sun' | 'moon' | 'mercury' | 'venus' | 'mars'
  | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto'
  | 'northNode' | 'southNode' | 'chiron' | 'ascendant' | 'midheaven'

export type AspectType = 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile' | 'quincunx'

export type House = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export interface PlanetPosition {
  planet: Planet
  sign: ZodiacSign
  degree: number          // 0–29.99
  house: House
  isRetrograde: boolean
  speed: number
}

export interface Aspect {
  planet1: Planet
  planet2: Planet
  type: AspectType
  orb: number
  isApplying: boolean
}

export interface HouseData {
  number: House
  sign: ZodiacSign
  degree: number
  ruler: Planet
}

export interface NatalChart {
  userId: string
  calculatedAt: string
  planets: PlanetPosition[]
  houses: HouseData[]
  aspects: Aspect[]
  ascendant: { sign: ZodiacSign; degree: number }
  midheaven: { sign: ZodiacSign; degree: number }
}

export interface Transit {
  transitingPlanet: Planet
  natalPlanet: Planet
  aspectType: AspectType
  exactDate: string
  startDate: string
  endDate: string
  intensity: 'low' | 'medium' | 'high'
  description: string
  house: House
}

export interface LunarDay {
  date: string
  lunarDay: number        // 1–30
  moonSign: ZodiacSign
  moonPhase: 'new' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous'
            | 'full' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent'
  illumination: number   // 0–100%
  isVoidOfCourse: boolean
  recommendations: LunarRecommendations
}

export interface LunarRecommendations {
  haircut: 'excellent' | 'good' | 'neutral' | 'avoid'
  beauty: 'excellent' | 'good' | 'neutral' | 'avoid'
  shopping: 'excellent' | 'good' | 'neutral' | 'avoid'
  travel: 'excellent' | 'good' | 'neutral' | 'avoid'
  diet: 'excellent' | 'good' | 'neutral' | 'avoid'
  business: 'excellent' | 'good' | 'neutral' | 'avoid'
  romance: 'excellent' | 'good' | 'neutral' | 'avoid'
}

export interface TarotCard {
  id: number
  name: string
  nameRu: string
  arcana: 'major' | 'minor'
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles'
  imageUrl: string
  keywordUpright: string[]
  keywordReversed: string[]
  descriptionUpright: string
  descriptionReversed: string
  isReversed: boolean
}
