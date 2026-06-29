import { Injectable, Logger } from '@nestjs/common'
import type { NatalChart, PlanetPosition, HouseData, Aspect, ZodiacSign, Planet, House, AspectType, Transit, LunarDay, LunarRecommendations } from '@astralis/types'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const swe = require('swisseph') as Record<string, unknown>

// ─── Константы Swiss Ephemeris ─────────────────────────────────────────────

const SE_SUN       = 0
const SE_MOON      = 1
const SE_MERCURY   = 2
const SE_VENUS     = 3
const SE_MARS      = 4
const SE_JUPITER   = 5
const SE_SATURN    = 6
const SE_URANUS    = 7
const SE_NEPTUNE   = 8
const SE_PLUTO     = 9
const SE_MEAN_NODE = 10
const SE_CHIRON    = 15

const SE_FLG_SPEED  = 256
const SE_FLG_SWIEPH = 2

const SIGNS: ZodiacSign[] = [
  'aries','taurus','gemini','cancer','leo','virgo',
  'libra','scorpio','sagittarius','capricorn','aquarius','pisces',
]

const HOUSE_RULERS: Planet[] = [
  'mars','venus','mercury','moon','sun','mercury',
  'venus','pluto','jupiter','saturn','uranus','neptune',
]

const PLANET_IDS: { planet: Planet; id: number }[] = [
  { planet: 'sun',      id: SE_SUN       },
  { planet: 'moon',     id: SE_MOON      },
  { planet: 'mercury',  id: SE_MERCURY   },
  { planet: 'venus',    id: SE_VENUS     },
  { planet: 'mars',     id: SE_MARS      },
  { planet: 'jupiter',  id: SE_JUPITER   },
  { planet: 'saturn',   id: SE_SATURN    },
  { planet: 'uranus',   id: SE_URANUS    },
  { planet: 'neptune',  id: SE_NEPTUNE   },
  { planet: 'pluto',    id: SE_PLUTO     },
  { planet: 'northNode', id: SE_MEAN_NODE },
  { planet: 'chiron',   id: SE_CHIRON    },
]

const ASPECT_DEFS: { type: AspectType; angle: number; orb: number }[] = [
  { type: 'conjunction', angle: 0,   orb: 8  },
  { type: 'opposition',  angle: 180, orb: 8  },
  { type: 'trine',       angle: 120, orb: 7  },
  { type: 'square',      angle: 90,  orb: 7  },
  { type: 'sextile',     angle: 60,  orb: 5  },
  { type: 'quincunx',    angle: 150, orb: 3  },
]

// ─── Geocoding ─────────────────────────────────────────────────────────────

export interface GeoResult { lat: number; lng: number; timezone: string; displayName: string }

