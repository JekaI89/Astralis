import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../prisma/prisma.service'
import { AstroService } from '../astro/astro.service'
import type { AstroQuestion, AstroAnswer } from '@astralis/types'

const SYSTEM_PROMPT = `Ты — профессиональный астролог и нумеролог с 20-летним опытом.
Ты отвечаешь на вопросы пользователей о их натальной карте, транзитах планет и нумерологических циклах.
Давай конкретные, практичные советы. Используй простой язык без излишнего мистицизма.
Отвечай на русском языке. Структурируй ответы с абзацами. Длина ответа — 150–250 слов.`

@Injectable()
export class AiService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private astro: AstroService,
  ) {}

  async askAstrologer(userId: string, question: AstroQuestion): Promise<AstroAnswer> {
    const contextParts: string[] = []
    const sources: string[] = []

    if (question.context?.includeNatalChart) {
      try {
        const chart = await this.astro.getNatalChart(userId)
        const user = await this.prisma.user.findUnique({ where: { id: userId } })
        contextParts.push(`Натальная карта: Солнце в ${chart.planets[0]?.sign}, Луна в ${chart.planets[1]?.sign}, Асцендент в ${chart.ascendant.sign}.`)
        sources.push('натальная карта')
        if (user?.birthDate) {
          contextParts.push(`Дата рождения: ${user.birthDate.toLocaleDateString('ru-RU')}`)
        }
      } catch {
        // карта не рассчитана
      }
    }

    if (question.context?.includeTransits) {
      try {
        const date = question.context.referenceDate ?? new Date().toISOString().split('T')[0]!
        const transits = await this.astro.getCurrentTransits(userId, date)
        const highImpact = transits.filter((t) => t.intensity === 'high').slice(0, 3)
        if (highImpact.length > 0) {
          contextParts.push(`Текущие транзиты: ${highImpact.map((t) => t.description).join('; ')}.`)
          sources.push('текущие транзиты')
        }
      } catch {
        // игнорируем
      }
    }

    const userMessage = contextParts.length > 0
      ? `Контекст:\n${contextParts.join('\n')}\n\nВопрос: ${question.question}`
      : question.question

    const grokKey = this.config.get<string>('GROK_API_KEY')
    const anthropicKey = this.config.get<string>('ANTHROPIC_API_KEY')

    let answer: string
    if (grokKey) {
      answer = await this.callGrok(grokKey, userMessage)
    } else if (anthropicKey) {
      answer = await this.callAnthropic(anthropicKey, userMessage)
    } else {
      throw new Error('AI API key not configured (set GROK_API_KEY or ANTHROPIC_API_KEY in environment)')
    }

    return {
      answer,
      sources,
      suggestedQuestions: [
        'Когда мне лучше принимать важные решения по работе?',
        'Что говорит моя натальная карта о здоровье?',
        'Как транзитный Сатурн влияет на мои отношения?',
      ],
      tokenCount: 0,
    }
  }

  private async callGrok(apiKey: string, message: string): Promise<string> {
    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'grok-3-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    })
    if (!res.ok) throw new Error(`Grok API error ${res.status}: ${await res.text()}`)
    const data = await res.json() as { choices: { message: { content: string } }[] }
    return data.choices[0]?.message?.content ?? ''
  }

  private async callAnthropic(apiKey: string, message: string): Promise<string> {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: message }],
      }),
    })
    if (!res.ok) throw new Error(`Anthropic API error ${res.status}: ${await res.text()}`)
    const data = await res.json() as { content: { type: string; text: string }[] }
    return data.content[0]?.type === 'text' ? data.content[0].text : ''
  }
}
