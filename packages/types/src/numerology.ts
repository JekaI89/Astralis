export type NumerologyNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 22 | 33

export interface NumerologyProfile {
  userId: string
  lifePathNumber: NumerologyNumber     // число жизненного пути
  expressionNumber: NumerologyNumber   // число выражения (по имени)
  soulUrgeNumber: NumerologyNumber     // число души
  personalityNumber: NumerologyNumber  // число личности
  birthdayNumber: number               // день рождения
  maturityNumber: NumerologyNumber     // число зрелости
  calculatedAt: string
}

export interface PersonalCycle {
  date: string
  personalYear: NumerologyNumber
  personalMonth: NumerologyNumber
  personalDay: NumerologyNumber
  universalYear: NumerologyNumber
  universalDay: NumerologyNumber
  pinnacles: [NumerologyNumber, NumerologyNumber, NumerologyNumber, NumerologyNumber]
  challenges: [NumerologyNumber, NumerologyNumber, NumerologyNumber, NumerologyNumber]
}

export interface NumberInterpretation {
  number: NumerologyNumber
  title: string
  keywords: string[]
  strengths: string[]
  challenges: string[]
  careerSuggestions: string[]
  karmicLessons: string[]
  description: string
}

export interface AngelNumber {
  pattern: string            // "11:11", "22:22", "12:34"
  title: string
  message: string
  affirmation: string
}

export interface ArbitraryNumberAnalysis {
  input: string
  reducedNumber: NumerologyNumber
  interpretation: NumberInterpretation
  energyType: 'positive' | 'neutral' | 'challenging'
}
