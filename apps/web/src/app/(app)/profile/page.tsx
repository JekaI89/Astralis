'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import type { CSSProperties } from 'react'

const glass: CSSProperties = {
  background: 'rgba(255,255,255,.05)',
  border: '1px solid rgba(255,255,255,.1)',
  borderRadius: 20,
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  padding: '20px',
}

const label: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: '#E2B755',
  marginBottom: 6,
  display: 'block',
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '13px 16px',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,.1)',
  background: 'rgba(255,255,255,.06)',
  color: '#fff',
  fontSize: 15,
  outline: 'none',
  boxSizing: 'border-box',
  colorScheme: 'dark',
}

const readonlyInput: CSSProperties = {
  ...inputStyle,
  color: 'rgba(255,255,255,.45)',
  cursor: 'default',
}

export default function ProfilePage() {
  const router = useRouter()
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const [form, setForm] = useState({
    name: user?.name ?? '',
    birthDate: user?.birthDate?.split('T')[0] ?? '',
    birthTime: user?.birthTime ?? '',
    birthPlace: user?.birthPlace ?? '',
  })
  const [saved, setSaved] = useState(false)

  const update = useMutation({
    mutationFn: () => apiClient.patch('/users/me', form),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['natal-chart'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    },
  })

  const handleLogout = () => {
    logout()
    router.replace('/onboarding')
  }

  const avatarLetter = (user?.name ?? 'A')[0]?.toUpperCase()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0A0915 0%, #120C24 50%, #160F29 100%)',
      padding: '24px 16px 100px',
    }}>
      {/* Header */}
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#E2B755', marginBottom: 8 }}>
        Личный кабинет
      </p>
      <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 24 }}>
        Профиль
      </h1>

      {/* Account info */}
      <div style={{ ...glass, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          {/* Avatar */}
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: user?.avatarUrl ? 'transparent' : 'linear-gradient(135deg, #8B5CF6, #E2B755)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 700, color: '#fff', flexShrink: 0,
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(139,92,246,.3)',
          }}>
            {user?.avatarUrl
              ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : avatarLetter}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name ?? '—'}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email ?? (user?.avatarUrl ? 'Telegram-аккаунт' : 'Без аккаунта')}
            </div>
          </div>
          {user?.isPremium && (
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
              color: '#E2B755', background: 'rgba(226,183,85,.15)',
              border: '1px solid rgba(226,183,85,.4)', borderRadius: 20, padding: '4px 10px',
            }}>Premium</span>
          )}
        </div>

        {/* Readonly fields */}
        <div style={{ marginBottom: 12 }}>
          <span style={label}>Имя</span>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ваше имя"
            style={inputStyle}
          />
        </div>
        {user?.email && (
          <div>
            <span style={label}>Email</span>
            <input value={user.email} readOnly style={readonlyInput} />
          </div>
        )}
      </div>

      {/* Birth data */}
      <div style={{ ...glass, marginBottom: 16 }}>
        <p style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
          Данные для астрологии
        </p>

        <div style={{ marginBottom: 12 }}>
          <span style={label}>Дата рождения</span>
          <input
            type="date"
            value={form.birthDate}
            onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <span style={label}>Время рождения <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 10, letterSpacing: 0, textTransform: 'none' }}>(необязательно)</span></span>
          <input
            type="time"
            value={form.birthTime}
            onChange={(e) => setForm((f) => ({ ...f, birthTime: e.target.value }))}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <span style={label}>Город рождения</span>
          <input
            value={form.birthPlace}
            onChange={(e) => setForm((f) => ({ ...f, birthPlace: e.target.value }))}
            placeholder="Москва, Россия"
            style={inputStyle}
          />
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 6 }}>
            Координаты и часовой пояс определяются автоматически
          </p>
        </div>

        {/* Geocoded readonly fields */}
        {(user?.birthLat || user?.birthLng) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <div>
              <span style={label}>Широта</span>
              <input value={user.birthLat?.toFixed(4) ?? ''} readOnly style={readonlyInput} />
            </div>
            <div>
              <span style={label}>Долгота</span>
              <input value={user.birthLng?.toFixed(4) ?? ''} readOnly style={readonlyInput} />
            </div>
          </div>
        )}
        {user?.timezone && (
          <div style={{ marginBottom: 16 }}>
            <span style={label}>Часовой пояс</span>
            <input value={user.timezone} readOnly style={readonlyInput} />
          </div>
        )}

        <button
          onClick={() => update.mutate()}
          disabled={update.isPending}
          style={{
            width: '100%', padding: 15, borderRadius: 14, border: 'none',
            background: saved
              ? 'linear-gradient(90deg, #5ee08a, #3dc970)'
              : 'linear-gradient(90deg, #8B5CF6, #E2B755)',
            color: saved ? '#0A0915' : '#fff',
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
            opacity: update.isPending ? 0.6 : 1,
            transition: 'background .3s',
          }}
        >
          {update.isPending ? 'Сохранение…' : saved ? '✓ Сохранено' : 'Сохранить'}
        </button>
      </div>

      {/* Logout */}
      <div style={glass}>
        <p style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
          Аккаунт
        </p>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: 15, borderRadius: 14,
            border: '1px solid rgba(248,113,113,.4)',
            background: 'rgba(248,113,113,.08)',
            color: '#f87171', fontSize: 15, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Выйти из аккаунта
        </button>
      </div>
    </div>
  )
}
