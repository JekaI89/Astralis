import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { NatalChart, LunarDay, Transit, ZodiacSign, Planet, AspectType, House } from '@astralis/types'

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
    const houseRulers: Planet[] = ['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Pluto','Jupiter','Saturn','Uranus','Neptune']
    return {
      userId,
      calculatedAt: new Date().toISOString(),
      planets: [
        { planet: 'Sun' as Planet,     sign: 'Leo' as ZodiacSign,     degree: 12.5, house: 5 as House, isRetrograde: false, speed: 0.98 },
        { planet: 'Moon' as Planet,    sign: 'Scorpio' as ZodiacSign, degree: 7.3,  house: 8 as House, isRetrograde: false, speed: 13.2 },
        { planet: 'Mercury' as Planet, sign: 'Virgo' as ZodiacSign,   degree: 3.1,  house: 6 as House, isRetrograde: false, speed: 1.4 },
        { planet: 'Venus' as Planet,   sign: 'Gemini' as ZodiacSign,  degree: 21.0, house: 2 as House, isRetrograde: false, speed: 1.2 },
        { planet: 'Mars' as Planet,    sign: 'Aries' as ZodiacSign,   degree: 15.8, house: 1 as House, isRetrograde: false, speed: 0.7 },
      ],
      houses: Array.from({ length: 12 }, (_, i) => ({
        number: (i + 1) as House,
        sign: 'Leo' as ZodiacSign,
        degree: i * 30,
        ruler: houseRulers[i] as Planet,
      })),
      aspects: [
        { planet1: 'Sun' as Planet, planet2: 'Moon' as Planet, type: 'trine' as AspectType, orb: 2.1, isApplying: true },
      ],
      ascendant: { sign: 'Sagittarius' as ZodiacSign, degree: 14.2 },
      midheaven: { sign: 'Virgo' as ZodiacSign, degree: 8.5 },
    }
  }

  private stubLunarDay(date: string): LunarDay {
    return {
      date,
      lunarDay: 7,
      moonSign: 'Cancer' as ZodiacSign,
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
