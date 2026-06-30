'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'

declare global {
  interface Window {
    onTelegramAuth?: (user: Record<string, string>) => void
  }
}

type Phase = 'splash' | 'onboarding'
type AuthMethod = 'choose' | 'email_register' | 'email_login' | 'birth_only'

interface BirthForm {
  name: string
  date: string
  time: string
  city: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const store = useAuthStore()

  const [phase, setPhase] = useState<Phase>('splash')
  const [authMethod, setAuthMethod] = useState<AuthMethod>('choose')
  const [onboardStep, setOnboardStep] = useState(0)
  const [form, setForm] = useState<BirthForm>({ name: '', date: '', time: '', city: '' })
  const [emailForm, setEmailForm] = useState({ email: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') sessionStorage.removeItem('tg_auth_code')
  }, [])

  // Auto-login if opened as Telegram Mini App
  useEffect(() => {
    const tg = (window as unknown as { Telegram?: { WebApp?: { initData?: string; ready?: () => void } } }).Telegram?.WebApp
    if (tg?.initData && tg.initData.length > 10) {
      tg.ready?.()
      setAuthLoading(true)
      setAuthError('')
      store.loginWithTelegram(tg.initData)
        .then(() => router.replace('/'))
        .catch((e: unknown) => {
          console.error('TG miniapp auto-auth error:', e)
          setAuthError(e instanceof Error ? e.message : 'Ошибка авторизации')
          setAuthLoading(false)
        })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep window.onTelegramAuth always up-to-date so stale closures can't break auth
  useEffect(() => {
    window.onTelegramAuth = async (user) => {
      setAuthLoading(true)
      setAuthError('')
      try {
        await store.loginWithTelegramWidget(user)
        router.replace('/')
      } catch (e) {
        console.error('TG widget auth error:', e)
        setAuthError(e instanceof Error ? e.message : 'Ошибка авторизации через Telegram')
        setAuthLoading(false)
      }
    }
  }, [store, router])

  const onSplashEnd = (e: React.AnimationEvent) => {
    if (e.animationName !== 'splashSeq') return
    setPhase('onboarding')
  }

  const handleTelegramWidget = useCallback(() => {
    // Widget path — inject script once, then let the iframe handle clicks
    if (!document.getElementById('tg-widget-script')) {
      const s = document.createElement('script')
      s.id = 'tg-widget-script'
      s.src = 'https://telegram.org/js/telegram-widget.js?22'
      s.setAttribute('data-telegram-login', 'NovaSouI_bot')
      s.setAttribute('data-size', 'large')
      s.setAttribute('data-onauth', 'onTelegramAuth(user)')
      s.setAttribute('data-request-access', 'write')
      s.async = true
      const container = document.getElementById('tg-widget-container')
      if (container) {
        container.innerHTML = ''
        container.appendChild(s)
      }
    }
    // After script injection the user sees the real Telegram button (iframe) and clicks it
  }, [store, router])

  const handleLoginEmail = async () => {
    if (!emailForm.email || !emailForm.password) return
    setAuthLoading(true)
    setAuthError('')
    try {
      await store.loginWithEmail(emailForm.email, emailForm.password)
      router.replace('/')
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : 'Неверный email или пароль')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleRegisterEmail = async () => {
    if (!emailForm.email || !emailForm.password || !form.name || !form.date) return
    setAuthLoading(true)
    setAuthError('')
    try {
      await store.registerWithEmail({
        name: form.name,
        email: emailForm.email,
        password: emailForm.password,
        birthDate: form.date,
        birthTime: form.time || undefined,
        birthPlace: form.city || undefined,
      })
      router.replace('/')
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : 'Ошибка регистрации')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleBirthOnly = () => {
    if (!form.name || !form.date) return
    store.setBirthData({ name: form.name, date: form.date, time: form.time, city: form.city })
    router.replace('/')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 14,
    border: '1px solid rgba(226,183,85,.35)',
    background: 'rgba(255,255,255,.06)',
    color: '#fff',
    font: '500 15px Inter',
    outline: 'none',
    marginBottom: 12,
    boxSizing: 'border-box',
  }

  const btnPrimary: React.CSSProperties = {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    border: 'none',
    background: 'linear-gradient(90deg,#8B5CF6,#E2B755)',
    color: '#fff',
    font: '600 15px Inter',
    cursor: 'pointer',
  }

  const btnBack: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,.4)',
    font: '500 13px Inter',
    cursor: 'pointer',
    marginBottom: 20,
    padding: 0,
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(168deg,#0A0915 0%,#120C24 55%,#160F29 100%)',
        fontFamily: 'Inter, system-ui, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* SPLASH */}
      {phase === 'splash' && (
        <div
          onAnimationEnd={onSplashEnd}
          className="anim-splash"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 90,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(130% 100% at 50% 30%, #160F29 0%, #0A0915 75%)',
          }}
        >
          <svg width="240" height="220" viewBox="0 0 240 220">
            <polyline
              points="40,150 78,120 118,134 150,96 196,70 168,118 126,160 88,176"
              fill="none"
              stroke="#E2B755"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="620"
              strokeDashoffset="620"
              style={{
                filter: 'drop-shadow(0 0 6px rgba(226,183,85,.8))',
                animation: 'constDraw 2.4s ease .3s forwards',
              }}
            />
            <g fill="#fff" style={{ filter: 'drop-shadow(0 0 5px rgba(226,183,85,.9))' }}>
              {(
                [
                  [40, 150, 3, 0.2],
                  [78, 120, 2.4, 0.5],
                  [118, 134, 2.6, 0.8],
                  [150, 96, 3.4, 0.1],
                  [196, 70, 3.8, 0.6],
                  [168, 118, 2.2, 1],
                  [126, 160, 2.8, 0.4],
                  [88, 176, 2.4, 0.9],
                ] as [number, number, number, number][]
              ).map(([cx, cy, r, delay], i) => (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={r}
                  style={{ animation: `twinkle ${2 + i * 0.1}s ease infinite ${delay}s` }}
                />
              ))}
            </g>
          </svg>
          <div
            style={{
              font: '700 46px Playfair Display, serif',
              color: '#E2B755',
              marginTop: 14,
              letterSpacing: 1,
              filter: 'drop-shadow(0 0 18px rgba(226,183,85,.5))',
            }}
          >
            ♌
          </div>
          <div style={{ font: '600 22px Playfair Display, serif', color: '#fff', marginTop: 8 }}>
            Astralis
          </div>
          <div
            style={{
              font: '400 13px Inter',
              color: 'rgba(255,255,255,.5)',
              marginTop: 6,
              letterSpacing: '.5px',
            }}
          >
            Составляем ваш космический портрет…
          </div>
        </div>
      )}

      {/* ONBOARDING */}
      {phase === 'onboarding' && (
        <div
          className="anim-fadeup"
          style={{
            position: 'absolute',
            inset: 0,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 24px',
          }}
        >
          <div style={{ width: '100%', maxWidth: 400 }}>

            {/* Choose method */}
            {authMethod === 'choose' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 52, marginBottom: 12 }}>🔮</div>
                <div style={{ font: '700 28px Playfair Display, serif', color: '#fff', marginBottom: 8 }}>
                  Добро пожаловать
                </div>
                <div
                  style={{ font: '400 14px Inter', color: 'rgba(255,255,255,.5)', marginBottom: 36 }}
                >
                  Войдите, чтобы получить персональный прогноз
                </div>
                <div style={{ marginBottom: 12 }}>
                  {authLoading ? (
                    <div style={{
                      width: '100%', padding: 16, borderRadius: 16,
                      background: 'rgba(34,158,217,.4)',
                      color: '#fff', font: '600 15px Inter',
                      textAlign: 'center',
                    }}>Авторизация…</div>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      {/* Кнопка-подложка — кликается до загрузки iframe */}
                      <div
                        onClick={handleTelegramWidget}
                        style={{
                          width: '100%', padding: 16, borderRadius: 16,
                          background: 'linear-gradient(90deg,#229ED9,#1a8ac4)',
                          color: '#fff', font: '600 15px Inter',
                          cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', gap: 10,
                          boxSizing: 'border-box',
                        }}
                      >
                        <span style={{ fontSize: 20 }}>✈️</span>
                        Войти через Telegram
                      </div>
                      {/* Telegram widget iframe рендерится здесь и перекрывает кнопку */}
                      <div
                        id="tg-widget-container"
                        style={{
                          position: 'absolute', inset: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          borderRadius: 16, overflow: 'hidden',
                        }}
                      />
                    </div>
                  )}
                </div>
                {authError && (
                  <div
                    style={{
                      color: '#f87171',
                      font: '500 13px Inter',
                      marginBottom: 14,
                      textAlign: 'center',
                      background: 'rgba(248,113,113,.08)',
                      borderRadius: 10,
                      padding: '10px 14px',
                    }}
                  >
                    {authError}
                  </div>
                )}
                <button
                  onClick={() => { setAuthError(''); setAuthMethod('email_register') }}
                  style={{
                    width: '100%',
                    padding: 16,
                    borderRadius: 16,
                    border: '1px solid rgba(226,183,85,.35)',
                    background: 'rgba(226,183,85,.08)',
                    color: '#E2B755',
                    font: '600 15px Inter',
                    cursor: 'pointer',
                    marginBottom: 12,
                  }}
                >
                  Регистрация через Email
                </button>
                <button
                  onClick={() => { setAuthError(''); setAuthMethod('email_login') }}
                  style={{
                    width: '100%',
                    padding: 14,
                    borderRadius: 16,
                    border: '1px solid rgba(255,255,255,.1)',
                    background: 'transparent',
                    color: 'rgba(255,255,255,.45)',
                    font: '500 14px Inter',
                    cursor: 'pointer',
                    marginBottom: 16,
                  }}
                >
                  Уже есть аккаунт → Войти
                </button>
                <button
                  onClick={() => { setAuthError(''); setAuthMethod('birth_only'); setOnboardStep(0) }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,.3)',
                    font: '400 13px Inter',
                    cursor: 'pointer',
                    width: '100%',
                    textDecoration: 'underline',
                  }}
                >
                  Продолжить без аккаунта
                </button>
              </div>
            )}

            {/* Email login */}
            {authMethod === 'email_login' && (
              <div>
                <button onClick={() => { setAuthMethod('choose'); setAuthError('') }} style={btnBack}>
                  ← Назад
                </button>
                <div style={{ font: '700 24px Playfair Display, serif', color: '#fff', marginBottom: 24 }}>
                  Вход
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  value={emailForm.email}
                  onChange={(e) => setEmailForm((f) => ({ ...f, email: e.target.value }))}
                  style={inputStyle}
                />
                <input
                  type="password"
                  placeholder="Пароль"
                  value={emailForm.password}
                  onChange={(e) => setEmailForm((f) => ({ ...f, password: e.target.value }))}
                  style={{ ...inputStyle, marginBottom: 20 }}
                />
                {authError && (
                  <div style={{ color: '#f87171', font: '500 13px Inter', marginBottom: 12, textAlign: 'center' }}>
                    {authError}
                  </div>
                )}
                <button onClick={handleLoginEmail} disabled={authLoading} style={{ ...btnPrimary, opacity: authLoading ? 0.6 : 1 }}>
                  {authLoading ? 'Входим…' : 'Войти →'}
                </button>
              </div>
            )}


            {/* Birth only — 3 steps */}
            {authMethod === 'birth_only' && (
              <div>
                {onboardStep === 0 && (
                  <div>
                    <button onClick={() => { setAuthMethod('choose'); setOnboardStep(0) }} style={btnBack}>
                      ← Назад
                    </button>
                    <div style={{ font: '700 24px Playfair Display, serif', color: '#fff', marginBottom: 6 }}>
                      Как вас зовут?
                    </div>
                    <div style={{ font: '400 13px Inter', color: 'rgba(255,255,255,.45)', marginBottom: 24 }}>
                      Шаг 1 из 3
                    </div>
                    <input
                      type="text"
                      placeholder="Ваше имя"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      style={{ ...inputStyle, padding: '16px 20px', font: '500 16px Inter', marginBottom: 20 }}
                    />
                    <button
                      onClick={() => form.name.trim() && setOnboardStep(1)}
                      style={{
                        ...btnPrimary,
                        background: form.name.trim() ? 'linear-gradient(90deg,#8B5CF6,#E2B755)' : 'rgba(255,255,255,.1)',
                        cursor: form.name.trim() ? 'pointer' : 'default',
                      }}
                    >
                      Продолжить →
                    </button>
                  </div>
                )}
                {onboardStep === 1 && (
                  <div>
                    <button onClick={() => setOnboardStep(0)} style={btnBack}>← Назад</button>
                    <div style={{ font: '700 24px Playfair Display, serif', color: '#fff', marginBottom: 6 }}>
                      Дата рождения
                    </div>
                    <div style={{ font: '400 13px Inter', color: 'rgba(255,255,255,.45)', marginBottom: 24 }}>
                      Шаг 2 из 3
                    </div>
                    <div style={{ font: '500 12px Inter', color: '#E2B755', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>Дата</div>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      style={{ ...inputStyle, colorScheme: 'dark' as React.CSSProperties['colorScheme'] }}
                    />
                    <div style={{ font: '500 12px Inter', color: '#E2B755', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>
                      Время <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 11 }}>(если знаете)</span>
                    </div>
                    <input
                      type="time"
                      value={form.time}
                      onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                      style={{ ...inputStyle, marginBottom: 24, colorScheme: 'dark' as React.CSSProperties['colorScheme'] }}
                    />
                    <button
                      onClick={() => form.date && setOnboardStep(2)}
                      style={{
                        ...btnPrimary,
                        background: form.date ? 'linear-gradient(90deg,#8B5CF6,#E2B755)' : 'rgba(255,255,255,.1)',
                        cursor: form.date ? 'pointer' : 'default',
                      }}
                    >
                      Продолжить →
                    </button>
                  </div>
                )}
                {onboardStep === 2 && (
                  <div>
                    <button onClick={() => setOnboardStep(1)} style={btnBack}>← Назад</button>
                    <div style={{ font: '700 24px Playfair Display, serif', color: '#fff', marginBottom: 6 }}>
                      Место рождения
                    </div>
                    <div style={{ font: '400 13px Inter', color: 'rgba(255,255,255,.45)', marginBottom: 24 }}>
                      Шаг 3 из 3
                    </div>
                    <input
                      type="text"
                      placeholder="Город (например, Москва)"
                      value={form.city}
                      onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      style={{ ...inputStyle, padding: '16px 20px', font: '500 16px Inter', marginBottom: 24 }}
                    />
                    <button onClick={handleBirthOnly} style={{ ...btnPrimary, marginBottom: 10 }}>
                      Составить карту 🔮
                    </button>
                    <button
                      onClick={() => { setForm((f) => ({ ...f, city: '' })); handleBirthOnly() }}
                      style={{
                        width: '100%',
                        padding: 14,
                        borderRadius: 16,
                        border: '1px solid rgba(255,255,255,.12)',
                        background: 'transparent',
                        color: 'rgba(255,255,255,.45)',
                        font: '500 14px Inter',
                        cursor: 'pointer',
                      }}
                    >
                      Пропустить город
                    </button>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 28 }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: i === onboardStep ? 20 : 6,
                        height: 6,
                        borderRadius: 3,
                        background:
                          i === onboardStep
                            ? '#E2B755'
                            : i < onboardStep
                            ? 'rgba(226,183,85,.4)'
                            : 'rgba(255,255,255,.2)',
                        transition: 'all .3s',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Email register — 4 steps */}
            {authMethod === 'email_register' && (
              <div>
                {onboardStep === 0 && (
                  <div>
                    <button onClick={() => { setAuthMethod('choose'); setAuthError('') }} style={btnBack}>
                      ← Назад
                    </button>
                    <div style={{ font: '700 24px Playfair Display, serif', color: '#fff', marginBottom: 6 }}>
                      Как вас зовут?
                    </div>
                    <div style={{ font: '400 13px Inter', color: 'rgba(255,255,255,.45)', marginBottom: 24 }}>
                      Шаг 1 из 4
                    </div>
                    <input
                      type="text"
                      placeholder="Ваше имя"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      style={{ ...inputStyle, padding: '16px 20px', font: '500 16px Inter', marginBottom: 20 }}
                    />
                    <button
                      onClick={() => form.name.trim() && setOnboardStep(1)}
                      style={{
                        ...btnPrimary,
                        background: form.name.trim() ? 'linear-gradient(90deg,#8B5CF6,#E2B755)' : 'rgba(255,255,255,.1)',
                        cursor: form.name.trim() ? 'pointer' : 'default',
                      }}
                    >
                      Продолжить →
                    </button>
                  </div>
                )}
                {onboardStep === 1 && (
                  <div>
                    <button onClick={() => setOnboardStep(0)} style={btnBack}>← Назад</button>
                    <div style={{ font: '700 24px Playfair Display, serif', color: '#fff', marginBottom: 6 }}>
                      Дата рождения
                    </div>
                    <div style={{ font: '400 13px Inter', color: 'rgba(255,255,255,.45)', marginBottom: 24 }}>
                      Шаг 2 из 4
                    </div>
                    <div style={{ font: '500 12px Inter', color: '#E2B755', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>Дата</div>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      style={{ ...inputStyle, colorScheme: 'dark' as React.CSSProperties['colorScheme'] }}
                    />
                    <div style={{ font: '500 12px Inter', color: '#E2B755', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>
                      Время <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 11 }}>(если знаете)</span>
                    </div>
                    <input
                      type="time"
                      value={form.time}
                      onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                      style={{ ...inputStyle, marginBottom: 24, colorScheme: 'dark' as React.CSSProperties['colorScheme'] }}
                    />
                    <button
                      onClick={() => form.date && setOnboardStep(2)}
                      style={{
                        ...btnPrimary,
                        background: form.date ? 'linear-gradient(90deg,#8B5CF6,#E2B755)' : 'rgba(255,255,255,.1)',
                        cursor: form.date ? 'pointer' : 'default',
                      }}
                    >
                      Продолжить →
                    </button>
                  </div>
                )}
                {onboardStep === 2 && (
                  <div>
                    <button onClick={() => setOnboardStep(1)} style={btnBack}>← Назад</button>
                    <div style={{ font: '700 24px Playfair Display, serif', color: '#fff', marginBottom: 6 }}>
                      Место рождения
                    </div>
                    <div style={{ font: '400 13px Inter', color: 'rgba(255,255,255,.45)', marginBottom: 24 }}>
                      Шаг 3 из 4
                    </div>
                    <input
                      type="text"
                      placeholder="Город (например, Москва)"
                      value={form.city}
                      onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      style={{ ...inputStyle, padding: '16px 20px', font: '500 16px Inter', marginBottom: 24 }}
                    />
                    <button onClick={() => setOnboardStep(3)} style={{ ...btnPrimary, marginBottom: 10 }}>
                      Продолжить →
                    </button>
                    <button
                      onClick={() => { setForm((f) => ({ ...f, city: '' })); setOnboardStep(3) }}
                      style={{
                        width: '100%',
                        padding: 14,
                        borderRadius: 16,
                        border: '1px solid rgba(255,255,255,.12)',
                        background: 'transparent',
                        color: 'rgba(255,255,255,.45)',
                        font: '500 14px Inter',
                        cursor: 'pointer',
                      }}
                    >
                      Пропустить
                    </button>
                  </div>
                )}
                {onboardStep === 3 && (
                  <div>
                    <button onClick={() => setOnboardStep(2)} style={btnBack}>← Назад</button>
                    <div style={{ font: '700 24px Playfair Display, serif', color: '#fff', marginBottom: 6 }}>
                      Создайте аккаунт
                    </div>
                    <div style={{ font: '400 13px Inter', color: 'rgba(255,255,255,.45)', marginBottom: 24 }}>
                      Шаг 4 из 4
                    </div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={emailForm.email}
                      onChange={(e) => setEmailForm((f) => ({ ...f, email: e.target.value }))}
                      style={inputStyle}
                    />
                    <input
                      type="password"
                      placeholder="Пароль (мин. 6 символов)"
                      value={emailForm.password}
                      onChange={(e) => setEmailForm((f) => ({ ...f, password: e.target.value }))}
                      style={{ ...inputStyle, marginBottom: 20 }}
                    />
                    {authError && (
                      <div style={{ color: '#f87171', font: '500 13px Inter', marginBottom: 12, textAlign: 'center' }}>
                        {authError}
                      </div>
                    )}
                    <button
                      onClick={handleRegisterEmail}
                      disabled={authLoading}
                      style={{ ...btnPrimary, opacity: authLoading ? 0.6 : 1 }}
                    >
                      {authLoading ? 'Создаём карту…' : 'Составить карту 🔮'}
                    </button>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 28 }}>
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: i === onboardStep ? 20 : 6,
                        height: 6,
                        borderRadius: 3,
                        background:
                          i === onboardStep
                            ? '#E2B755'
                            : i < onboardStep
                            ? 'rgba(226,183,85,.4)'
                            : 'rgba(255,255,255,.2)',
                        transition: 'all .3s',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  )
}
