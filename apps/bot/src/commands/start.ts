import type { Context } from 'telegraf'

const APP_URL = process.env['NEXT_PUBLIC_APP_URL'] ?? 'https://app.astralis.io'

export async function startCommand(ctx: Context) {
  const name = ctx.from?.first_name ?? 'друг'

  await ctx.reply(
    `✨ Привет, ${name}!\n\nДобро пожаловать в <b>Astralis</b> — твой персональный астролог и нумеролог.\n\n🌟 Открой приложение, чтобы:\n• Получить натальную карту\n• Узнать прогноз на сегодня\n• Проверить совместимость\n• Задать вопрос ИИ-астрологу`,
    {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🔮 Открыть Astralis',
              web_app: { url: APP_URL },
            },
          ],
          [
            { text: '🌟 Гороскоп', callback_data: 'horoscope' },
            { text: '🌕 Луна', callback_data: 'lunar' },
          ],
        ],
      },
    },
  )
}
