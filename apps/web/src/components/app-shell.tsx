'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

type Phase = 'splash' | 'onboarding' | 'app'
type Tab = 'home' | 'natal' | 'synastry' | 'profile'
type DayTab = 'today' | 'tomorrow' | 'week' | 'month'
type SynStage = 'input' | 'calculating' | 'result'

const STORAGE_KEY = 'astralis_birth_data'
const TOKEN_KEY = 'astralis_token'
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

interface BirthData {
  name: string
  date: string
  time: string
  city: string
}

type AuthMethod = 'choose' | 'email_register' | 'email_login'

interface PlanetData {
  id: string
  glyph: string
  name: string
  sign: string
  house: string
  a: number
  r: number
  color: string
  desc: string
}

const PLANET_DATA: PlanetData[] = [
  { id: 'sun',   glyph: '☉',   name: 'Солнце',      sign: 'Льве',       house: 'V дом',    a: -55,  r: 95,  color: '#E2B755', desc: 'Солнце во Льве в V доме. Вы созданы, чтобы творить и вдохновлять. Признание и самовыражение — ваше топливо.' },
  { id: 'moon',  glyph: '☾',   name: 'Луна',        sign: 'Скорпионе',  house: 'VIII дом', a: 28,   r: 82,  color: '#8B5CF6', desc: 'Луна в Скорпионе в VIII доме. Глубокие, всепоглощающие эмоции. Вы чувствуете оттенки, недоступные другим.' },
  { id: 'venus', glyph: '♀',   name: 'Венера',      sign: 'Близнецах',  house: 'II дом',   a: 148,  r: 90,  color: '#E2B755', desc: 'Венера в Близнецах во II доме. В любви важны слова, лёгкость и интеллектуальная игра. Ваша ценность — в свободе.' },
  { id: 'mars',  glyph: '♂',   name: 'Марс',        sign: 'Овне',       house: 'I дом',    a: -118, r: 72,  color: '#8B5CF6', desc: 'Марс в Овне в I доме. Прямая, напористая энергия. Вы первыми бросаетесь в бой и заряжаете остальных.' },
  { id: 'merc',  glyph: '☿',   name: 'Меркурий',    sign: 'Деве',       house: 'VI дом',   a: 96,   r: 100, color: '#E2B755', desc: 'Меркурий в Деве в VI доме. Аналитический, точный ум. Дьявол кроется в деталях — и вы их видите.' },
  { id: 'jup',   glyph: '♃',   name: 'Юпитер',      sign: 'Стрельце',   house: 'IX дом',   a: 206,  r: 74,  color: '#8B5CF6', desc: 'Юпитер в Стрельце в IX доме. Удача приходит через знания, путешествия и расширение горизонтов.' },
  { id: 'asc',   glyph: 'Asc', name: 'Асцендент',   sign: 'Стрельце',   house: 'I дом',    a: 178,  r: 120, color: '#E2B755', desc: 'Асцендент в Стрельце. Окружающие видят в вас оптимиста и искателя приключений, всегда устремлённого вперёд.' },
]

const FORECASTS = {
  today:    { general: 'Космос на вашей стороне. День располагает к смелым решениям и искренним разговорам. Доверьтесь интуиции — сегодня она особенно остра.', work: 'Удачное время для презентаций и переговоров. Возможен неожиданный союзник.', love: 'Венера усиливает магнетизм. Признания будут услышаны.', health: 'Высокий тонус. Подойдут динамичные практики и прогулки на воздухе.', lovePct: 85, careerPct: 40, tonePct: 90, energy: 82, moonSign: 'Рака ♋' },
  tomorrow: { general: 'Замедлитесь. Завтрашний день просит тишины и наблюдения, а не резких действий.', work: 'Отложите крупные сделки. Хороший момент разобрать накопившиеся задачи.', love: 'Возможна лёгкая недосказанность. Говорите прямо и мягко.', health: 'Берегите ресурс. Сон и вода — ваши союзники.', lovePct: 60, careerPct: 55, tonePct: 48, energy: 54, moonSign: 'Льва ♌' },
  week:     { general: 'Неделя роста. К середине недели придёт ясность по важному вопросу, который давно вас занимал.', work: 'Карьерный фокус усиливается. Ваши усилия наконец заметят.', love: 'Тёплый период для пар. Одиноких ждёт интересное знакомство.', health: 'Энергия стабильна. Поддержите привычный режим.', lovePct: 74, careerPct: 78, tonePct: 70, energy: 71, moonSign: 'Девы ♍' },
  month:    { general: 'Месяц трансформаций. Старое уходит, освобождая место новому. Не цепляйтесь за отжившее.', work: 'Перспектива смены роли или проекта. Будьте открыты предложениям.', love: 'Глубина важнее количества. Связи выходят на новый уровень.', health: 'Слушайте тело. Хорошее время для перезагрузки привычек.', lovePct: 68, careerPct: 82, tonePct: 65, energy: 69, moonSign: 'Скорпиона ♏' },
}

function pol(r: number, deg: number) {
  const cx = 160, cy = 160, a = (deg * Math.PI) / 180
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}

