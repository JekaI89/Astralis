import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { getTodayIso } from '@astralis/core'
import type { NumerologyProfile, PersonalCycle } from '@astralis/types'

export function useNumerologyProfile() {
  return useQuery({
    queryKey: ['numerology', 'profile'],
    queryFn: () => apiClient.get<NumerologyProfile>('/numerology/profile'),
    staleTime: Infinity,
  })
}

export function usePersonalCycle(date?: string) {
  const today = date ?? getTodayIso()
  return useQuery({
    queryKey: ['numerology', 'cycle', today],
    queryFn: () => apiClient.get<PersonalCycle>(`/numerology/cycle?date=${today}`),
  })
}
