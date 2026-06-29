'use client'

import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { AstroQuestion, AstroAnswer } from '@astralis/types'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED_QUESTIONS = [
  'Когда лучший момент для карьерного роста?',
  'Что говорит моя карта об отношениях?',
  'Как текущие транзиты влияют на моё здоровье?',
  'Мой личный год — что он означает?',
]

export function AstrologerChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const ask = useMutation({
    mutationFn: (question: AstroQuestion) =>
      apiClient.post<AstroAnswer>('/ai/ask', question),
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }])
    },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = () => {
    if (!input.trim() || ask.isPending) return
    const question = input.trim()
    setMessages((prev) => [...prev, { role: 'user', content: question }])
    setInput('')
    ask.mutate({
      userId: '',
      question,
      context: { includeNatalChart: true, includeTransits: true },
    })
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-2 pt-4">
            <p className="text-center text-sm text-[var(--color-text-muted)]">
              Задайте вопрос вашему персональному астрологу
            </p>
            <div className="grid grid-cols-1 gap-2 mt-4">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-left text-sm px-4 py-3 rounded-xl bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
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
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[var(--color-primary)] text-white rounded-br-sm'
                  : 'bg-[var(--color-surface-2)] rounded-bl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {ask.isPending && (
          <div className="flex justify-start">
            <div className="bg-[var(--color-surface-2)] rounded-2xl rounded-bl-sm px-4 py-3">
              <span className="inline-flex gap-1">
                <span className="w-2 h-2 bg-[var(--color-text-muted)] rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-[var(--color-text-muted)] rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-[var(--color-text-muted)] rounded-full animate-bounce" />
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-[var(--color-border)]">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Спросите астролога..."
            className="flex-1 bg-[var(--color-surface-2)] rounded-xl px-4 py-3 text-sm outline-none placeholder:text-[var(--color-text-muted)]"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || ask.isPending}
            className="px-4 py-3 bg-[var(--color-primary)] rounded-xl disabled:opacity-40 transition-opacity"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  )
}
