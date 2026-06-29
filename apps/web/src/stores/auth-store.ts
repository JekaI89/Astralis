import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '@/lib/api-client'
import type { User } from '@astralis/types'

interface AuthState {
  token: string | null
  user: User | null
  isLoading: boolean
  loginWithTelegram: (initData: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoading: false,

      loginWithTelegram: async (initData: string) => {
        set({ isLoading: true })
        try {
          const { token, user } = await apiClient.post<{ token: string; user: User }>(
            '/auth/telegram',
            { initData },
          )
          set({ token, user, isLoading: false })
        } catch {
          set({ isLoading: false })
        }
      },

      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'astralis-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
)
