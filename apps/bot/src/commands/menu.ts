import type { Context } from 'telegraf'

const APP_URL = process.env['NEXT_PUBLIC_APP_URL'] ?? 'https://app.astralis.io'

export async function menuCommand(ctx: Context) {
  await ctx.reply(
    '🔮 <b>Меню Astralis</b>\n\nВыберите раздел:',
    {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🌟 Гороскоп', web_app: { url: `${APP_URL}` } },
            { text: '✨ Натальная карта', web_app: { url: `${APP_URL}/chart` } },
          ],
          [
            { text: '💫 Совместимость', web_app: { url: `${APP_URL}/compatibility` } },
            { text: '🔢 Нумерология', web_app: { url: `${APP_URL}/numerology` } },
          ],
          [
            { text: '📅 Лунный календарь', web_app: { url: `${APP_URL}/calendar` } },
            { text: '🤖 ИИ-Астролог', web_app: { url: `${APP_URL}/ai` } },
          ],
          [
            { text: '👤 Профиль', web_app: { url: `${APP_URL}/profile` } },
          ],
        ],
      },
    },
  )
}