export function AppShell() {
  const [phase, setPhase] = useState<Phase>('splash')
  const [tab, setTab] = useState<Tab>('home')
  const [dayTab, setDayTab] = useState<DayTab>('today')
  const [selectedPlanet, setSelectedPlanet] = useState<(PlanetData & { x: number; y: number; fill: string; halo: number; strokeW: number; fontSize: number }) | null>(null)
  const [birthData, setBirthData] = useState<BirthData | null>(null)
  const [form, setForm] = useState<BirthData>({ name: '', date: '', time: '', city: '' })
  const [emailForm, setEmailForm] = useState({ email: '', password: '' })
  const [authMethod, setAuthMethod] = useState<AuthMethod>('choose')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [onboardStep, setOnboardStep] = useState(0)
  const [synStage, setSynStage] = useState<SynStage>('input')
  const [partnerAdded, setPartnerAdded] = useState(false)
  const [score, setScore] = useState(0)
  const [cardKey, setCardKey] = useState(0)

  const calcTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scoreTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (calcTimer.current) clearTimeout(calcTimer.current)
      if (scoreTimer.current) clearInterval(scoreTimer.current)
    }
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try { setBirthData(JSON.parse(saved) as BirthData) } catch { /* ignore */ }
    }
  }, [])

  const onSplashEnd = useCallback((e: React.AnimationEvent) => {
    if (e.animationName !== 'splashSeq') return
    const token = localStorage.getItem(TOKEN_KEY)
    const saved = localStorage.getItem(STORAGE_KEY)
    // Нужен либо JWT токен (полная авторизация) либо данные (офлайн-режим)
    setPhase(token || saved ? 'app' : 'onboarding')
  }, [])

  const submitBirth = async () => {
    if (!form.name || !form.date) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
    setBirthData(form)
    setPhase('app')
  }

  const loginWithTelegram = async () => {
    const tg = (window as unknown as { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp
    if (!tg?.initData || !API_URL) {
      // Не в Telegram — переходим к email
      setAuthMethod('email_register')
      return
    }
    setAuthLoading(true)
    setAuthError('')
    try {
      const res = await fetch(`${API_URL}/auth/telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: tg.initData,
          birthDate: form.date || undefined,
          birthTime: form.time || undefined,
          birthPlace: form.city || undefined,
        }),
      })
      const data = await res.json() as { token?: string; message?: string }
      if (!res.ok) throw new Error(data.message ?? 'Ошибка авторизации')
      localStorage.setItem(TOKEN_KEY, data.token ?? '')
      setBirthData(form)
      setPhase('app')
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setAuthLoading(false)
    }
  }

  const registerEmail = async () => {
    if (!emailForm.email || !emailForm.password || !form.name || !form.date) return
    setAuthLoading(true)
    setAuthError('')
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: emailForm.email,
          password: emailForm.password,
          birthDate: form.date,
          birthTime: form.time || undefined,
          birthPlace: form.city || undefined,
        }),
      })
      const data = await res.json() as { token?: string; message?: string }
      if (!res.ok) throw new Error(data.message ?? 'Ошибка регистрации')
      localStorage.setItem(TOKEN_KEY, data.token ?? '')
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
      setBirthData(form)
      setPhase('app')
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setAuthLoading(false)
    }
  }

  const loginEmail = async () => {
    if (!emailForm.email || !emailForm.password) return
    setAuthLoading(true)
    setAuthError('')
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailForm.email, password: emailForm.password }),
      })
      const data = await res.json() as { token?: string; user?: BirthData; message?: string }
      if (!res.ok) throw new Error(data.message ?? 'Неверный email или пароль')
      localStorage.setItem(TOKEN_KEY, data.token ?? '')
      setPhase('app')
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setAuthLoading(false)
    }
  }

  const goTab = (t: Tab) => { setTab(t); setSelectedPlanet(null) }

  const handleDayTab = (d: DayTab) => {
    setDayTab(d)
    setCardKey((k) => k + 1)
  }

  const calcSyn = () => {
    if (!partnerAdded) return
    setSynStage('calculating')
    calcTimer.current = setTimeout(() => {
      setSynStage('result')
      setScore(0)
      let cur = 0
      scoreTimer.current = setInterval(() => {
        cur += 2
        if (cur >= 78) { cur = 78; clearInterval(scoreTimer.current!) }
        setScore(cur)
      }, 28)
    }, 2400)
  }

  const resetSyn = () => {
    setSynStage('input')
    setPartnerAdded(false)
    setScore(0)
  }

  const f = FORECASTS[dayTab]
  const circ = 2 * Math.PI * 28
  const dash = (pct: number) => circ * (1 - pct / 100)
  const tabColor = (t: Tab) => tab === t ? '#E2B755' : 'rgba(255,255,255,.45)'

  const zodiacGlyphs = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓']
  const zodiacSigns = zodiacGlyphs.map((g, i) => { const p = pol(134, -90 + i * 30 + 15); return { glyph: g, x: p.x, y: p.y } })
  const houseTicks = zodiacGlyphs.map((_, i) => { const o = pol(152, -90 + i * 30); const inn = pol(116, -90 + i * 30); return { x1: inn.x, y1: inn.y, x2: o.x, y2: o.y } })

  const planets = PLANET_DATA.map((p) => {
    const c = pol(p.r, p.a)
    const isSelected = selectedPlanet?.id === p.id
    return {
      ...p, x: c.x, y: c.y,
      halo: isSelected ? 0.85 : 0,
      strokeW: isSelected ? 2.5 : 1.3,
      fill: isSelected ? (p.color === '#E2B755' ? 'rgba(226,183,85,.2)' : 'rgba(139,92,246,.22)') : 'rgba(16,10,34,.85)',
      fontSize: p.id === 'asc' ? 7 : 13,
    }
  })

  const findP = (id: string) => planets.find((x) => x.id === id)!
  const aspectPairs: [string, string, string][] = [['sun','jup','#E2B755'],['venus','mars','#8B5CF6'],['moon','merc','#E2B755'],['sun','moon','#8B5CF6']]
  const aspects = aspectPairs.map(([a, b, color]) => {
    const pa = findP(a), pb = findP(b)
    return { x1: pa.x, y1: pa.y, x2: pb.x, y2: pb.y, color }
  })

  const big3 = [
    { glyph: '☉', body: 'Солнце',     sub: 'Личность', sign: 'Лев ♌',       color: '#E2B755', bg: 'rgba(226,183,85,.14)' },
    { glyph: '☾', body: 'Луна',       sub: 'Эмоции',   sign: 'Скорпион ♏',  color: '#8B5CF6', bg: 'rgba(139,92,246,.16)' },
    { glyph: '↑', body: 'Асцендент',  sub: 'Маска',    sign: 'Стрелец ♐',   color: '#E2B755', bg: 'rgba(226,183,85,.14)' },
  ]

  const bdata: [string, number][] = [['Эмоциональная связь', 84], ['Интеллектуальный союз', 72], ['Сексуальное притяжение', 90], ['Бытовая гармония', 61]]
  const breakdown = bdata.map(([label, pct], i) => {
    const gold = i % 2 === 0
    return { label, pct, bar: gold ? 'linear-gradient(90deg,#b98f33,#E2B755)' : 'linear-gradient(90deg,#5b3aa6,#8B5CF6)', color: gold ? '#E2B755' : '#8B5CF6', glow: gold ? 'rgba(226,183,85,.5)' : 'rgba(139,92,246,.5)' }
  })

  const scoreCirc = 2 * Math.PI * 74

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: 'linear-gradient(168deg,#0A0915 0%,#120C24 55%,#160F29 100%)', fontFamily: 'Inter, system-ui, sans-serif', position: 'relative', overflow: 'hidden' }}>

      {/* SPLASH */}
      {phase === 'splash' && (
        <div onAnimationEnd={onSplashEnd} className="anim-splash" style={{ position: 'absolute', inset: 0, zIndex: 90, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(130% 100% at 50% 30%, #160F29 0%, #0A0915 75%)' }}>
          <svg width="240" height="220" viewBox="0 0 240 220">
            <polyline points="40,150 78,120 118,134 150,96 196,70 168,118 126,160 88,176" fill="none" stroke="#E2B755" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="620" strokeDashoffset="620" style={{ filter: 'drop-shadow(0 0 6px rgba(226,183,85,.8))', animation: 'constDraw 2.4s ease .3s forwards' }}/>
            <g fill="#fff" style={{ filter: 'drop-shadow(0 0 5px rgba(226,183,85,.9))' }}>
              {([
                [40,150,3,.2],[78,120,2.4,.5],[118,134,2.6,.8],[150,96,3.4,.1],
                [196,70,3.8,.6],[168,118,2.2,1],[126,160,2.8,.4],[88,176,2.4,.9]
              ] as [number,number,number,number][]).map(([cx, cy, r, delay], i) => (
                <circle key={i} cx={cx} cy={cy} r={r} style={{ animation: `twinkle ${2 + i * 0.1}s ease infinite ${delay}s` }}/>
              ))}
            </g>
          </svg>
          <div style={{ font: '700 46px Playfair Display, serif', color: '#E2B755', marginTop: 14, letterSpacing: 1, filter: 'drop-shadow(0 0 18px rgba(226,183,85,.5))' }}>♌</div>
          <div style={{ font: '600 22px Playfair Display, serif', color: '#fff', marginTop: 8 }}>Astralis</div>
          <div style={{ font: '400 13px Inter', color: 'rgba(255,255,255,.5)', marginTop: 6, letterSpacing: '.5px' }}>Составляем ваш космический портрет…</div>
        </div>
      )}

      {/* ONBOARDING */}
      {phase === 'onboarding' && (
        <div className="anim-fadeup" style={{ position: 'absolute', inset: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
          <div style={{ width: '100%', maxWidth: 400 }}>

            {/* Выбор метода входа */}
            {authMethod === 'choose' && onboardStep === 0 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 52, marginBottom: 12 }}>🔮</div>
                <div style={{ font: '700 28px Playfair Display, serif', color: '#fff', marginBottom: 8 }}>Добро пожаловать</div>
                <div style={{ font: '400 14px Inter', color: 'rgba(255,255,255,.5)', marginBottom: 36 }}>Войдите, чтобы получить персональный прогноз</div>
                <button
                  onClick={loginWithTelegram}
                  style={{ width: '100%', padding: 16, borderRadius: 16, border: 'none', background: 'linear-gradient(90deg,#229ED9,#1a8ac4)', color: '#fff', font: '600 15px Inter', cursor: 'pointer', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                >
                  <span style={{ fontSize: 20 }}>✈️</span> Войти через Telegram
                </button>
                <button
                  onClick={() => setAuthMethod('email_register')}
                  style={{ width: '100%', padding: 16, borderRadius: 16, border: '1px solid rgba(226,183,85,.35)', background: 'rgba(226,183,85,.08)', color: '#E2B755', font: '600 15px Inter', cursor: 'pointer', marginBottom: 12 }}
                >
                  Регистрация через Email
                </button>
                <button
                  onClick={() => setAuthMethod('email_login')}
                  style={{ width: '100%', padding: 14, borderRadius: 16, border: '1px solid rgba(255,255,255,.1)', background: 'transparent', color: 'rgba(255,255,255,.45)', font: '500 14px Inter', cursor: 'pointer' }}
                >
                  Уже есть аккаунт → Войти
                </button>
              </div>
            )}

            {/* Email логин */}
            {authMethod === 'email_login' && (
              <div>
                <button onClick={() => { setAuthMethod('choose'); setAuthError('') }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', font: '500 13px Inter', cursor: 'pointer', marginBottom: 20, padding: 0 }}>← Назад</button>
                <div style={{ font: '700 24px Playfair Display, serif', color: '#fff', marginBottom: 24 }}>Вход</div>
                <input type="email" placeholder="Email" value={emailForm.email}
                  onChange={(e) => setEmailForm((f) => ({ ...f, email: e.target.value }))}
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1px solid rgba(226,183,85,.35)', background: 'rgba(255,255,255,.06)', color: '#fff', font: '500 15px Inter', outline: 'none', marginBottom: 12, boxSizing: 'border-box' }}
                />
                <input type="password" placeholder="Пароль" value={emailForm.password}
                  onChange={(e) => setEmailForm((f) => ({ ...f, password: e.target.value }))}
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.06)', color: '#fff', font: '500 15px Inter', outline: 'none', marginBottom: 20, boxSizing: 'border-box' }}
                />
                {authError && <div style={{ color: '#f87171', font: '500 13px Inter', marginBottom: 12, textAlign: 'center' }}>{authError}</div>}
                <button onClick={loginEmail} disabled={authLoading}
                  style={{ width: '100%', padding: 16, borderRadius: 16, border: 'none', background: 'linear-gradient(90deg,#8B5CF6,#E2B755)', color: '#fff', font: '600 15px Inter', cursor: 'pointer', opacity: authLoading ? .6 : 1 }}
                >
                  {authLoading ? 'Входим…' : 'Войти →'}
                </button>
              </div>
            )}

            {/* Email регистрация — шаги */}
            {authMethod === 'email_register' && (
              <div>
                {/* Шаг 0 — Имя */}
                {onboardStep === 0 && (
                  <div>
                    <button onClick={() => { setAuthMethod('choose'); setAuthError('') }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', font: '500 13px Inter', cursor: 'pointer', marginBottom: 20, padding: 0 }}>← Назад</button>
                    <div style={{ font: '700 24px Playfair Display, serif', color: '#fff', marginBottom: 6 }}>Как вас зовут?</div>
                    <div style={{ font: '400 13px Inter', color: 'rgba(255,255,255,.45)', marginBottom: 24 }}>Шаг 1 из 4</div>
                    <input type="text" placeholder="Ваше имя" value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      style={{ width: '100%', padding: '16px 20px', borderRadius: 16, border: '1px solid rgba(226,183,85,.35)', background: 'rgba(255,255,255,.06)', color: '#fff', font: '500 16px Inter', outline: 'none', marginBottom: 20, boxSizing: 'border-box' }}
                    />
                    <button onClick={() => form.name.trim() && setOnboardStep(1)}
                      style={{ width: '100%', padding: 16, borderRadius: 16, border: 'none', background: form.name.trim() ? 'linear-gradient(90deg,#8B5CF6,#E2B755)' : 'rgba(255,255,255,.1)', color: '#fff', font: '600 15px Inter', cursor: form.name.trim() ? 'pointer' : 'default' }}
                    >Продолжить →</button>
                  </div>
                )}

                {/* Шаг 1 — Дата рождения */}
                {onboardStep === 1 && (
                  <div>
                    <button onClick={() => setOnboardStep(0)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', font: '500 13px Inter', cursor: 'pointer', marginBottom: 20, padding: 0 }}>← Назад</button>
                    <div style={{ font: '700 24px Playfair Display, serif', color: '#fff', marginBottom: 6 }}>Дата рождения</div>
                    <div style={{ font: '400 13px Inter', color: 'rgba(255,255,255,.45)', marginBottom: 24 }}>Шаг 2 из 4</div>
                    <div style={{ font: '500 12px Inter', color: '#E2B755', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>Дата</div>
                    <input type="date" value={form.date}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1px solid rgba(226,183,85,.35)', background: 'rgba(255,255,255,.06)', color: '#fff', font: '500 15px Inter', outline: 'none', marginBottom: 16, boxSizing: 'border-box', colorScheme: 'dark' }}
                    />
                    <div style={{ font: '500 12px Inter', color: '#E2B755', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>Время <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 11 }}>(если знаете)</span></div>
                    <input type="time" value={form.time}
                      onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                      style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.06)', color: '#fff', font: '500 15px Inter', outline: 'none', marginBottom: 24, boxSizing: 'border-box', colorScheme: 'dark' }}
                    />
                    <button onClick={() => form.date && setOnboardStep(2)}
                      style={{ width: '100%', padding: 16, borderRadius: 16, border: 'none', background: form.date ? 'linear-gradient(90deg,#8B5CF6,#E2B755)' : 'rgba(255,255,255,.1)', color: '#fff', font: '600 15px Inter', cursor: form.date ? 'pointer' : 'default' }}
                    >Продолжить →</button>
                  </div>
                )}

                {/* Шаг 2 — Город */}
                {onboardStep === 2 && (
                  <div>
                    <button onClick={() => setOnboardStep(1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', font: '500 13px Inter', cursor: 'pointer', marginBottom: 20, padding: 0 }}>← Назад</button>
                    <div style={{ font: '700 24px Playfair Display, serif', color: '#fff', marginBottom: 6 }}>Место рождения</div>
                    <div style={{ font: '400 13px Inter', color: 'rgba(255,255,255,.45)', marginBottom: 24 }}>Шаг 3 из 4</div>
                    <input type="text" placeholder="Город (например, Москва)" value={form.city}
                      onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      style={{ width: '100%', padding: '16px 20px', borderRadius: 16, border: '1px solid rgba(226,183,85,.35)', background: 'rgba(255,255,255,.06)', color: '#fff', font: '500 16px Inter', outline: 'none', marginBottom: 24, boxSizing: 'border-box' }}
                    />
                    <button onClick={() => setOnboardStep(3)}
                      style={{ width: '100%', padding: 16, borderRadius: 16, border: 'none', background: 'linear-gradient(90deg,#8B5CF6,#E2B755)', color: '#fff', font: '600 15px Inter', cursor: 'pointer', marginBottom: 10 }}
                    >Продолжить →</button>
                    <button onClick={() => { setForm((f) => ({ ...f, city: '' })); setOnboardStep(3) }}
                      style={{ width: '100%', padding: 14, borderRadius: 16, border: '1px solid rgba(255,255,255,.12)', background: 'transparent', color: 'rgba(255,255,255,.45)', font: '500 14px Inter', cursor: 'pointer' }}
                    >Пропустить</button>
                  </div>
                )}

                {/* Шаг 3 — Email + пароль */}
                {onboardStep === 3 && (
                  <div>
                    <button onClick={() => setOnboardStep(2)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', font: '500 13px Inter', cursor: 'pointer', marginBottom: 20, padding: 0 }}>← Назад</button>
                    <div style={{ font: '700 24px Playfair Display, serif', color: '#fff', marginBottom: 6 }}>Создайте аккаунт</div>
                    <div style={{ font: '400 13px Inter', color: 'rgba(255,255,255,.45)', marginBottom: 24 }}>Шаг 4 из 4</div>
                    <input type="email" placeholder="Email" value={emailForm.email}
                      onChange={(e) => setEmailForm((f) => ({ ...f, email: e.target.value }))}
                      style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1px solid rgba(226,183,85,.35)', background: 'rgba(255,255,255,.06)', color: '#fff', font: '500 15px Inter', outline: 'none', marginBottom: 12, boxSizing: 'border-box' }}
                    />
                    <input type="password" placeholder="Пароль (мин. 6 символов)" value={emailForm.password}
                      onChange={(e) => setEmailForm((f) => ({ ...f, password: e.target.value }))}
                      style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.06)', color: '#fff', font: '500 15px Inter', outline: 'none', marginBottom: 20, boxSizing: 'border-box' }}
                    />
                    {authError && <div style={{ color: '#f87171', font: '500 13px Inter', marginBottom: 12, textAlign: 'center' }}>{authError}</div>}
                    <button onClick={registerEmail} disabled={authLoading}
                      style={{ width: '100%', padding: 16, borderRadius: 16, border: 'none', background: 'linear-gradient(90deg,#8B5CF6,#E2B755)', color: '#fff', font: '600 15px Inter', cursor: 'pointer', opacity: authLoading ? .6 : 1 }}
                    >
                      {authLoading ? 'Создаём карту…' : 'Составить карту 🔮'}
                    </button>
                  </div>
                )}

                {/* Прогресс-точки */}
                {authMethod === 'email_register' && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 28 }}>
                    {[0,1,2,3].map((i) => (
                      <div key={i} style={{ width: i === onboardStep ? 20 : 6, height: 6, borderRadius: 3, background: i === onboardStep ? '#E2B755' : i < onboardStep ? 'rgba(226,183,85,.4)' : 'rgba(255,255,255,.2)', transition: 'all .3s' }}/>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* APP */}
      {phase === 'app' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '60px 18px 104px' }}>

            {/* HOME */}
            {tab === 'home' && (
              <div className="anim-fadeup">
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  <svg width="62" height="62" viewBox="0 0 62 62" className="anim-float" style={{ filter: 'drop-shadow(0 0 16px rgba(226,183,85,.4))' }}>
                    <defs><radialGradient id="mg" cx="38%" cy="34%" r="70%"><stop offset="0%" stopColor="#FBEFD2"/><stop offset="60%" stopColor="#E2B755"/><stop offset="100%" stopColor="#b98f33"/></radialGradient></defs>
                    <circle cx="31" cy="31" r="23" fill="url(#mg)"/>
                    <circle cx="42" cy="25" r="19" fill="#100A22" opacity=".82"/>
                    <circle cx="26" cy="34" r="3" fill="#c89f3f" opacity=".5"/>
                    <circle cx="20" cy="26" r="2" fill="#c89f3f" opacity=".45"/>
                    <circle cx="30" cy="42" r="2.4" fill="#c89f3f" opacity=".4"/>
                  </svg>
                  <div>
                    <div style={{ font: '500 11px Inter', letterSpacing: 2, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase' }}>Сегодня · Растущая луна</div>
                    <div style={{ font: '600 19px Playfair Display, serif', color: '#fff', marginTop: 3 }}>{birthData ? `Привет, ${birthData.name} 👋` : `Луна в знаке ${f.moonSign}`}</div>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,.05)', backdropFilter: 'blur(18px)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 20, padding: '15px 17px', marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
                    <span style={{ font: '500 12px Inter', letterSpacing: '.6px', color: 'rgba(255,255,255,.65)' }}>ЭНЕРГИЯ ДНЯ · Благоприятный</span>
                    <span style={{ font: '600 17px Playfair Display, serif', color: '#E2B755' }}>{f.energy}%</span>
                  </div>
                  <div style={{ height: 7, borderRadius: 6, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${f.energy}%`, borderRadius: 6, background: 'linear-gradient(90deg,#8B5CF6,#E2B755)', boxShadow: '0 0 12px rgba(226,183,85,.6)', transition: 'width .6s ease' }}/>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  {(['today','tomorrow','week','month'] as DayTab[]).map((key) => {
                    const labels: Record<DayTab,string> = { today: 'Сегодня', tomorrow: 'Завтра', week: 'Неделя', month: 'Месяц' }
                    const active = dayTab === key
                    return (
                      <button key={key} onClick={() => handleDayTab(key)} style={{ flex: 1, padding: '9px 0', borderRadius: 13, border: active ? '1px solid rgba(226,183,85,.5)' : '1px solid rgba(255,255,255,.08)', background: active ? 'rgba(226,183,85,.16)' : 'rgba(255,255,255,.04)', color: active ? '#E2B755' : 'rgba(255,255,255,.55)', font: '600 12.5px Inter', cursor: 'pointer', transition: 'all .2s' }}>
                        {labels[key]}
                      </button>
                    )
                  })}
                </div>

                <div key={cardKey} className="anim-cardflip" style={{ background: 'rgba(255,255,255,.055)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 24, padding: '20px 19px', boxShadow: '0 18px 50px -20px rgba(139,92,246,.4)' }}>
                  <div style={{ font: '500 10.5px Inter', letterSpacing: 2, color: '#E2B755', textTransform: 'uppercase', marginBottom: 8 }}>Общий вектор</div>
                  <div style={{ font: '400 14.5px/1.55 Inter', color: 'rgba(255,255,255,.82)' }}>{f.general}</div>

                  <div style={{ display: 'flex', justifyContent: 'space-around', margin: '22px 0 18px' }}>
                    {[
                      { label: 'Любовь',  pct: f.lovePct,   color: '#E2B755', glow: 'rgba(226,183,85,.6)'  },
                      { label: 'Карьера', pct: f.careerPct, color: '#8B5CF6', glow: 'rgba(139,92,246,.7)'  },
                      { label: 'Тонус',   pct: f.tonePct,   color: '#E2B755', glow: 'rgba(226,183,85,.6)'  },
                    ].map(({ label, pct, color, glow }) => (
                      <div key={label} style={{ textAlign: 'center' }}>
                        <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: 'rotate(-90deg)' }}>
                          <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="6"/>
                          <circle cx="36" cy="36" r="28" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={dash(pct)} style={{ transition: 'stroke-dashoffset .7s ease', filter: `drop-shadow(0 0 5px ${glow})` }}/>
                        </svg>
                        <div style={{ marginTop: -50, font: '600 17px Playfair Display, serif', color: '#fff' }}>{pct}%</div>
                        <div style={{ marginTop: 30, font: '500 11px Inter', color: 'rgba(255,255,255,.6)' }}>{label}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                    {[['💼','Работа',f.work],['🤍','Любовь',f.love],['🧘','Здоровье',f.health]].map(([emoji, label, text], i) => (
                      <div key={i}>
                        {i > 0 && <div style={{ height: 1, background: 'rgba(255,255,255,.08)', marginBottom: 13 }}/>}
                        <div style={{ display: 'flex', gap: 11 }}>
                          <div style={{ fontSize: 17, lineHeight: 1.4 }}>{emoji}</div>
                          <div><div style={{ font: '600 13px Inter', color: '#fff', marginBottom: 2 }}>{label}</div><div style={{ font: '400 13px/1.5 Inter', color: 'rgba(255,255,255,.72)' }}>{text}</div></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* NATAL */}
            {tab === 'natal' && (
              <div className="anim-fadeup">
                <div style={{ font: '500 11px Inter', letterSpacing: 2, color: '#E2B755', textTransform: 'uppercase', marginBottom: 4 }}>Космический паспорт</div>
                <h1 style={{ font: '600 26px Playfair Display, serif', color: '#fff', margin: '0 0 4px' }}>Натальная карта</h1>
                <div style={{ font: '400 12.5px Inter', color: 'rgba(255,255,255,.5)', marginBottom: 14 }}>Нажмите на планету для расшифровки</div>

                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
                  <svg viewBox="0 0 320 320" style={{ width: 308, height: 308 }}>
                    <circle cx="160" cy="160" r="152" fill="none" stroke="rgba(226,183,85,.35)" strokeWidth="1"/>
                    <circle cx="160" cy="160" r="116" fill="rgba(139,92,246,.04)" stroke="rgba(255,255,255,.12)" strokeWidth="1"/>
                    <circle cx="160" cy="160" r="60" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="1"/>
                    {houseTicks.map((t, i) => <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="rgba(226,183,85,.18)" strokeWidth="1"/>)}
                    {zodiacSigns.map((z, i) => <text key={i} x={z.x} y={z.y} textAnchor="middle" dominantBaseline="central" fontSize="14" fill="rgba(255,255,255,.7)">{z.glyph}</text>)}
                    {aspects.map((a, i) => <line key={i} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke={a.color} strokeWidth="1" opacity=".5"/>)}
                    {planets.map((p) => (
                      <g key={p.id} onClick={() => setSelectedPlanet(p)} style={{ cursor: 'pointer' }}>
                        <circle cx={p.x} cy={p.y} r="18" fill="none" stroke={p.color} strokeWidth="1" opacity={p.halo}/>
                        <circle cx={p.x} cy={p.y} r="13" fill={p.fill} stroke={p.color} strokeWidth={p.strokeW}/>
                        <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize={p.fontSize} fontWeight="600" fill={p.color}>{p.glyph}</text>
                      </g>
                    ))}
                  </svg>
                </div>

                <div style={{ font: '500 11px Inter', letterSpacing: 2, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', marginBottom: 10 }}>Сводка · Большая тройка</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {big3.map((b, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 18, padding: '13px 16px' }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: b.bg, color: b.color }}>{b.glyph}</div>
                      <div style={{ flex: 1 }}><div style={{ font: '600 15px Inter', color: '#fff' }}>{b.body}</div><div style={{ font: '400 11.5px Inter', color: 'rgba(255,255,255,.5)' }}>{b.sub}</div></div>
                      <div style={{ font: '600 15px Playfair Display, serif', color: b.color }}>{b.sign}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SYNASTRY */}
            {tab === 'synastry' && (
              <div className="anim-fadeup">
                <div style={{ font: '500 11px Inter', letterSpacing: 2, color: '#E2B755', textTransform: 'uppercase', marginBottom: 4 }}>Синастрия</div>
                <h1 style={{ font: '600 26px Playfair Display, serif', color: '#fff', margin: '0 0 18px' }}>Совместимость</h1>

                {synStage === 'input' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26, margin: '18px 0 22px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(150deg,#E2B755,#b98f33)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 30px Playfair Display, serif', color: '#1a1430', boxShadow: '0 0 26px rgba(226,183,85,.4)' }}>Я</div>
                        <div style={{ marginTop: 9, font: '600 13px Inter', color: '#fff' }}>Вы</div>
                        <div style={{ font: '400 11px Inter', color: 'rgba(255,255,255,.45)' }}>04.08 · Лев</div>
                      </div>
                      <div style={{ font: '500 22px Playfair Display, serif', color: 'rgba(255,255,255,.3)' }}>+</div>
                      <div style={{ textAlign: 'center' }}>
                        {partnerAdded ? (
                          <>
                            <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(150deg,#8B5CF6,#5b3aa6)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 30px Playfair Display, serif', color: '#fff', boxShadow: '0 0 26px rgba(139,92,246,.45)' }}>А</div>
                            <div style={{ marginTop: 9, font: '600 13px Inter', color: '#fff' }}>Алекс</div>
                            <div style={{ font: '400 11px Inter', color: 'rgba(255,255,255,.45)' }}>12.06 · Близнецы</div>
                          </>
                        ) : (
                          <>
                            <button onClick={() => setPartnerAdded(true)} style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(255,255,255,.04)', border: '1.5px dashed rgba(255,255,255,.3)', color: 'rgba(255,255,255,.6)', font: '600 12px Inter', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                              <span style={{ fontSize: 22, fontWeight: 300 }}>+</span>Партнёр
                            </button>
                            <div style={{ marginTop: 9, font: '400 12px Inter', color: 'rgba(255,255,255,.4)' }}>Добавить</div>
                          </>
                        )}
                      </div>
                    </div>

                    {partnerAdded && (
                      <div className="anim-fadeup" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 18, padding: '15px 17px', marginBottom: 18 }}>
                        {[['Имя','Алекс'],['Дата рождения','12 июня 1994, 08:30'],['Город','Санкт-Петербург']].map(([k, v], i) => (
                          <div key={i}>
                            {i > 0 && <div style={{ height: 1, background: 'rgba(255,255,255,.07)' }}/>}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', font: '400 13px Inter' }}>
                              <span style={{ color: 'rgba(255,255,255,.5)' }}>{k}</span>
                              <span style={{ color: '#fff' }}>{v}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <button onClick={calcSyn} disabled={!partnerAdded} style={{ width: '100%', padding: 16, borderRadius: 18, border: 'none', font: '600 15px Inter', cursor: partnerAdded ? 'pointer' : 'default', color: partnerAdded ? '#fff' : 'rgba(255,255,255,.35)', background: partnerAdded ? 'linear-gradient(90deg,#8B5CF6,#E2B755)' : 'rgba(255,255,255,.06)', boxShadow: partnerAdded ? '0 10px 30px -8px rgba(139,92,246,.6)' : 'none', transition: 'all .3s' }}>
                      Рассчитать совместимость
                    </button>
                    {!partnerAdded && <div style={{ textAlign: 'center', marginTop: 10, font: '400 11.5px Inter', color: 'rgba(255,255,255,.35)' }}>Добавьте партнёра, чтобы начать расчёт</div>}
                  </div>
                )}

                {synStage === 'calculating' && (
                  <div className="anim-fadeup" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '34px 0' }}>
                    <div style={{ position: 'relative', width: 220, height: 220 }}>
                      <div className="anim-orbit" style={{ position: 'absolute', inset: 0 }}>
                        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', fontSize: 18, filter: 'drop-shadow(0 0 8px rgba(226,183,85,.8))' }}>♀</div>
                        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', fontSize: 18, color: '#8B5CF6', filter: 'drop-shadow(0 0 8px rgba(139,92,246,.9))' }}>♂</div>
                      </div>
                      <div className="anim-orbitr" style={{ position: 'absolute', inset: 26 }}>
                        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', fontSize: 15, color: '#E2B755' }}>☾</div>
                        <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: '#fff', opacity: .7 }}>☿</div>
                      </div>
                      <div style={{ position: 'absolute', inset: 64, borderRadius: '50%', border: '1px solid rgba(255,255,255,.1)' }}/>
                      <div style={{ position: 'absolute', inset: 84, borderRadius: '50%', background: 'radial-gradient(circle,rgba(226,183,85,.25),transparent 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(150deg,#E2B755,#8B5CF6)' }}/>
                      </div>
                    </div>
                    <div style={{ marginTop: 26, font: '500 15px Playfair Display, serif', color: '#fff' }}>Вычисляем синастрию…</div>
                    <div style={{ marginTop: 6, font: '400 12px Inter', color: 'rgba(255,255,255,.45)' }}>Сопоставляем планеты двух карт</div>
                  </div>
                )}

                {synStage === 'result' && (
                  <div className="anim-fadeup">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '6px 0 24px' }}>
                      <div style={{ position: 'relative', width: 170, height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="170" height="170" viewBox="0 0 170 170" className="anim-scoreglow" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
                          <circle cx="85" cy="85" r="74" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="9"/>
                          <circle cx="85" cy="85" r="74" fill="none" stroke="#E2B755" strokeWidth="9" strokeLinecap="round" strokeDasharray={scoreCirc} strokeDashoffset={scoreCirc * (1 - score / 100)} style={{ transition: 'stroke-dashoffset .1s linear' }}/>
                        </svg>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ font: '600 52px Playfair Display, serif', color: '#fff', lineHeight: 1 }}>{score}<span style={{ fontSize: 24, color: '#E2B755' }}>%</span></div>
                          <div style={{ font: '500 11px Inter', letterSpacing: 1.5, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', marginTop: 4 }}>Совпадение</div>
                        </div>
                      </div>
                      <div style={{ font: '400 13px/1.5 Inter', color: 'rgba(255,255,255,.7)', textAlign: 'center', maxWidth: 260, marginTop: 6 }}>Сильный союз с яркой искрой. Стоит беречь баланс между страстью и бытом.</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 20 }}>
                      {breakdown.map((b, i) => (
                        <div key={i}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ font: '500 12.5px Inter', color: 'rgba(255,255,255,.8)' }}>{b.label}</span>
                            <span style={{ font: '600 12.5px Inter', color: b.color }}>{b.pct}%</span>
                          </div>
                          <div style={{ height: 6, borderRadius: 5, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${b.pct}%`, borderRadius: 5, background: b.bar, boxShadow: `0 0 8px ${b.glow}`, transition: 'width .8s ease' }}/>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ background: 'linear-gradient(160deg,rgba(45,160,110,.16),rgba(45,160,110,.04))', border: '1px solid rgba(75,200,140,.3)', borderRadius: 18, padding: '15px 17px', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4bd692', boxShadow: '0 0 8px #4bd692', display: 'inline-block' }}/>
                        <span style={{ font: '600 13px Inter', color: '#7fe6b0' }}>Что вас сближает</span>
                      </div>
                      <div style={{ font: '600 13px Inter', color: '#fff', marginBottom: 3 }}>Трин Марс — Венера</div>
                      <div style={{ font: '400 12.5px/1.5 Inter', color: 'rgba(255,255,255,.7)' }}>Мощное притяжение и лёгкость в проявлении чувств. Вы интуитивно понимаете желания друг друга.</div>
                    </div>

                    <div style={{ background: 'linear-gradient(160deg,rgba(220,80,80,.14),rgba(220,80,80,.04))', border: '1px solid rgba(230,110,110,.3)', borderRadius: 18, padding: '15px 17px', marginBottom: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e87171', boxShadow: '0 0 8px #e87171', display: 'inline-block' }}/>
                        <span style={{ font: '600 13px Inter', color: '#f0a0a0' }}>Где возможны конфликты</span>
                      </div>
                      <div style={{ font: '600 13px Inter', color: '#fff', marginBottom: 3 }}>Квадрат Сатурн — Луна</div>
                      <div style={{ font: '400 12.5px/1.5 Inter', color: 'rgba(255,255,255,.7)' }}>Партнёр может казаться холодным, когда вам нужна поддержка. Совет: проговаривайте потребности вслух, не ждите догадок.</div>
                    </div>

                    <button onClick={resetSyn} style={{ width: '100%', padding: 14, borderRadius: 16, border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.05)', color: '#fff', font: '600 14px Inter', cursor: 'pointer' }}>
                      Новый расчёт
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

            {/* PROFILE */}
            {tab === 'profile' && (
              <div className="anim-fadeup" style={{ paddingBottom: 20 }}>
                {/* Аватар и имя */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#8B5CF6,#E2B755)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 14px' }}>
                    {birthData?.name?.[0]?.toUpperCase() ?? '✨'}
                  </div>
                  <div style={{ font: '700 22px Playfair Display, serif', color: '#fff' }}>{birthData?.name ?? 'Гость'}</div>
                  <div style={{ font: '500 13px Inter', color: localStorage.getItem(TOKEN_KEY) ? '#4ade80' : 'rgba(255,255,255,.4)', marginTop: 4 }}>
                    {localStorage.getItem(TOKEN_KEY) ? '✓ Авторизован' : 'Офлайн-режим'}
                  </div>
                </div>

                {/* Данные рождения */}
                <div style={{ background: 'rgba(255,255,255,.05)', borderRadius: 18, padding: '18px 20px', marginBottom: 14, border: '1px solid rgba(255,255,255,.08)' }}>
                  <div style={{ font: '500 11px Inter', letterSpacing: 2, color: '#E2B755', textTransform: 'uppercase', marginBottom: 14 }}>Данные рождения</div>
                  {[
                    { label: 'Дата', value: birthData?.date ? new Date(birthData.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
                    { label: 'Время', value: birthData?.time || 'Не указано' },
                    { label: 'Город', value: birthData?.city || 'Не указан' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ font: '400 13px Inter', color: 'rgba(255,255,255,.45)' }}>{label}</span>
                      <span style={{ font: '500 13px Inter', color: '#fff' }}>{value}</span>
                    </div>
                  ))}
                </div>

                {/* Премиум */}
                <div style={{ background: 'linear-gradient(135deg,rgba(139,92,246,.15),rgba(226,183,85,.1))', borderRadius: 18, padding: '18px 20px', marginBottom: 14, border: '1px solid rgba(226,183,85,.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ font: '600 15px Inter', color: '#fff' }}>✨ Premium</div>
                      <div style={{ font: '400 12px Inter', color: 'rgba(255,255,255,.45)', marginTop: 3 }}>Полный доступ ко всем функциям</div>
                    </div>
                    <div style={{ padding: '8px 16px', borderRadius: 12, background: 'rgba(255,255,255,.08)', font: '600 12px Inter', color: 'rgba(255,255,255,.4)' }}>Free</div>
                  </div>
                </div>

                {/* Войти / Выйти */}
                {!localStorage.getItem(TOKEN_KEY) ? (
                  <button onClick={() => { setPhase('onboarding'); setAuthMethod('choose'); setOnboardStep(0) }}
                    style={{ width: '100%', padding: 15, borderRadius: 16, border: 'none', background: 'linear-gradient(90deg,#8B5CF6,#E2B755)', color: '#fff', font: '600 14px Inter', cursor: 'pointer', marginBottom: 10 }}>
                    Войти / Зарегистрироваться
                  </button>
                ) : (
                  <button onClick={() => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(STORAGE_KEY); setBirthData(null); setPhase('onboarding'); setAuthMethod('choose'); setOnboardStep(0) }}
                    style={{ width: '100%', padding: 15, borderRadius: 16, border: '1px solid rgba(255,255,255,.12)', background: 'transparent', color: 'rgba(255,255,255,.5)', font: '500 14px Inter', cursor: 'pointer' }}>
                    Выйти из аккаунта
                  </button>
                )}
              </div>
            )}

          </div>

          {/* TAB BAR */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 22px 26px', background: 'linear-gradient(180deg,rgba(10,9,21,0),rgba(10,9,21,.85) 40%)', backdropFilter: 'blur(14px)', borderTop: '1px solid rgba(255,255,255,.07)', display: 'flex', justifyContent: 'space-around', zIndex: 40 }}>
            <button onClick={() => goTab('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '4px 12px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 3a7 7 0 1 0 6.5 9.6A5.5 5.5 0 0 1 12 3z" fill={tabColor('home')} opacity={tab === 'home' ? 0.18 : 0} stroke={tabColor('home')} strokeWidth="1.4" strokeLinejoin="round"/>
              </svg>
              <span style={{ font: '600 10px Inter', color: tabColor('home') }}>Гороскоп</span>
            </button>
            <button onClick={() => goTab('natal')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '4px 12px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="8.5" stroke={tabColor('natal')} strokeWidth="1.4"/>
                <circle cx="12" cy="12" r="2.2" fill={tabColor('natal')}/>
                <line x1="12" y1="3.5" x2="12" y2="6" stroke={tabColor('natal')} strokeWidth="1.4"/>
                <line x1="12" y1="18" x2="12" y2="20.5" stroke={tabColor('natal')} strokeWidth="1.4"/>
                <line x1="3.5" y1="12" x2="6" y2="12" stroke={tabColor('natal')} strokeWidth="1.4"/>
                <line x1="18" y1="12" x2="20.5" y2="12" stroke={tabColor('natal')} strokeWidth="1.4"/>
              </svg>
              <span style={{ font: '600 10px Inter', color: tabColor('natal') }}>Карта</span>
            </button>
            <button onClick={() => goTab('synastry')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '4px 12px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="9" cy="12" r="6" stroke={tabColor('synastry')} strokeWidth="1.4"/>
                <circle cx="15" cy="12" r="6" stroke={tabColor('synastry')} strokeWidth="1.4"/>
              </svg>
              <span style={{ font: '600 10px Inter', color: tabColor('synastry') }}>Союз</span>
            </button>
            <button onClick={() => goTab('profile')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '4px 12px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="3.5" stroke={tabColor('profile')} strokeWidth="1.4"/>
                <path d="M5 19c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke={tabColor('profile')} strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <span style={{ font: '600 10px Inter', color: tabColor('profile') }}>Профиль</span>
            </button>
          </div>

          {/* BOTTOM SHEET */}
          {selectedPlanet && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 80 }}>
              <div onClick={() => setSelectedPlanet(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(5,4,12,.6)', backdropFilter: 'blur(3px)' }}/>
              <div className="anim-sheetup" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(180deg,#1a132e,#120c22)', borderTop: '1px solid rgba(226,183,85,.25)', borderRadius: '30px 30px 0 0', padding: '14px 22px 30px', boxShadow: '0 -20px 60px rgba(0,0,0,.6)' }}>
                <div style={{ width: 42, height: 5, borderRadius: 3, background: 'rgba(255,255,255,.2)', margin: '0 auto 18px' }}/>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 54, height: 54, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, background: selectedPlanet.fill, color: selectedPlanet.color, border: `1px solid ${selectedPlanet.color}` }}>{selectedPlanet.glyph}</div>
                  <div>
                    <div style={{ font: '600 20px Playfair Display, serif', color: '#fff' }}>{selectedPlanet.name} в {selectedPlanet.sign}</div>
                    <div style={{ font: '500 12px Inter', color: '#E2B755', letterSpacing: '.5px' }}>{selectedPlanet.house}</div>
                  </div>
                </div>
                <div style={{ font: '400 14.5px/1.6 Inter', color: 'rgba(255,255,255,.78)', marginBottom: 20 }}>{selectedPlanet.desc}</div>
                <button onClick={() => setSelectedPlanet(null)} style={{ width: '100%', padding: 14, borderRadius: 16, border: 'none', background: 'linear-gradient(90deg,#8B5CF6,#E2B755)', color: '#fff', font: '600 14px Inter', cursor: 'pointer' }}>Понятно</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
