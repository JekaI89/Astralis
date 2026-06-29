'use client'

import { useState, useEffect, useRef } from 'react'
import { useDailyHoroscope } from '@/hooks/use-daily-horoscope'
import { getTodayIso } from '@astralis/core'

type Period = 'today' | 'tomorrow' | 'week' | 'month'

const PERIOD_LABELS: Record<Period, string> = {
  today: 'На сегодня',
  tomorrow: 'На завтра',
  week: 'На неделю',
  month: 'На месяц',
}

const PERIOD_OFFSETS: Record<Period, number> = {
  today: 0,
  tomorrow: 1,
  week: 7,
  month: 30,
}

function addDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]!
}

function deriveRings(energy: number, dateStr: string) {
  const d = new Date(dateStr)
  const day = d.getDay()
  const mon = d.getMonth() + 1
  const base = Math.round(energy * 10)
  const love = Math.min(98, Math.max(32, base + ((day * 7 + mon * 3 + 15) % 40) - 15))
  const career = Math.min(95, Math.max(25, base + ((mon * 11 + day * 5 + 8) % 50) - 22))
  const tonus = Math.min(100, Math.max(35, base + ((day * 3 + mon * 7 + 12) % 35) - 12))
  return { love, career, tonus }
}

const MOON_SIGNS_RU = [
  'Козероге', 'Водолее', 'Рыбах', 'Овне', 'Тельце', 'Близнецах',
  'Раке', 'Льве', 'Деве', 'Весах', 'Скорпионе', 'Стрельце',
]
const MOON_GLYPHS = ['♑','♒','♓','♈','♉','♊','♋','♌','♍','♎','♏','♐']
const ENERGY_LABELS = [
  '', 'Сложный день, береги ресурс',
  'Неблагоприятный фон', 'Пониженный тонус',
  'Нейтральный день', 'Умеренный фон',
  'Стабильный день', 'Хороший день',
  'Благоприятный день для решений', 'Сильный энергетический день',
  'Исключительно мощный день',
]

function getMoonSign(dateStr: string) {
  const d = new Date(dateStr)
  const idx = (d.getDate() + d.getMonth() * 3) % 12
  return { sign: MOON_SIGNS_RU[idx]!, glyph: MOON_GLYPHS[idx]! }
}

interface RingProps { label: string; pct: number; color: string; glow: string }

function Ring({ label, pct, color, glow }: RingProps) {
  const C = 194.8
  const offset = C * (1 - pct / 100)
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-[72px] h-[72px]">
        <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="36" cy="36" r="31" fill="none" stroke="rgba(255,255,255,.09)" strokeWidth="6" />
          <circle
            cx="36" cy="36" r="31" fill="none"
            stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray="194.8" strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset .8s cubic-bezier(.3,.8,.3,1)',
              filter: `drop-shadow(0 0 5px ${glow})`,
            }}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center text-[18px] text-white"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {pct}
        </div>
      </div>
      <span className="text-[11px] tracking-wide" style={{ color: 'rgba(255,255,255,.65)' }}>
        {label}
      </span>
    </div>
  )
}

