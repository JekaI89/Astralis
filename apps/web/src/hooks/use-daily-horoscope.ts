import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { getTodayIso } from '@astralis/core'
import type { PersonalDayForecast } from '@astralis/types'

export function useDailyHoroscope(date?: string) {
  const today = date ?? getTodayIso()
  return useQuery({
    queryKey: ['horoscope', 'daily', today],
    queryFn: () => apiClient.get<PersonalDayForecast>(`/horoscope/daily?date=${today}`),
  })
}
