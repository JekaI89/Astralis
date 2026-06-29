import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Telegraf, Context } from 'telegraf'
import { AuthService } from '../auth/auth.service'

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name)
  private bot: Telegraf | null = null
  private readonly appUrl: string

  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService,
  ) {
    this.appUrl = this.config.get<string>('NEXT_PUBLIC_APP_URL') ?? 'https://novasoul-web.onrender.com'
  }

  async onModuleInit() {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN')
    if (!token) {
      this.logger.warn('TELEGRAM_BOT_TOKEN not set — Telegram bot disabled')
      return
    }

    this.bot = new Telegraf(token)
    this.setupCommands()

    const webhookSecret = this.config.get<string>('TELEGRAM_WEBHOOK_SECRET')
    const publicUrl = this.config.get<string>('RENDER_EXTERNAL_URL') ?? this.config.get<string>('API_URL')

    if (publicUrl && webhookSecret) {
      const webhookUrl = `${publicUrl}/api/telegram/webhook`
      await this.bot.telegram.setWebhook(webhookUrl, { secret_token: webhookSecret })
      this.logger.log(`Telegram webhook set: ${webhookUrl}`)
    } else {
      void this.bot.launch()
      this.logger.log('Telegram bot started in polling mode')
    }
  }

  async handleWebhook(body: object, secret: string): Promise<void> {
    const expectedSecret = this.config.get<string>('TELEGRAM_WEBHOOK_SECRET')
    if (expectedSecret && secret !== expectedSecret) return
    if (!this.bot) return
    await this.bot.handleUpdate(body as Parameters<typeof this.bot.handleUpdate>[0])
  }

  private setupCommands() {
    if (!this.bot) return

    this.bot.start((ctx) => this.handleStart(ctx as Context & { startPayload?: string }))
    this.bot.command('menu', (ctx) => this.handleMenu(ctx))
    this.bot.command('horoscope', (ctx) => this.handleHoroscope(ctx))
  }

  private async handleStart(ctx: Context & { startPayload?: string }) {
    const payload = ctx.startPayload ?? (ctx.message && 'text' in ctx.message ? ctx.message.text.split(' ')[1] : '')

    if (payload?.startsWith('auth_')) {
      const code = payload.slice(5)
      const user = ctx.from
      if (!user) return

      try {
        await this.authService.confirmTelegramAuth(code, {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
        })
        await ctx.reply(
          `✅ <b>Авторизация успешна!</b>\n\nВернитесь в приложение — оно уже вас узнало.`,
          { parse_mode: 'HTML' }
        )
      } catch {
        await ctx.reply('⚠️ Ошибка авторизации. Попробуйте снова.')
      }
      return
    }

    const name = ctx.from?.first_name ?? 'друг'
    await ctx.reply(
      `✨ Привет, ${name}!\n\nДобро пожаловать в <b>Astralis</b> — твой персональный астролог.\n\n🌟 Открой приложение:`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔮 Открыть Astralis', web_app: { url: this.appUrl } }],
            [
              { text: '🌟 Гороскоп', callback_data: 'horoscope' },
              { text: '🌕 Луна', callback_data: 'lunar' },
            ],
          ],
        },
      },
    )
  }

  private async handleMenu(ctx: Context) {
    await ctx.reply('🔮 <b>Меню Astralis</b>\n\nВыберите раздел:', {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🌟 Гороскоп', web_app: { url: this.appUrl } },
            { text: '✨ Натальная карта', web_app: { url: `${this.appUrl}/chart` } },
          ],
          [
            { text: '💫 Совместимость', web_app: { url: `${this.appUrl}/compatibility` } },
            { text: '🔢 Нумерология', web_app: { url: `${this.appUrl}/numerology` } },
          ],
          [
            { text: '📅 Лунный календарь', web_app: { url: `${this.appUrl}/calendar` } },
            { text: '🤖 ИИ-Астролог', web_app: { url: `${this.appUrl}/ai` } },
          ],
        ],
      },
    })
  }

  private async handleHoroscope(ctx: Context) {
    const today = new Date().toISOString().split('T')[0]!
    try {
      const res = await fetch(`http://localhost:${process.env.PORT ?? 4000}/horoscope/daily?date=${today}`)
      if (!res.ok) throw new Error('API error')
      const h = await res.json() as { headline: string; affirmation: string; energy: number }
      await ctx.reply(
        `🌟 <b>Прогноз на сегодня</b>\n\n${h.headline}\n\n✨ <i>${h.affirmation}</i>`,
        {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[{ text: '📖 Подробнее', web_app: { url: this.appUrl } }]],
          },
        },
      )
    } catch {
      await ctx.reply('Откройте приложение для прогноза 👇', {
        reply_markup: { inline_keyboard: [[{ text: '🔮 Открыть', web_app: { url: this.appUrl } }]] },
      })
    }
  }
}
