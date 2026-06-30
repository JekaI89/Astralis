'use client'

import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { AstroQuestion, AstroAnswer } from '@astralis/types'

interface Message {
  role: 'user' | 'assistant' | 'error'
  content: string
}

const SUGGESTED = [
  'Когда лучший момент для карьерного роста?',
  'Что говорит моя карта об отношениях?',
  'Как текущие транзиты влияют на мою жизнь?',
  'Что означает мой личный год?',
]

export function AstrologerChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const ask = useMutation({
    mutationFn: (q: AstroQuestion) => apiClient.post<AstroAnswer>('/ai/ask', q),
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }])
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : 'Не удалось получить ответ'
      setMessages((prev) => [...prev, { role: 'error', content: msg }])
    },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, ask.isPending])

  const handleSubmit = (text?: string) => {
    const question = (text ?? input).trim()
    if (!question || ask.isPending) return
    setMessages((prev) => [...prev, { role: 'user', content: question }])
    setInput('')
    ask.mutate({ userId: '', question, context: { includeNatalChart: true, includeTransits: true } })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}>
        {messages.length === 0 && (
          <div>
            <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,.4)', marginBottom: 16 }}>
              Задайте вопрос персональному астрологу
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SUGGESTED.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSubmit(q)}
                  style={{
                    textAlign: 'left', fontSize: 13, padding: '12px 16px',
                    borderRadius: 14,
                    background: 'rgba(255,255,255,.05)',
                    border: '1px solid rgba(255,255,255,.1)',
                    color: 'rgba(255,255,255,.7)',
                    cursor: 'pointer',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: 12,
            }}
          >
            <div style={{
              maxWidth: '85%',
              padding: '12px 16px',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              fontSize: 14,
              lineHeight: 1.6,
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #8B5CF6, #6d3fcf)'
                : msg.role === 'error'
                ? 'rgba(248,113,113,.12)'
                : 'rgba(255,255,255,.07)',
              border: msg.role === 'error'
                ? '1px solid rgba(248,113,113,.3)'
                : '1px solid rgba(255,255,255,.08)',
              color: msg.role === 'error' ? '#f87171' : '#fff',
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {ask.isPending && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
            <div style={{
              padding: '14px 18px',
              borderRadius: '18px 18px 18px 4px',
              background: 'rgba(255,255,255,.07)',
              border: '1px solid rgba(255,255,255,.08)',
              display: 'flex', gap: 5, alignItems: 'center',
            }}>
              {[0, 1, 2].map((n) => (
                <span key={n} style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#E2B755',
                  display: 'inline-block',
                  animation: `bounce 1.2s ease infinite ${n * 0.2}s`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(255,255,255,.08)',
        display: 'flex', gap: 10,
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Спросите астролога…"
          style={{
            flex: 1, padding: '13px 16px', borderRadius: 14,
            border: '1px solid rgba(255,255,255,.1)',
            background: 'rgba(255,255,255,.06)',
            color: '#fff', fontSize: 14, outline: 'none',
          }}
        />
        <button
          onClick={() => handleSubmit()}
          disabled={!input.trim() || ask.isPending}
          style={{
            width: 48, height: 48, borderRadius: 14, border: 'none', flexShrink: 0,
            background: (!input.trim() || ask.isPending) ? 'rgba(255,255,255,.1)' : 'linear-gradient(135deg, #8B5CF6, #E2B755)',
            color: '#fff', fontSize: 18, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ➤
        </button>
      </div>

      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
    </div>
  )
}
