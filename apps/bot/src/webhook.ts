import type { Telegraf } from 'telegraf'

export async function setupWebhook(bot: Telegraf, appUrl: string, secret: string) {
  const webhookUrl = `${appUrl}/api/telegram/webhook`

  await bot.telegram.setWebhook(webhookUrl, {
    secret_token: secret,
    allowed_updates: ['message', 'callback_query'],
  })

  console.log(`Webhook set to: ${webhookUrl}`)
}
