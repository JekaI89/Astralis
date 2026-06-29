'use client'

import { useState } from 'react'
import { useNatalChart } from '@/hooks/use-natal-chart'
import { ZODIAC_NAMES_RU, ZODIAC_EMOJIS } from '@astralis/core'
import type { PlanetPosition, ZodiacSign } from '@astralis/types'

const PLANET_GLYPHS: Record<string, string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
  ascendant: '↑', midheaven: 'MC',
}

const PLANET_NAMES_LOCAL: Record<string, string> = {
  sun: 'Солнце', moon: 'Луна', mercury: 'Меркурий', venus: 'Венера',
  mars: 'Марс', jupiter: 'Юпитер', saturn: 'Сатурн',
  uranus: 'Уран', neptune: 'Нептун', pluto: 'Плутон',
  ascendant: 'Асцендент', midheaven: 'МС',
}

const PLANET_COLORS: Record<string, { ring: string; glow: string }> = {
  sun:     { ring: '#E2B755', glow: 'rgba(226,183,85,.8)' },
  moon:    { ring: '#8B5CF6', glow: 'rgba(139,92,246,.8)' },
  mercury: { ring: '#8B5CF6', glow: 'rgba(139,92,246,.8)' },
  venus:   { ring: '#E2B755', glow: 'rgba(226,183,85,.8)' },
  mars:    { ring: '#E2B755', glow: 'rgba(226,183,85,.8)' },
  jupiter: { ring: '#5ee08a', glow: 'rgba(94,224,138,.8)' },
  saturn:  { ring: '#8B5CF6', glow: 'rgba(139,92,246,.8)' },
}

const ZODIAC_GLYPHS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓']
const ZODIAC_ORDER: ZodiacSign[] = [
  'aries','taurus','gemini','cancer','leo','virgo',
  'libra','scorpio','sagittarius','capricorn','aquarius','pisces',
]

const ASPECT_COLORS: Record<string, string> = {
  conjunction: 'rgba(226,183,85,.6)',
  trine:       'rgba(94,224,138,.55)',
  sextile:     'rgba(94,224,138,.4)',
  opposition:  'rgba(244,114,114,.55)',
  square:      'rgba(244,114,114,.45)',
  quincunx:    'rgba(139,92,246,.5)',
}

const BIG3 = [
  { key: 'sun',       sub: 'Личность', color: '#E2B755', bg: 'rgba(226,183,85,.12)', border: 'rgba(226,183,85,.3)' },
  { key: 'moon',      sub: 'Эмоции',   color: '#8B5CF6', bg: 'rgba(139,92,246,.14)', border: 'rgba(139,92,246,.35)' },
  { key: 'ascendant', sub: 'Маска',    color: '#E2B755', bg: 'rgba(226,183,85,.12)', border: 'rgba(226,183,85,.3)', small: true },
]

const CX = 150, CY = 150
function polar(r: number, deg: number): [number, number] {
  const a = (deg - 90) * (Math.PI / 180)
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)]
}
function planetDeg(p: PlanetPosition): number {
  return ZODIAC_ORDER.indexOf(p.sign) * 30 + p.degree
}

function getPlanetText(p: PlanetPosition): string {
  const sign = ZODIAC_NAMES_RU[p.sign] ?? p.sign
  const name = PLANET_NAMES_LOCAL[p.planet] ?? p.planet
  const map: Record<string, string> = {
    sun:     `Ваша суть — сиять и вдохновлять. ${name} в ${sign} (Дом ${p.house}) определяет вашу личность и жизненную силу.`,
    moon:    `Ваши эмоции глубоки и тонки. ${name} в ${sign} показывает, как вы чувствуете и что нужно вам для покоя.`,
    mercury: `Ясный аналитичный ум. ${name} в ${sign} определяет стиль мышления и общения с миром.`,
    venus:   `В любви вам важны гармония и красота. ${name} в ${sign} раскрывает, как вы любите и что притягиваете.`,
    mars:    `Огонь и воля к действию. ${name} в ${sign} показывает, как вы добиваетесь целей и отстаиваете себя.`,
    jupiter: `Щедрость и рост. ${name} в ${sign} указывает, в какой сфере вас ждёт удача и расцвет.`,
    saturn:  `Дисциплина и уроки. ${name} в ${sign} обозначает ваши ключевые испытания, которые ведут к мудрости.`,
  }
  return map[p.planet] ?? `${name} в ${sign}, Дом ${p.house}. Эта позиция оказывает особое влияние на ваш путь.`
}

