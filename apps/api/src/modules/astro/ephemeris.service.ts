import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { NatalChart, LunarDay, Transit } from '@astralis/types'

// Обёртка над Swiss Ephemeris или внешним API (AstroSeek, Astro.com API, и т.д.)
// Заменяется реальной имплементацией в зависимости от выбранного провайдера
@Injectable()
export class EphemerisService {
  private readonly apiKey: string
  private readonly baseUrl = 'https://astro-api-provider.example.com/v1'

  constructor(config: ConfigService) {
    this.apiKey = config.getOrThrow('ASTRO_API_KEY')
  }

  async calculateNatalChart(params: {
    date: string
    time: string
    lat: number
    lng: number
    timezone: string
  }): Promise<NatalChart> {
    const res = await fetch(`${this.baseUrl}/natal-chart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(params),
    })
    if (!res.ok) throw new Error(`Ephemeris API error: ${res.status}`)
    return res.json() as Promise<NatalChart>
  }

  async getTransits(params: {
    natalChartData: NatalChart
    date: string
  }): Promise<Transit[]> {
    const res = await fetch(`${this.baseUrl}/transits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(params),
    })
    if (!res.ok) throw new Error(`Ephemeris API error: ${res.status}`)
    return res.json() as Promise<Transit[]>
  }

  async getLunarDay(date: string): Promise<LunarDay> {
    const res = await fetch(`${this.baseUrl}/lunar-day?date=${date}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    })
    if (!res.ok) throw new Error(`Ephemeris API error: ${res.status}`)
    return res.json() as Promise<LunarDay>
  }
}
