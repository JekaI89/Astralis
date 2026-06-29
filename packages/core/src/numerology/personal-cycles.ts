import type { PersonalCycle, NumerologyNumber } from '@astralis/types'
import { reduceToSingleDigit } from './calculations'

export function calculatePersonalYear(birthDate: string, year: number): NumerologyNumber {
  const [, month, day] = birthDate.split('-').map(Number)
  const sum = (month ?? 0) + (day ?? 0) + year
  return reduceToSingleDigit(sum)
}

export function calculatePersonalMonth(
  personalYear: NumerologyNumber,
  month: number,
): NumerologyNumber {
  return reduceToSingleDigit(personalYear + month)
}

export function calculatePersonalDay(
  personalMonth: NumerologyNumber,
  day: number,
): NumerologyNumber {
  return reduceToSingleDigit(personalMonth + day)
}

export function calculateUniversalYear(year: number): NumerologyNumber {
  return reduceToSingleDigit(
    String(year).split('').reduce((acc, d) => acc + Number(d), 0),
  )
}

export function calculatePersonalCycle(birthDate: string, date: string): PersonalCycle {
  const [year, month, day] = date.split('-').map(Number)
  if (!year || !month || !day) throw new Error('Invalid date')

  const personalYear = calculatePersonalYear(birthDate, year)
  const personalMonth = calculatePersonalMonth(personalYear, month)
  const personalDay = calculatePersonalDay(personalMonth, day)
  const universalYear = calculateUniversalYear(year)
  const universalDay = reduceToSingleDigit(
    String(date.replace(/-/g, '')).split('').reduce((acc, d) => acc + Number(d), 0),
  )

  // Вехи (Pinnacles) — упрощённый расчёт
  const [birthMonth, birthDay] = birthDate.split('-').slice(1).map(Number)
  const p1 = reduceToSingleDigit((birthMonth ?? 0) + (birthDay ?? 0))
  const p2 = reduceToSingleDigit((birthDay ?? 0) + year)
  const p3 = reduceToSingleDigit(p1 + p2)
  const p4 = reduceToSingleDigit((birthMonth ?? 0) + year)

  const c1 = reduceToSingleDigit(Math.abs((birthMonth ?? 0) - (birthDay ?? 0)))
  const c2 = reduceToSingleDigit(Math.abs((birthDay ?? 0) - year))
  const c3 = reduceToSingleDigit(Math.abs(c1 - c2))
  const c4 = reduceToSingleDigit(Math.abs((birthMonth ?? 0) - year))

  return {
    date,
    personalYear,
    personalMonth,
    personalDay,
    universalYear,
    universalDay,
    pinnacles: [p1, p2, p3, p4],
    challenges: [c1, c2, c3, c4],
  }
}
