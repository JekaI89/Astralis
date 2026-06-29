'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { CompatibilityReport as Report } from '@astralis/types'

interface Props { contactId: string; contactName: string; userInitial: string }

const SPHERE_LABELS: Record<string, { label: string; color: string; glow: string }> = {
  emotional:     { label: 'Эмоциональная связь',    color: 'linear-gradient(90deg,#8B5CF6,#b18cff)', glow: 'rgba(139,92,246,.5)' },
  intellectual:  { label: 'Интеллектуальный союз',  color: 'linear-gradient(90deg,#E2B755,#f2d089)', glow: 'rgba(226,183,85,.5)' },
  physical:      { label: 'Сексуальное притяжение', color: 'linear-gradient(90deg,#f47272,#ff9a9a)', glow: 'rgba(244,114,114,.5)' },
  domestic:      { label: 'Бытовая гармония',       color: 'linear-gradient(90deg,#5ee08a,#9fe7b8)', glow: 'rgba(94,224,138,.5)'  },
}

function useFakeOrbit(real: number | undefined) {
  const [phase, setPhase] = useState<'loading' | 'done'>('loading')
  const [score, setScore] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (real === undefined) return
    timerRef.current = setTimeout(() => {
      setPhase('done')
      const target = real
      let n = 0
      countRef.current = setInterval(() => {
        n = Math.min(target, n + 2)
        setScore(n)
        if (n >= target) clearInterval(countRef.current!)
      }, 22)
    }, 2000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (countRef.current) clearInterval(countRef.current)
    }
  }, [real])

  return { phase, score }
}