export function NatalChartView() {
  const { data, isLoading } = useNatalChart()
  const [selected, setSelected] = useState<string | null>(null)

  if (isLoading) {
    return <div className="h-48 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,.06)' }} />
  }
  if (!data) return null

  const visiblePlanets = data.planets.filter((p) =>
    ['sun','moon','mercury','venus','mars','jupiter','saturn'].includes(p.planet)
  )

  const planetNodes = visiblePlanets.map((p) => {
    const [cx, cy] = polar(96, planetDeg(p))
    const c = PLANET_COLORS[p.planet] ?? { ring: '#fff', glow: 'rgba(255,255,255,.5)' }
    return { id: p.planet, glyph: PLANET_GLYPHS[p.planet] ?? '?', cx, cy, ...c, data: p }
  })

  const aspectLines = data.aspects
    .filter((a) =>
      ['trine','sextile','conjunction','opposition','square'].includes(a.type) &&
      visiblePlanets.some((p) => p.planet === a.planet1) &&
      visiblePlanets.some((p) => p.planet === a.planet2)
    )
    .slice(0, 6)
    .map((a) => {
      const p1 = data.planets.find((p) => p.planet === a.planet1)
      const p2 = data.planets.find((p) => p.planet === a.planet2)
      if (!p1 || !p2) return null
      const [x1, y1] = polar(96, planetDeg(p1))
      const [x2, y2] = polar(96, planetDeg(p2))
      return { x1, y1, x2, y2, color: ASPECT_COLORS[a.type] ?? 'rgba(255,255,255,.3)' }
    })
    .filter(Boolean) as { x1: number; y1: number; x2: number; y2: number; color: string }[]

  const spokes = Array.from({ length: 12 }, (_, i) => {
    const [x1, y1] = polar(58, i * 30)
    const [x2, y2] = polar(142, i * 30)
    return { x1, y1, x2, y2 }
  })

  const signs = ZODIAC_GLYPHS.map((g, i) => {
    const [x, y] = polar(131, i * 30 + 15)
    return { glyph: g, x, y }
  })

  const selPlanet = selected ? visiblePlanets.find((p) => p.planet === selected) : null
  const selColor  = selected ? (PLANET_COLORS[selected] ?? { ring: '#E2B755' }).ring : '#E2B755'
  const chartScale = selected ? 'scale(0.78) translateY(-26px)' : 'scale(1)'

  return (
    <div>
      {/* SVG Wheel */}
      <div className="flex justify-center mt-2">
        <div style={{ transform: chartScale, transition: 'transform .5s cubic-bezier(.3,.8,.3,1)' }}>
          <svg width="300" height="300" viewBox="0 0 300 300">
            <defs>
              <radialGradient id="mmWheel" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="rgba(139,92,246,.10)" />
                <stop offset="100%" stopColor="rgba(139,92,246,0)"  />
              </radialGradient>
            </defs>
            <circle cx="150" cy="150" r="148" fill="url(#mmWheel)" />
            <circle cx="150" cy="150" r="142" fill="none" stroke="rgba(226,183,85,.45)" strokeWidth="1" />
            <circle cx="150" cy="150" r="120" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="1" />
            <circle cx="150" cy="150" r="58"  fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="1" />

            {spokes.map((s, i) => (
              <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
                stroke="rgba(255,255,255,.1)" strokeWidth="1" />
            ))}
            {aspectLines.map((a, i) => (
              <line key={i} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
                stroke={a.color} strokeWidth="1" strokeDasharray="3 3" opacity="0.55" />
            ))}
            {signs.map((z, i) => (
              <text key={i} x={z.x} y={z.y} textAnchor="middle" dominantBaseline="central"
                fontSize="14" fill="rgba(226,183,85,.7)">{z.glyph}</text>
            ))}
            {planetNodes.map((p) => (
              <g key={p.id} onClick={() => setSelected(selected === p.id ? null : p.id)}
                style={{ cursor: 'pointer' }}>
                <circle cx={p.cx} cy={p.cy} r="15" fill="rgba(10,9,21,.85)"
                  stroke={p.ring} strokeWidth="1.5"
                  style={{ filter: `drop-shadow(0 0 6px ${p.glow})` }} />
                <text x={p.cx} y={p.cy} textAnchor="middle" dominantBaseline="central"
                  fontSize="14" fill={p.ring}>{p.glyph}</text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      <p className="text-center text-[12px] mt-1 mb-5" style={{ color: 'rgba(255,255,255,.45)' }}>
        Нажмите на планету, чтобы узнать значение
      </p>

      {/* Big Three */}
      <div className="text-[18px] text-white mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
        Ваша «Большая тройка»
      </div>
      <div className="flex flex-col gap-2.5">
        {BIG3.map(({ key, sub, color, bg, border, small }) => {
          const sign: ZodiacSign | undefined =
            key === 'ascendant' ? data.ascendant.sign
            : data.planets.find((p) => p.planet === key)?.sign
          return (
            <div key={key}
              className="flex items-center gap-3.5 rounded-[18px] px-4 py-3.5"
              style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', backdropFilter: 'blur(14px)' }}
            >
              <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center"
                style={{ fontSize: small ? 13 : 20, color, background: bg, border: `1px solid ${border}` }}>
                {PLANET_GLYPHS[key]}
              </div>
              <div className="flex-1">
                <div className="text-[12px]" style={{ color: 'rgba(255,255,255,.5)' }}>
                  {PLANET_NAMES_LOCAL[key]} · {sub}
                </div>
                <div className="text-[15px] font-medium text-white">
                  {sign ? `${ZODIAC_NAMES_RU[sign]} ${ZODIAC_EMOJIS[sign]}` : '—'}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Planet bottom sheet */}
      {selected && selPlanet && (
        <>
          <div className="fixed inset-0 z-40"
            style={{ background: 'rgba(5,4,12,.55)', backdropFilter: 'blur(2px)' }}
            onClick={() => setSelected(null)} />
          <div className="fixed left-0 right-0 bottom-0 z-50 anim-sheetup"
            style={{
              background: 'linear-gradient(180deg,#1a1330,#120c22)',
              borderTop: '1px solid rgba(226,183,85,.3)',
              borderRadius: '30px 30px 44px 44px',
              padding: '22px 24px 120px',
              boxShadow: '0 -20px 50px -10px rgba(0,0,0,.7)',
            }}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'rgba(255,255,255,.22)' }} />
            <div className="flex items-center gap-3.5">
              <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-[24px]"
                style={{ color: selColor, background: 'rgba(255,255,255,.06)', border: `1px solid ${selColor}` }}>
                {PLANET_GLYPHS[selected]}
              </div>
              <div>
                <div className="text-[21px] text-white" style={{ fontFamily: 'var(--font-serif)' }}>
                  {PLANET_NAMES_LOCAL[selected]} в {ZODIAC_NAMES_RU[selPlanet.sign]}
                </div>
                <div className="text-[12.5px]" style={{ color: '#E2B755' }}>
                  {PLANET_NAMES_LOCAL[selected]} · Дом {selPlanet.house}
                  {selPlanet.isRetrograde ? ' Rx' : ''}
                </div>
              </div>
            </div>
            <p className="text-[14px] leading-[1.7] mt-4" style={{ color: 'rgba(255,255,255,.8)' }}>
              {getPlanetText(selPlanet)}
            </p>
          </div>
        </>
      )}
    </div>
  )
}
