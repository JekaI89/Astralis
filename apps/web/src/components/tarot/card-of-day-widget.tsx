'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { getTodayIso } from '@astralis/core'
import type { TarotCard } from '@astralis/types'
import Image from 'next/image'
import Link from 'next/link'

export function CardOfDayWidget() {
  const { data } = useQuery({
    queryKey: ['tarot', 'daily', getTodayIso()],
    queryFn: () => apiClient.get<TarotCard>(`/tarot/daily?date=${getTodayIso()}`),
  })

  if (!data) return null

  const keywords = data.isReversed ? data.keywordReversed : data.keywordUpright
  const description = data.isReversed ? data.descriptionReversed : data.descriptionUpright

  return (
    <Link href="/tarot" style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        background: 'rgba(255,255,255,.05)',
        border: '1px solid rgba(255,255,255,.1)',
        borderRadius: 24,
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        padding: '20px',
      }}>
        <p style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
          color: '#E2B755',
          margin: '0 0 12px',
        }}>
          Карта дня
        </p>

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{
            flexShrink: 0,
            width: 64,
            height: 96,
            borderRadius: 10,
            overflow: 'hidden',
            transform: data.isReversed ? 'rotate(180deg)' : 'none',
            boxShadow: '0 6px 18px rgba(0,0,0,.4)',
            position: 'relative',
          }}>
            <Image
              src={data.imageUrl}
              alt={data.nameRu}
              fill
              sizes="64px"
              style={{ objectFit: 'cover' }}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none' }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #1a1035 0%, #2d1f5e 100%)',
              fontSize: 24,
            }}>
              🃏
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <h3 style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 17,
                fontWeight: 700,
                color: '#fff',
                margin: 0,
              }}>
                {data.nameRu}
              </h3>
              {data.isReversed && (
                <span style={{
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: '#8B5CF6',
                  background: 'rgba(139,92,246,.15)',
                  border: '1px solid rgba(139,92,246,.3)',
                  borderRadius: 20,
                  padding: '2px 8px',
                }}>
                  Перевёрнутая
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
              {keywords.slice(0, 3).map((kw) => (
                <span key={kw} style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: '#E2B755',
                  background: 'rgba(226,183,85,.1)',
                  border: '1px solid rgba(226,183,85,.25)',
                  borderRadius: 20,
                  padding: '3px 8px',
                }}>
                  {kw}
                </span>
              ))}
            </div>

            <p style={{
              fontSize: 12,
              lineHeight: 1.6,
              color: 'rgba(255,255,255,.6)',
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {description}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
