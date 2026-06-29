import type { PersonalDayForecast, PersonalCycle } from '@astralis/types'

// Объединяет астрологический прогноз с нумерологическими данными дня
export function synthesizeDayForecast(
  horoscope: PersonalDayForecast,
  cycle: PersonalCycle,
): PersonalDayForecast {
  const numerologyNote = buildNumerologyNote(cycle.personalDay, cycle.personalMonth)
  return {
    ...horoscope,
    personalDayNumber: cycle.personalDay,
    numerologyNote,
    personalDaySynthesis: `${horoscope.headline} В сочетании с вашим личным числом дня ${cycle.personalDay} — ${numerologyNote}`,
  }
}

function buildNumerologyNote(personalDay: number, personalMonth: number): string {
  const notes: Record<number, string> = {
    1: 'день новых начинаний. Действуйте первыми.',
    2: 'день сотрудничества. Слушайте других.',
    3: 'день общения и творчества. Выражайте себя.',
    4: 'день труда и порядка. Доводите начатое до конца.',
    5: 'день перемен. Будьте гибкими.',
    6: 'день заботы и гармонии. Уделите время близким.',
    7: 'день размышлений. Доверяйте интуиции.',
    8: 'день власти и финансов. Принимайте важные решения.',
    9: 'день завершений. Отпускайте лишнее.',
  }
  const monthNote = personalMonth <= 6 ? 'Первая половина вашего личного месяца — набирайте обороты.' : 'Вторая половина личного месяца — укрепляйте достигнутое.'
  return `${notes[personalDay] ?? 'день возможностей'} ${monthNote}`
}
