import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Anthropic from '@anthropic-ai/sdk'
import { PrismaService } from '../../prisma/prisma.service'
import { AstroService } from '../astro/astro.service'
import type { AstroQuestion, AstroAnswer } from '@astralis/types'

const SYSTEM_PROMPT = `Ты — профессиональный астролог и нумеролог с 20-летним опытом.
Ты отвечаешь на вопросы пользователей о их натальной карте, транзитах планет и нумерологических циклах.
Давай конкретные, практичные советы. Используй простой язык без излишнего мистицизма.
Отвечай на русском языке. Структурируй ответы с абзацами. Длина ответа — 150–250 слов.`

@Injectable()
export class AiService {
  private anthropic: Anthropic

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private astro: AstroService,
  ) {
    this.anthropic = new Anthropic({
      apiKey: this.config.get('ANTHROPIC_API_KEY') ?? '',
    })
  }

  async askAstrologer(userId: string, question: AstroQuestion): Promise<AstroAnswer> {
    const contextParts: string[] = []
    const sources: string[] = []

    if (question.context?.includeNatalChart) {
      try {
        const chart = await this.astro.getNatalChart(userId)
        const user = await this.prisma.user.findUnique({ where: { id: userId } })
        contextParts.push(`Натальная карта пользователя: Солнце в ${chart.planets[0]?.sign}, Луна в ${chart.planets[1]?.sign}, Асцендент в ${chart.ascendant.sign}.`)
        sources.push('натальная карта')
        if (user?.birthDate) {
          contextParts.push(`Дата рождения: ${user.birthDate.toLocaleDateString('ru-RU')}`)
        }
      } catch {
        // карта не рассчитана — продолжаем без неё
      }
    }

    if (question.context?.includeTransits) {
      try {
        const date = question.context.referenceDate ?? new Date().toISOString().split('T')[0]!
        const transits = await this.astro.getCurrentTransits(userId, date)
        const highImpact = transits.filter((t) => t.intensity === 'high').slice(0, 3)
        if (highImpact.length > 0) {
          contextParts.push(`Текущие значимые транзиты: ${highImpact.map((t) => t.description).join('; ')}.`)
          sources.push('текущие транзиты')
        }
      } catch {
        // игнорируем ошибку транзитов
      }
    }

    const userMessage = contextParts.length > 0
      ? `Контекст:\n${contextParts.join('\n')}\n\nВопрос пользователя: ${question.question}`
      : question.question

    const message = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const answer = message.content[0]?.type === 'text' ? message.content[0].text : ''

    return {
      answer,
      sources,
      suggestedQuestions: this.generateSuggestedQuestions(question.question),
      tokenCount: message.usage.input_tokens + message.usage.output_tokens,
    }
  }

  private generateSuggestedQuestions(originalQuestion: string): string[] {
    void originalQuestion
    return [
      'Когда мне лучше принимать важные решения по работе?',
      'Что говорит моя натальная карта о здоровье?',
      'Как транзитный Сатурн влияет на мои отношения?',
    ]
  }
}
