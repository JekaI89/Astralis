import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '@/lib/api-client'
import type { User } from '@astralis/types'

interface BirthData {
  name: string
  date: string
  time: string
  city: string
}

interface AuthState {
  token: string | null
  user: User | null
  isLoading: boolean
  birthData: BirthData | null
  pollCode: string | null

  setBirthData: (data: BirthData | null) => void
  loginWithTelegram: (initData: string) => Promise<void>
  loginWithEmail: (email: string, password: string) => Promise<void>
  registerWithEmail: (dto: {
    name: string
    email: string
    password: string
    birthDate: string
    birthTime?: string
    birthPlace?: string
  }) => Promise<void>
  loginWithTelegramWidget: (data: Record<string, string>) => Promise<void>
  startTelegramBotFlow: () => Promise<string>
  pollTelegramAuth: (code: string) => Promise<{ status: string; token?: string }>
  linkEmail: (email: string, password: string) => Promise<void>
  fetchMe: () => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,
      birthData: null,
      pollCode: null,

      setBirthData: (data) => set({ birthData: data }),

      loginWithTelegram: async (initData: string) => {
        set({ isLoading: true })
        try {
          const { token, user } = await apiClient.post<{ token: string; user: User }>(
            '/auth/telegram',
            { initData },
          )
          apiClient.setToken(token)
          set({ token, user, isLoading: false })
          await get().fetchMe()
        } catch {
          set({ isLoading: false })
          throw new Error('Ошибка авторизации через Telegram')
        }
      },

      loginWithEmail: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const { token, user } = await apiClient.post<{ token: string; user: User }>(
            '/auth/login',
            { email, password },
          )
          apiClient.setToken(token)
          set({ token, user, isLoading: false })
          await get().fetchMe()
        } catch (e) {
          set({ isLoading: false })
          throw e
        }
      },

      registerWithEmail: async (dto) => {
        set({ isLoading: true })
        try {
          const { token, user } = await apiClient.post<{ token: string; user: User }>(
            '/auth/register',
            dto,
          )
          apiClient.setToken(token)
          set({ token, user, isLoading: false })
          await get().fetchMe()
        } catch (e) {
          set({ isLoading: false })
          throw e
        }
      },

      loginWithTelegramWidget: async (data: Record<string, string>) => {
        set({ isLoading: true })
        try {
          const { token, user } = await apiClient.post<{ token: string; user: User }>(
            '/auth/telegram-widget',
            data,
          )
          apiClient.setToken(token)
          set({ token, user, isLoading: false })
          await get().fetchMe()
        } catch {
          set({ isLoading: false })
          throw new Error('Ошибка авторизации через Telegram')
        }
      },

      startTelegramBotFlow: async () => {
        const data = await apiClient.get<{ code: string }>('/auth/telegram-code')
        if (!data.code) throw new Error('Не удалось получить код')
        set({ pollCode: data.code })
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('tg_auth_code', data.code)
        }
        return data.code
      },

      pollTelegramAuth: async (code: string) => {
        const data = await apiClient.get<{ status: string; token?: string }>(
          `/auth/telegram-poll/${code}`,
        )
        if (data.status === 'ok' && data.token) {
          apiClient.setToken(data.token)
          set({ token: data.token, pollCode: null })
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('tg_auth_code')
          }
          await get().fetchMe()
        }
        return data
      },

      linkEmail: async (email: string, password: string) => {
        await apiClient.post('/auth/link-email', { email, password })
        await get().fetchMe()
      },

      fetchMe: async () => {
        try {
          const u = await apiClient.get<User>('/users/me')
          if (u) {
            set({ user: u })
            const bd: BirthData = {
              name: u.name ?? '',
              date: u.birthDate?.split('T')[0] ?? '',
              time: u.birthTime ?? '',
              city: u.birthPlace ?? '',
            }
            set({ birthData: bd })
          }
        } catch {
          // ignore fetch me errors
        }
      },

      logout: () => {
        apiClient.setToken(null)
        set({ token: null, user: null, birthData: null, pollCode: null })
      },
    }),
    {
      name: 'astralis-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        birthData: state.birthData,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          apiClient.setToken(state.token)
        }
      },
    },
  ),
)
