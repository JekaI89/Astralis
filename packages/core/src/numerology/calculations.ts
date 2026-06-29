import type { NumerologyNumber, NumerologyProfile } from '@astralis/types'

// Мастер-числа не сводятся до одной цифры
const MASTER_NUMBERS = new Set([11, 22, 33])

export function reduceToSingleDigit(n: number): NumerologyNumber {
  while (n > 9 && !MASTER_NUMBERS.has(n)) {
    n = String(n).split('').reduce((acc, d) => acc + Number(d), 0)
  }
  return n as NumerologyNumber
}

export function calculateLifePathNumber(birthDate: string): NumerologyNumber {
  // birthDate: "YYYY-MM-DD"
  const digits = birthDate.replace(/-/g, '').split('').map(Number)
  const sum = digits.reduce((acc, d) => acc + d, 0)
  return reduceToSingleDigit(sum)
}

// Пифагорейская таблица (английский алфавит)
const PYTHAGOREAN: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
}

// Русский алфавит (числовые значения)
const PYTHAGOREAN_RU: Record<string, number> = {
  А: 1, Б: 2, В: 3, Г: 4, Д: 5, Е: 6, Ё: 7, Ж: 8, З: 9,
  И: 1, Й: 2, К: 3, Л: 4, М: 5, Н: 6, О: 7, П: 8, Р: 9,
  С: 1, Т: 2, У: 3, Ф: 4, Х: 5, Ц: 6, Ч: 7, Ш: 8, Щ: 9,
  Ъ: 1, Ы: 2, Ь: 3, Э: 4, Ю: 5, Я: 6,
}

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U', 'А', 'Е', 'Ё', 'И', 'О', 'У', 'Ы', 'Э', 'Ю', 'Я'])

function getLetterTable(letter: string): number {
  const up = letter.toUpperCase()
  return PYTHAGOREAN[up] ?? PYTHAGOREAN_RU[up] ?? 0
}

export function calculateExpressionNumber(fullName: string): NumerologyNumber {
  const sum = fullName
    .toUpperCase()
    .split('')
    .reduce((acc, ch) => acc + getLetterTable(ch), 0)
  return reduceToSingleDigit(sum)
}

export function calculateSoulUrgeNumber(fullName: string): NumerologyNumber {
  const sum = fullName
    .toUpperCase()
    .split('')
    .filter((ch) => VOWELS.has(ch))
    .reduce((acc, ch) => acc + getLetterTable(ch), 0)
  return reduceToSingleDigit(sum)
}

export function calculatePersonalityNumber(fullName: string): NumerologyNumber {
  const sum = fullName
    .toUpperCase()
    .split('')
    .filter((ch) => !VOWELS.has(ch) && getLetterTable(ch) > 0)
    .reduce((acc, ch) => acc + getLetterTable(ch), 0)
  return reduceToSingleDigit(sum)
}

export function calculateMaturityNumber(
  lifePathNumber: NumerologyNumber,
  expressionNumber: NumerologyNumber,
): NumerologyNumber {
  return reduceToSingleDigit(lifePathNumber + expressionNumber)
}

export function buildNumerologyProfile(
  userId: string,
  birthDate: string,
  fullName: string,
): NumerologyProfile {
  const lifePathNumber = calculateLifePathNumber(birthDate)
  const expressionNumber = calculateExpressionNumber(fullName)
  const soulUrgeNumber = calculateSoulUrgeNumber(fullName)
  const personalityNumber = calculatePersonalityNumber(fullName)
  const birthdayNumber = Number(birthDate.split('-')[2])
  const maturityNumber = calculateMaturityNumber(lifePathNumber, expressionNumber)

  return {
    userId,
    lifePathNumber,
    expressionNumber,
    soulUrgeNumber,
    personalityNumber,
    birthdayNumber,
    maturityNumber,
    calculatedAt: new Date().toISOString(),
  }
}

export function analyzeArbitraryNumber(input: string): number {
  const digits = input.replace(/\D/g, '').split('').map(Number)
  const sum = digits.reduce((acc, d) => acc + d, 0)
  return reduceToSingleDigit(sum)
}

export function calculateCompatibilityScore(
  lifePathA: NumerologyNumber,
  lifePathB: NumerologyNumber,
): number {
  // Матрица совместимости чисел жизненного пути (0–100)
  const unionNumber = reduceToSingleDigit(lifePathA + lifePathB)
  // Числа 2, 6, 9 — гармоничные союзы; 1, 8 — партнёрские; и т.д.
  const BASE_SCORES: Record<number, number> = {
    1: 70, 2: 90, 3: 75, 4: 60, 5: 80, 6: 95, 7: 65, 8: 75, 9: 85, 11: 88, 22: 82, 33: 92,
  }
  return BASE_SCORES[unionNumber] ?? 70
}
