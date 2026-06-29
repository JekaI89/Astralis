import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { NatalChart } from '@astralis/types'

export function useNatalChart() {
  return useQuery({
    queryKey: ['natal-chart'],
    queryFn: () => apiClient.get<NatalChart>('/astro/natal-chart'),
    staleTime: Infinity, // натальная карта не меняется
  })
}
