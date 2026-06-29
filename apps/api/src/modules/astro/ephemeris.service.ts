import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { NatalChart, LunarDay, Transit, ZodiacSign, Planet, AspectType } from '@astralis/types'

@Injectable()
export class EphemerisService {
  private readonly logger = new Logger(EphemerisService.name)
  private readonly apiKey: string | undefined
  private readonly baseUrl = 'https://astro-api-provider.example.com/v1'

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('ASTRO_API_KEY')
    if (!this.apiKey) {
      this.logger.warn('ASTRO_API_KEY not set — ephemeris will return stub data')
    }
  }

  async calculateNatalChart(params: {
    date: string
    time: string
    lat: number
    lng: number
    timezone: string
    userId: string
  }): Promise<NatalChart> {
    if (!this.apiKey) return this.stubNatalChart(params.userId)
    const res = await fetch(`${this.baseUrl}/natal-chart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify(params),
    })
    if (!res.ok) throw new Error(`Ephemeris API error: ${res.status}`)
    return res.json() as Promise<NatalChart>
  }

  async getTransits(params: { natalChartData: NatalChart; date: string }): Promise<Transit[]> {
    if (!this.apiKey) return []
    const res = await fetch(`${this.baseUrl}/transits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify(params),
    })
    if (!res.ok) throw new Error(`Ephemeris API error: ${res.status}`)
    return res.json() as Promise<Transit[]>
  }

  async getLunarDay(date: string): Promise<LunarDay> {
    if (!this.apiKey) return this.stubLunarDay(date)
    const res = await fetch(`${this.baseUrl}/lunar-day?date=${date}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    })
    if (!res.ok) throw new Error(`Ephemeris API error: ${res.status}`)
    return res.json() as Promise<LunarDay>
  }

  private stubNatalChart(userId: string): NatalChart {
    const now = new Date().toISOString()
    return {
      userId,
      calculatedAt: now,
      planets: [
        { planet: 'Sun' as Planet, sign: 'Leo' as ZodiacSign, degree: 12.5, house: 5, isRetrograde: false },
        { planet: 'Moon' as Planet, sign: 'Scorpio' as ZodiacSign, degree: 7.3, house: 8, isRetrograde: false },
        { planet: 'Mercury' as Planet, sign: 'Virgo' as ZodiacSign, degree: 3.1, house: 6, isRetrograde: false },
        { planet: 'Venus' as Planet, sign: 'Gemini' as ZodiacSign, degree: 21.0, house: 2, isRetrograde: false },
        { planet: 'Mars' as Planet, sign: 'Aries' as ZodiacSign, degree: 15.8, house: 1, isRetrograde: false },
      ],
      houses: Array.from({ length: 12 }, (_, i) => ({ house: (i + 1) as 1|2|3|4|5|6|7|8|9|10|11|12, sign: 'Leo' as ZodiacSign, degree: i * 30 })),
      aspects: [
        { planet1: 'Sun' as Planet, planet2: 'Moon' as Planet, aspectType: 'trine' as AspectType, orb: 2.1, isApplying: true },
      ],
      ascendant: { sign: 'Sagittarius' as ZodiacSign, degree: 14.2 },
      midheaven: { sign: 'Virgo' as ZodiacSign, degree: 8.5 },
    }
  }

  private stubLunarDay(date: string): LunarDay {
    return {
      date,
      dayNumber: 7,
      phase: 'waxing_crescent',
      moonSign: 'Cancer' as ZodiacSign,
      illumination: 42,
      recommendations: {
        haircut: 'good',
        beauty: 'excellent',
        shopping: 'neutral',
        travel: 'good',
        diet: 'neutral',
        business: 'avoid',
        romance: 'excellent',
      },
    }
  }
}
