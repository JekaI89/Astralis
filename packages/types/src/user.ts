export type AuthProvider = 'telegram' | 'google' | 'apple' | 'email'

export interface User {
  id: string
  telegramId?: number
  name: string
  email?: string
  avatarUrl?: string
  birthDate: string        // ISO date: "1990-06-15"
  birthTime?: string       // "14:30"
  birthPlace?: string
  birthLat?: number
  birthLng?: number
  timezone?: string
  language: 'ru' | 'en'
  isPremium: boolean
  premiumExpiresAt?: string
  createdAt: string
  updatedAt: string
}

export interface UserProfile extends User {
  natalChart?: import('./astrology').NatalChart
  numerologyProfile?: import('./numerology').NumerologyProfile
}

export interface Contact {
  id: string
  ownerId: string
  name: string
  birthDate: string
  birthTime?: string
  birthPlace?: string
  birthLat?: number
  birthLng?: number
  relation: 'partner' | 'friend' | 'colleague' | 'family' | 'other'
  avatarUrl?: string
  createdAt: string
}
