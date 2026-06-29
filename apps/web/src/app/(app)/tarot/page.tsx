'use client'

import React, { useState } from 'react'
import type { CSSProperties } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { getTodayIso } from '@astralis/core'
import type { TarotCard } from '@astralis/types'
import Image from 'next/image'

const CARD_STYLE: CSSProperties = {
  background: 'rgba(255,255,255,.05)',
  border: '1px solid rgba(255,255,255,.1)',
  borderRadius: 24,
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  padding: '24px',
}

const LABEL_STYLE: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '2.5px',
  textTransform: 'uppercase',
  color: '#E2B755',
  marginBottom: 8,
}

const HEADING_STYLE: CSSProperties = {
  fontFamily: '"Playfair Display", Georgia, serif',
  fontSize: 28,
  fontWeight: 700,
  color: '#fff',
  marginBottom: 0,
}

function KeywordBadge({ text }: { text: string }) {
  return (
    <span style={{
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '1.5px',
      textTransform: 'uppercase',
      color: '#E2B755',
      background: 'rgba(226,183,85,.12)',
      border: '1px solid rgba(226,183,85,.3)',
      borderRadius: 20,
      padding: '4px 12px',
    }}>
      {text}
    </span>
  )
}

function CardDisplay({ card, label }: { card: TarotCard; label: string }) {
  const [flipped, setFlipped] = useState(false)
  const keywords = card.isReversed ? card.keywordReversed : card.keywordUpright
  const description = card.isReversed ? card.descriptionReversed : card.descriptionUpright

  return (
    <div style={CARD_STYLE}>
      <p style={LABEL_STYLE}>{label}</p>
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        {/* Card image */}
        <div
          onClick={() => setFlipped((f: boolean) => !f)}
          style={{
            flexShrink: 0,
            width: 88,
            height: 132,
            borderRadius: 12,
            overflow: 'hidden',
            cursor: 'pointer',
            transform: card.isReversed ? 'rotate(180deg)' : 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,.4), 0 0 0 1px rgba(226,183,85,.2)',
            transition: 'transform .3s ease',
            position: 'relative',
          }}
        >
          <Image
            src={card.imageUrl}
            alt={card.nameRu}
            fill
            sizes="88px"
            style={{ objectFit: 'cover' }}
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          {/* Fallback arcana symbol */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #1a1035 0%, #2d1f5e 100%)',
            fontSize: 32,
          }}>
            🃏
          </div>
        </div>

        {/* Card info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <h3 style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 20,
              fontWeight: 700,
              color: '#fff',
              margin: 0,
            }}>
              {card.nameRu}
            </h3>
            {card.isReversed && (
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: '#8B5CF6',
                background: 'rgba(139,92,246,.15)',
                border: '1px solid rgba(139,92,246,.3)',
                borderRadius: 20,
                padding: '3px 10px',
              }}>
                Перевёрнутая
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {keywords.slice(0, 3).map((kw) => (
              <KeywordBadge key={kw} text={kw} />
            ))}
          </div>

          <p style={{
            fontSize: 13,
            lineHeight: 1.6,
            color: 'rgba(255,255,255,.65)',
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function TarotPage() {
  const { data: dailyCard, isLoading: dailyLoading } = useQuery({
    queryKey: ['tarot', 'daily', getTodayIso()],
    queryFn: () => apiClient.get<TarotCard>(`/tarot/daily?date=${getTodayIso()}`),
  })

  const [randomCard, setRandomCard] = useState<TarotCard | null>(null)
  const [randomLoading, setRandomLoading] = useState(false)

  const drawRandom = async () => {
    setRandomLoading(true)
    try {
      const card = await apiClient.get<TarotCard>('/tarot/random')
      setRandomCard(card)
    } finally {
      setRandomLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0A0915 0%, #120C24 50%, #160F29 100%)',
      padding: '24px 16px 100px',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={LABEL_STYLE}>Таро</p>
        <h1 style={HEADING_STYLE}>Карты судьбы</h1>
      </div>

      {/* Daily card */}
      <div style={{ marginBottom: 20 }}>
        {dailyLoading ? (
          <div style={{
            ...CARD_STYLE,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 160,
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '2px solid rgba(226,183,85,.2)',
              borderTopColor: '#E2B755',
              animation: 'spin 1s linear infinite',
            }} />
          </div>
        ) : dailyCard ? (
          <CardDisplay card={dailyCard} label="Карта дня" />
        ) : (
          <div style={{ ...CARD_STYLE, textAlign: 'center', color: 'rgba(255,255,255,.4)', fontSize: 14 }}>
            Не удалось загрузить карту дня
          </div>
        )}
      </div>

      {/* Random card section */}
      <div style={{ marginBottom: 20 }}>
        {randomCard && (
          <div style={{ marginBottom: 16 }}>
            <CardDisplay card={randomCard} label="Случайная карта" />
          </div>
        )}

        <button
          onClick={drawRandom}
          disabled={randomLoading}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: 16,
            border: 'none',
            background: randomLoading
              ? 'rgba(226,183,85,.3)'
              : 'linear-gradient(135deg, #E2B755 0%, #C9A43A 100%)',
            color: '#0A0915',
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '1px',
            cursor: randomLoading ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'opacity .2s',
          }}
        >
          {randomLoading ? (
            <>
              <span style={{
                display: 'inline-block',
                width: 16,
                height: 16,
                borderRadius: '50%',
                border: '2px solid rgba(10,9,21,.3)',
                borderTopColor: '#0A0915',
                animation: 'spin 1s linear infinite',
              }} />
              Тасуем колоду…
            </>
          ) : (
            <>✦ {randomCard ? 'Вытянуть другую карту' : 'Вытянуть случайную карту'}</>
          )}
        </button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