export function CompatibilityReport({ contactId, contactName, userInitial }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['compatibility', contactId],
    queryFn: () => apiClient.get<Report>(`/compatibility/${contactId}`),
  })

  const { phase, score } = useFakeOrbit(data?.combinedScore)

  const orbiting = isLoading || phase === 'loading'
  const showResult = !isLoading && phase === 'done' && !!data

  const sphereKeys = Object.keys(SPHERE_LABELS) as (keyof typeof SPHERE_LABELS)[]
  const sphereValues: Record<string, number> = data?.synastryScore
    ? (() => {
        const src = data.synastryScore as Record<string, number>
        const [e, i, p, d] = sphereKeys.map((k) =>
          src[k] ?? src.emotional ?? src.love ?? src.romance ?? 70
        )
        return { emotional: e!, intellectual: i!, physical: p!, domestic: d! }
      })()
    : {}

  return (
    <div>
      {/* Avatar orbit area */}
      <div className="relative h-[158px] flex items-center justify-center gap-10 mt-4">
        {orbiting && (
          <>
            <div className="absolute w-[200px] h-[200px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none anim-orbit">
              {['♀','♂','☽','☿'].map((g, i) => {
                const positions = [
                  'left-1/2 -top-1 -translate-x-1/2',
                  'right-0 top-1/2 -translate-y-1/2',
                  'left-1/2 bottom-0 -translate-x-1/2',
                  'left-0 top-1/2 -translate-y-1/2',
                ]
                const colors = ['#E2B755','#8B5CF6','#E2B755','#8B5CF6']
                return (
                  <div key={i} className={`absolute ${positions[i]} text-[14px]`}
                    style={{ color: colors[i] }}>{g}</div>
                )
              })}
            </div>
            <div className="absolute w-[150px] h-[150px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none anim-orbitr">
              {['✦','✦'].map((g, i) => (
                <div key={i} className={`absolute ${i === 0 ? 'left-1/2 -top-1 -translate-x-1/2' : 'left-1/2 bottom-0 -translate-x-1/2'} text-[12px]`}
                  style={{ color: 'rgba(255,255,255,.6)' }}>{g}</div>
              ))}
            </div>
          </>
        )}

        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-[74px] h-[74px] rounded-full flex items-center justify-center text-[26px] text-white"
            style={{ background: 'linear-gradient(150deg,#8B5CF6,#3a2a66)', border: '2px solid rgba(226,183,85,.5)', boxShadow: '0 0 22px rgba(139,92,246,.45)', fontFamily: 'var(--font-serif)' }}>
            {userInitial}
          </div>
          <span className="text-[12px]" style={{ color: 'rgba(255,255,255,.7)' }}>Вы</span>
        </div>

        <div className="relative z-10 text-[20px] anim-float" style={{ color: '#E2B755' }}>✦</div>

        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-[74px] h-[74px] rounded-full flex items-center justify-center text-[26px] text-white"
            style={{ background: 'linear-gradient(150deg,#E2B755,#7a5a1e)', border: '2px solid rgba(139,92,246,.5)', boxShadow: '0 0 22px rgba(226,183,85,.4)', fontFamily: 'var(--font-serif)' }}>
            {contactName.charAt(0)}
          </div>
          <span className="text-[12px]" style={{ color: 'rgba(255,255,255,.7)' }}>{contactName}</span>
        </div>
      </div>

      {/* Orbiting label */}
      {orbiting && (
        <p className="text-center mt-3 text-[16px] anim-float"
          style={{ fontFamily: 'var(--font-serif)', color: '#E2B755' }}>
          Сверяем положение планет…
        </p>
      )}

      {/* Result */}
      {showResult && (
        <div className="anim-fadeup">
          {/* Score */}
          <div className="text-center mt-2">
            <div className="relative inline-block">
              <div className="absolute inset-[-10px] rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(226,183,85,.4), transparent 70%)', animation: 'twinkle 3s ease-in-out infinite' }} />
              <div className="relative text-[54px] leading-none anim-scoreglow"
                style={{ fontFamily: 'var(--font-serif)', color: '#E2B755', textShadow: '0 0 26px rgba(226,183,85,.5)' }}>
                {score}<span className="text-[24px]">%</span>
              </div>
            </div>
            <div className="text-[13px] mt-1" style={{ color: 'rgba(255,255,255,.65)' }}>
              общая совместимость
            </div>
          </div>

          {/* Sphere bars */}
          <div className="flex flex-col gap-3.5 mt-6">
            {sphereKeys.map((key) => {
              const meta = SPHERE_LABELS[key]!
              const pct = sphereValues[key] ?? 70
              return (
                <div key={key}>
                  <div className="flex justify-between text-[12.5px] mb-1.5">
                    <span style={{ color: 'rgba(255,255,255,.78)' }}>{meta.label}</span>
                    <span style={{ color: '#E2B755' }}>{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,.08)' }}>
                    <div className="h-1.5 rounded-full"
                      style={{ width: `${pct}%`, background: meta.color, boxShadow: `0 0 10px ${meta.glow}`, transition: 'width 1s cubic-bezier(.3,.8,.3,1)' }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Strengths / Risks */}
          <div className="flex flex-col gap-3 mt-6">
            {data.strengths.length > 0 && (
              <div className="rounded-[18px] p-4"
                style={{ background: 'rgba(74,222,128,.07)', border: '1px solid rgba(74,222,128,.28)' }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span style={{ color: '#5ee08a', fontSize: 15 }}>✦</span>
                  <span className="text-[14px] font-medium" style={{ color: '#9fe7b8' }}>Что вас сближает</span>
                </div>
                <div className="text-[13px] leading-snug" style={{ color: 'rgba(255,255,255,.78)' }}>
                  {data.strengths.slice(0, 2).map((s, i) => (
                    <p key={i} className={i > 0 ? 'mt-1' : ''}>✓ {s}</p>
                  ))}
                </div>
              </div>
            )}
            {data.unionDescription && (
              <div className="rounded-[18px] p-4"
                style={{ background: 'rgba(244,114,114,.07)', border: '1px solid rgba(244,114,114,.28)' }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span style={{ color: '#f47272', fontSize: 15 }}>⚠</span>
                  <span className="text-[14px] font-medium" style={{ color: '#f4a3a3' }}>На что обратить внимание</span>
                </div>
                <p className="text-[13px] leading-snug" style={{ color: 'rgba(255,255,255,.78)' }}>
                  {data.unionDescription}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
