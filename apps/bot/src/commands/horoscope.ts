import type { Context } from 'telegraf'

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000'
const APP_URL = process.env['NEXT_PUBLIC_APP_URL'] ?? 'https://app.astralis.io'

export async function horoscopeCommand(ctx: Context) {
  const telegramId = ctx.from?.id
  if (!telegramId) return

  try {
    // Получаем токен пользователя или используем публичный гороскоп
    const today = new Date().toISOString().split('T')[0]!
    const res = await fetch(`${API_URL}/horoscope/daily?date=${today}`, {
      headers: { 'X-Telegram-Id': String(telegramId) },
    })

    if (!res.ok) {
      await ctx.reply('Не удалось получить гороскоп. Откройте приложение 👇', {
        reply_markup: {
          inline_keyboard: [[{ text: '🔮 Открыть Astralis', web_app: { url: APP_URL } }]],
        },
      })
      return
    }

    const horoscope = await res.json() as { headline: string; affirmation: string; energy: number }

    await ctx.reply(
      `🌟 <b>Ваш прогноз на сегодня</b>\n\n${horoscope.headline}\n\n✨ <i>${horoscope.affirmation}</i>\n\nЭнергия дня: ${'⚡'.repeat(Math.floor(horoscope.energy / 2))}`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📖 Подробный прогноз', web_app: { url: `${APP_URL}` } }],
            [{ text: '🤖 Задать вопрос астрологу', web_app: { url: `${APP_URL}/ai` } }],
          ],
        },
      },
    )
  } catch {
    await ctx.reply('Произошла ошибка. Попробуйте открыть приложение.')
  }
}
