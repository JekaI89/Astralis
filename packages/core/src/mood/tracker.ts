import type { MoodEntry, MoodValue, MoodEmoji } from '@astralis/types'

export const MOOD_EMOJIS: MoodEmoji[] = ['😢', '😔', '😐', '😊', '😄', '🤩', '😴', '😰', '😤']

export const MOOD_LABELS: Record<MoodValue, string> = {
  1: 'Очень плохо',
  2: 'Плохо',
  3: 'Не очень',
  4: 'Нормально',
  5: 'Хорошо',
  6: 'Отлично',
  7: 'Прекрасно',
  8: 'Восторг',
  9: 'Эйфория',
}

export function getMoodColor(mood: MoodValue): string {
  if (mood <= 2) return '#EF4444'
  if (mood <= 4) return '#F59E0B'
  if (mood <= 6) return '#10B981'
  return '#6366F1'
}

export function calculateAverageMood(entries: MoodEntry[]): number {
  if (entries.length === 0) return 0
  return entries.reduce((acc, e) => acc + e.mood, 0) / entries.length
}