export function DailyHoroscopeCard() {
  const [period, setPeriod] = useState<Period>('today')
  const [flip, setFlip] = useState(0)
  const prevPeriod = useRef<Period>('today')

  const dateStr = addDays(PERIOD_OFFSETS[period])
  const { data, isLoading } = useDailyHoroscope(dateStr)

  const today = getTodayIso()
  const moon = getMoonSign(today)

  function selectPeriod(p: Period) {
    if (p === period) return
    prevPeriod.current = period
    setPeriod(p)
    setFlip((n) => n + 1)
  }

  if (isLoading && !data) {
    return <DailyHoroscopeCardSkeleton />
  }

  const energy = data?.energy ?? 7
  const energyPct = Math.round(energy * 10)
  const rings = deriveRings(energy, dateStr)

  return (
    <div className="space-y-4">
      {/* Moon header */}
      <div className="flex items-center gap-4 mt-2">
        <div className="relative flex-shrink-0 anim-float" style={{ width: 78, height: 78 }}>
          <div
            className="absolute inset-[-8px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(226,183,85,.35), transparent 70%)' }}
          />
          <div
            className="relative flex items-center justify-center rounded-full text-3xl"
            style={{
              width: 78, height: 78,
              background: 'linear-gradient(135deg,rgba(226,183,85,.25),rgba(139,92,246,.2))',
              border: '1px solid rgba(226,183,85,.35)',
              boxShadow: '0 0 24px rgba(226,183,85,.3)',
            }}
          >
            🌙
          </div>
        </div>
        <div>
          <div
            className="text-[11px] font-medium uppercase tracking-[2.5px]"
            style={{ color: 'rgba(226,183,85,.85)' }}
          >
            Фаза Луны · Растущая
          </div>
          <h2
            className="text-[21px] leading-tight mt-0.5 text-white"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Луна в знаке {moon.sign}&nbsp;
            <span style={{ color: '#E2B755' }}>{moon.glyph}</span>
          </h2>
        </div>
      </div>

      {/* Energy bar */}
      <div className="glass px-4 py-3.5">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px]" style={{ color: 'rgba(255,255,255,.8)' }}>
            Энергетический фон дня
          </span>
          <span
            className="text-[18px]"
            style={{ fontFamily: 'var(--font-serif)', color: '#E2B755' }}
          >
            {energyPct}%
          </span>
        </div>
        <div
          className="mt-2.5 h-[7px] rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,.08)' }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${energyPct}%`,
              background: 'linear-gradient(90deg,#8B5CF6,#E2B755)',
              boxShadow: '0 0 12px rgba(226,183,85,.6)',
              transition: 'width .6s ease',
            }}
          />
        </div>
        <div className="mt-2 text-[12px]" style={{ color: 'rgba(255,255,255,.55)' }}>
          {ENERGY_LABELS[energy] ?? ENERGY_LABELS[7]}
        </div>
      </div>

      {/* Period tabs */}
      <div className="flex gap-2">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => {
          const active = period === p
          return (
            <button
              key={p}
              onClick={() => selectPeriod(p)}
              className="flex-1 py-2.5 rounded-[14px] text-[11.5px] transition-all border cursor-pointer"
              style={
                active
                  ? {
                      background: 'linear-gradient(135deg,#E2B755,#c89a3d)',
                      color: '#0A0915',
                      fontWeight: 600,
                      border: '1px solid rgba(226,183,85,.5)',
                      boxShadow: '0 6px 18px -6px rgba(226,183,85,.7)',
                    }
                  : {
                      background: 'rgba(255,255,255,.04)',
                      color: 'rgba(255,255,255,.65)',
                      border: '1px solid rgba(255,255,255,.12)',
                    }
              }
            >
              {PERIOD_LABELS[p]}
            </button>
          )
        })}
      </div>

      {/* Forecast card with flip animation */}
      <div
        key={flip}
        className="anim-cardflip"
        style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 24, padding: 20, backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', boxShadow: '0 18px 40px -20px rgba(0,0,0,.6)' }}
      >
        {/* Progress rings */}
        <div className="flex justify-around mb-2">
          <Ring label="Любовь"  pct={rings.love}   color="#E2B755" glow="rgba(226,183,85,.7)" />
          <Ring label="Карьера" pct={rings.career}  color="#8B5CF6" glow="rgba(139,92,246,.7)" />
          <Ring label="Тонус"   pct={rings.tonus}   color="#5ee08a" glow="rgba(94,224,138,.7)"  />
        </div>

        <div className="h-px my-4" style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.14),transparent)' }} />

        {/* Forecast text */}
        <div
          className="text-[16px] mb-1.5"
          style={{ fontFamily: 'var(--font-serif)', color: '#E2B755' }}
        >
          Общий вектор
        </div>
        <p className="text-[14px] leading-relaxed" style={{ color: 'rgba(255,255,255,.8)' }}>
          {data?.generalForecast ?? '…'}
        </p>

        <div className="flex flex-col gap-3.5 mt-4">
          {[
            { icon: '💼', title: 'Работа',   text: data?.careerForecast },
            { icon: '🤍', title: 'Любовь',   text: data?.loveForecast   },
            { icon: '🧘', title: 'Здоровье', text: data?.healthForecast },
          ].map(({ icon, title, text }) => (
            <div key={title} className="flex gap-3">
              <div className="text-[18px] flex-shrink-0">{icon}</div>
              <div>
                <div
                  className="text-[12px] uppercase tracking-[1px] mb-0.5"
                  style={{ color: 'rgba(255,255,255,.5)' }}
                >
                  {title}
                </div>
                <p className="text-[13.5px] leading-relaxed" style={{ color: 'rgba(255,255,255,.78)' }}>
                  {text ?? '…'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DailyHoroscopeCardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center gap-4 mt-2">
        <div className="w-[78px] h-[78px] rounded-full" style={{ background: 'rgba(255,255,255,.08)' }} />
        <div className="space-y-2 flex-1">
          <div className="h-2.5 rounded" style={{ background: 'rgba(255,255,255,.08)', width: '60%' }} />
          <div className="h-5 rounded" style={{ background: 'rgba(255,255,255,.08)', width: '80%' }} />
        </div>
      </div>
      <div className="glass px-4 py-4 space-y-2">
        <div className="h-3 rounded" style={{ background: 'rgba(255,255,255,.08)', width: '50%' }} />
        <div className="h-2 rounded" style={{ background: 'rgba(255,255,255,.08)' }} />
      </div>
      <div className="glass p-5 space-y-4">
        <div className="flex justify-around">
          {[1,2,3].map(i => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-[72px] h-[72px] rounded-full" style={{ background: 'rgba(255,255,255,.08)' }} />
              <div className="h-2 w-10 rounded" style={{ background: 'rgba(255,255,255,.08)' }} />
            </div>
          ))}
        </div>
        <div className="h-24 rounded" style={{ background: 'rgba(255,255,255,.06)' }} />
      </div>
    </div>
  )
}
