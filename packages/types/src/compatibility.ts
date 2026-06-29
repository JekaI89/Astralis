export interface SynastryScore {
  overall: number       // 0–100
  love: number
  friendship: number
  business: number
  communication: number
  growth: number
}

export interface CompatibilityReport {
  id: string
  userId: string
  contactId: string
  contactName: string
  synastryScore: SynastryScore
  numerologyScore: number      // 0–100 (по числам жизн. пути)
  combinedScore: number        // взвешенный итог
  unionNumber: number          // нумерологическое число пары
  unionDescription: string
  strengths: string[]
  challenges: string[]
  advice: string
  dailyForecast?: string
  shareImageUrl?: string
  calculatedAt: string
}

export interface ReferralLink {
  userId: string
  code: string
  url: string
  partnerId?: string
  unlockedFeature?: string
}