export async function geocodeCity(city: string): Promise<GeoResult | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`
    const res = await fetch(url, { headers: { 'User-Agent': 'Astralis/1.0' } })
    const data = await res.json() as { lat: string; lon: string; display_name: string }[]
    if (!data[0]) return null
    const { lat, lon } = data[0]
    const tzRes = await fetch(`https://timezonefinder.michelfe.it/api/0?lat=${lat}&lng=${lon}`)
    const tzData = await tzRes.json() as { timezone_id?: string }
    return {
      lat: parseFloat(lat),
      lng: parseFloat(lon),
      timezone: tzData.timezone_id ?? 'UTC',
      displayName: data[0].display_name,
    }
  } catch {
    return null
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function degToSign(deg: number): { sign: ZodiacSign; degree: number } {
  const norm = ((deg % 360) + 360) % 360
  const signIdx = Math.floor(norm / 30)
  return { sign: SIGNS[signIdx]!, degree: norm % 30 }
}

function houseOf(degree: number, cusps: number[]): House {
  const norm = ((degree % 360) + 360) % 360
  for (let i = 0; i < 12; i++) {
    const start = cusps[i]!
    const end = cusps[(i + 1) % 12]!
    if (end > start) {
      if (norm >= start && norm < end) return (i + 1) as House
    } else {
      if (norm >= start || norm < end) return (i + 1) as House
    }
  }
  return 1
}

function julianDay(year: number, month: number, day: number, hour: number): number {
  const fn = swe['swe_julday'] as (y: number, m: number, d: number, h: number, c: number) => number
  return fn(year, month, day, hour, 1) // 1 = Gregorian
}

function calcPlanet(jd: number, planet: number): { lon: number; speed: number } | null {
  const fn = swe['swe_calc_ut'] as (jd: number, p: number, flags: number) => { longitude: number; longitudeSpeed: number; error?: string }
  const r = fn(jd, planet, SE_FLG_SPEED | SE_FLG_SWIEPH)
  if (r.error) return null
  return { lon: r.longitude, speed: r.longitudeSpeed }
}

function calcHouses(jd: number, lat: number, lng: number): { cusps: number[]; asc: number; mc: number } | null {
  const fn = swe['swe_houses'] as (jd: number, lat: number, lng: number, hsys: string) => { house: number[]; ascendant: number; mc: number; error?: string }
  const r = fn(jd, lat, lng, 'P') // P = Placidus
  if (r.error) return null
  return { cusps: r.house.slice(1), asc: r.ascendant, mc: r.mc }
}

function angleDiff(a: number, b: number): number {
  let d = Math.abs(a - b) % 360
  if (d > 180) d = 360 - d
  return d
}

// ─── Main Service ──────────────────────────────────────────────────────────

@Injectable()
export class SwissEphemerisService {
  private readonly logger = new Logger(SwissEphemerisService.name)

  async calculateNatalChart(params: {
    date: string   // YYYY-MM-DD
    time: string   // HH:MM or empty
    lat: number
    lng: number
    timezone?: string
  }): Promise<NatalChart> {
    const [year, month, day] = params.date.split('-').map(Number) as [number, number, number]
    const [hh, mm] = (params.time || '12:00').split(':').map(Number) as [number, number]
    const hour = hh + mm / 60

    const jd = julianDay(year, month, day, hour)
    const houses = calcHouses(jd, params.lat, params.lng)

    const cusps = houses?.cusps ?? Array.from({ length: 12 }, (_, i) => i * 30)
    const ascDeg = houses?.asc ?? 0
    const mcDeg  = houses?.mc  ?? 270

    // Рассчитываем планеты
    const planets: PlanetPosition[] = []
    for (const { planet, id } of PLANET_IDS) {
      const r = calcPlanet(jd, id)
      if (!r) continue
      const { sign, degree } = degToSign(r.lon)
      planets.push({
        planet,
        sign,
        degree,
        house: houseOf(r.lon, cusps),
        isRetrograde: r.speed < 0,
        speed: Math.abs(r.speed),
      })
    }

    // Добавляем Южный узел (180° от Северного)
    const northNode = planets.find(p => p.planet === 'northNode')
    if (northNode) {
      const snLon = (((northNode.degree + SIGNS.indexOf(northNode.sign) * 30) + 180) % 360)
      const { sign, degree } = degToSign(snLon)
      planets.push({
        planet: 'southNode', sign, degree,
        house: houseOf(snLon, cusps),
        isRetrograde: false, speed: 0,
      })
    }

    // Дома
    const housesData: HouseData[] = cusps.map((cuspDeg, i) => {
      const { sign } = degToSign(cuspDeg)
      return {
        number: (i + 1) as House,
        sign,
        degree: cuspDeg % 30,
        ruler: HOUSE_RULERS[i]!,
      }
    })

    // Аспекты
    const aspects = this.calculateAspects(planets)

    const asc = degToSign(ascDeg)
    const mc  = degToSign(mcDeg)

    this.logger.log(`Natal chart calculated for userId=${params.userId}, ASC=${asc.sign} ${asc.degree.toFixed(1)}°`)

    return {
      userId: params.userId,
      calculatedAt: new Date().toISOString(),
      planets,
      houses: housesData,
      aspects,
      ascendant: asc,
      midheaven: mc,
    }
  }

  private calculateAspects(planets: PlanetPosition[]): Aspect[] {
    const aspects: Aspect[] = []
    const lons = new Map<Planet, number>()
    for (const p of planets) {
      lons.set(p.planet, SIGNS.indexOf(p.sign) * 30 + p.degree)
    }

    const pairs = planets.flatMap((a, i) =>
      planets.slice(i + 1).map(b => [a.planet, b.planet] as [Planet, Planet])
    )

    for (const [p1, p2] of pairs) {
      const l1 = lons.get(p1)!
      const l2 = lons.get(p2)!
      const diff = angleDiff(l1, l2)

      for (const { type, angle, orb } of ASPECT_DEFS) {
        if (Math.abs(diff - angle) <= orb) {
          const actualOrb = Math.abs(diff - angle)
          const s1 = planets.find(p => p.planet === p1)!
          aspects.push({
            planet1: p1, planet2: p2, type,
            orb: parseFloat(actualOrb.toFixed(2)),
            isApplying: s1.speed > 0,
          })
          break
        }
      }
    }

    return aspects
  }

  async getLunarDay(date: string): Promise<LunarDay> {
    const [year, month, day] = date.split('-').map(Number) as [number, number, number]
    const jd = julianDay(year, month, day, 12)

    const moon = calcPlanet(jd, SE_MOON)
    const sun  = calcPlanet(jd, SE_SUN)

    if (!moon || !sun) return this.fallbackLunarDay(date)

    const moonLon = moon.lon
    const sunLon  = sun.lon
    const elongation = ((moonLon - sunLon) + 360) % 360
    const lunarDay   = Math.floor(elongation / 12) + 1
    const illumination = Math.round((1 - Math.cos((elongation * Math.PI) / 180)) / 2 * 100)

    const { sign: moonSign } = degToSign(moonLon)
    const moonPhase = this.moonPhase(elongation)
    const isVoidOfCourse = this.checkVoidOfCourse(jd, moonLon)

    return {
      date,
      lunarDay,
      moonSign,
      moonPhase,
      illumination,
      isVoidOfCourse,
      recommendations: this.lunarRecommendations(lunarDay, moonSign),
    }
  }

  async getTransits(natalChart: NatalChart, date: string): Promise<Transit[]> {
    const [year, month, day] = date.split('-').map(Number) as [number, number, number]
    const jd = julianDay(year, month, day, 12)

    const transits: Transit[] = []
    const natalLons = new Map<Planet, number>()
    for (const p of natalChart.planets) {
      natalLons.set(p.planet, SIGNS.indexOf(p.sign) * 30 + p.degree)
    }

    for (const { planet, id } of PLANET_IDS) {
      const r = calcPlanet(jd, id)
      if (!r) continue

      const transitLon = r.lon
      for (const [natalPlanet, natalLon] of natalLons) {
        const diff = angleDiff(transitLon, natalLon)
        for (const { type, angle, orb } of ASPECT_DEFS) {
          const actualOrb = Math.abs(diff - angle)
          if (actualOrb <= orb) {
            const house = natalChart.houses.find(h => {
              const cuspLon = SIGNS.indexOf(h.sign) * 30 + h.degree
              return Math.abs(angleDiff(transitLon, cuspLon)) < 15
            })?.number ?? 1

            transits.push({
              transitingPlanet: planet,
              natalPlanet,
              aspectType: type,
              exactDate: date,
              startDate: date,
              endDate: date,
              intensity: actualOrb < 1 ? 'high' : actualOrb < 3 ? 'medium' : 'low',
              description: this.transitDescription(planet, natalPlanet, type, house),
              house,
            })
            break
          }
        }
      }
    }

    return transits.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 }
      return order[a.intensity] - order[b.intensity]
    }).slice(0, 10)
  }

  private moonPhase(elongation: number): LunarDay['moonPhase'] {
    if (elongation < 22.5)  return 'new'
    if (elongation < 67.5)  return 'waxing_crescent'
    if (elongation < 112.5) return 'first_quarter'
    if (elongation < 157.5) return 'waxing_gibbous'
    if (elongation < 202.5) return 'full'
    if (elongation < 247.5) return 'waning_gibbous'
    if (elongation < 292.5) return 'last_quarter'
    return 'waning_crescent'
  }

  private checkVoidOfCourse(jd: number, moonLon: number): boolean {
    // Упрощённая проверка: луна в последних 3° знака и нет аспектов
    const degInSign = moonLon % 30
    return degInSign > 27
  }

  private lunarRecommendations(lunarDay: number, sign: ZodiacSign): LunarRecommendations {
    const goodDays = [1,3,6,7,10,11,12,13,16,17,20,21,24,25]
    const badDays  = [9,15,19,23,29]
    const quality = badDays.includes(lunarDay) ? 'avoid'
      : goodDays.includes(lunarDay) ? 'excellent' : 'good'

    const waterSigns: ZodiacSign[] = ['cancer','scorpio','pisces']
    const earthSigns: ZodiacSign[] = ['taurus','virgo','capricorn']

    return {
      haircut:  ['taurus','leo','scorpio','aquarius'].includes(sign) ? 'excellent' : quality,
      beauty:   waterSigns.includes(sign) ? 'excellent' : quality,
      shopping: earthSigns.includes(sign) ? 'excellent' : quality,
      travel:   ['gemini','sagittarius','aquarius'].includes(sign) ? 'excellent' : quality,
      diet:     lunarDay <= 15 ? 'good' : 'neutral',
      business: earthSigns.includes(sign) ? 'excellent' : quality,
      romance:  ['taurus','libra','scorpio','pisces'].includes(sign) ? 'excellent' : quality,
    }
  }

  private transitDescription(transit: Planet, natal: Planet, aspect: AspectType, house: House): string {
    const PLANET_RU: Record<Planet, string> = {
      sun: 'Солнце', moon: 'Луна', mercury: 'Меркурий', venus: 'Венера',
      mars: 'Марс', jupiter: 'Юпитер', saturn: 'Сатурн', uranus: 'Уран',
      neptune: 'Нептун', pluto: 'Плутон', northNode: 'Северный узел',
      southNode: 'Южный узел', chiron: 'Хирон', ascendant: 'Асцендент',
      midheaven: 'Середина неба',
    }
    const ASPECT_RU: Record<AspectType, string> = {
      conjunction: 'соединение', opposition: 'оппозиция', trine: 'тригон',
      square: 'квадрат', sextile: 'секстиль', quincunx: 'квинконс',
    }
    return `${PLANET_RU[transit]} формирует ${ASPECT_RU[aspect]} к вашему натальному ${PLANET_RU[natal]} в ${house} доме`
  }

  private fallbackLunarDay(date: string): LunarDay {
    return {
      date, lunarDay: 1, moonSign: 'aries', moonPhase: 'new',
      illumination: 0, isVoidOfCourse: false,
      recommendations: {
        haircut: 'neutral', beauty: 'good', shopping: 'neutral',
        travel: 'good', diet: 'neutral', business: 'good', romance: 'neutral',
      },
    }
  }
}
