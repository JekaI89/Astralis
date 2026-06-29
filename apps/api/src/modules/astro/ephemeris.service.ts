import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { NatalChart, LunarDay, Transit, ZodiacSign, Planet, House } from '@astralis/types'

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
    userId?: string
  }): Promise<NatalChart> {
    if (!this.apiKey) return this.stubNatalChart(params.userId ?? 'unknown')
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
    const houseRulers: Planet[] = ['mars','venus','mercury','moon','sun','mercury','venus','pluto','jupiter','saturn','uranus','neptune']
    return {
      userId,
      calculatedAt: new Date().toISOString(),
      planets: [
        { planet: 'sun',     sign: 'leo',         degree: 12.5, house: 5, isRetrograde: false, speed: 0.98 },
        { planet: 'moon',    sign: 'scorpio',      degree: 7.3,  house: 8, isRetrograde: false, speed: 13.2 },
        { planet: 'mercury', sign: 'virgo',        degree: 3.1,  house: 6, isRetrograde: false, speed: 1.4 },
        { planet: 'venus',   sign: 'gemini',       degree: 21.0, house: 2, isRetrograde: false, speed: 1.2 },
        { planet: 'mars',    sign: 'aries',        degree: 15.8, house: 1, isRetrograde: false, speed: 0.7 },
      ],
      houses: Array.from({ length: 12 }, (_, i) => ({
        number: (i + 1) as House,
        sign: 'leo' as ZodiacSign,
        degree: i * 30,
        ruler: houseRulers[i]!,
      })),
      aspects: [
        { planet1: 'sun', planet2: 'moon', type: 'trine', orb: 2.1, isApplying: true },
      ],
      ascendant: { sign: 'sagittarius', degree: 14.2 },
      midheaven: { sign: 'virgo', degree: 8.5 },
    }
  }

  private stubLunarDay(date: string): LunarDay {
    return {
      date,
      lunarDay: 7,
      moonSign: 'cancer',
      moonPhase: 'waxing_crescent',
      illumination: 42,
      isVoidOfCourse: false,
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
