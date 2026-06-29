import 'dotenv/config'
import { Telegraf } from 'telegraf'
import { setupCommands } from './commands'
import { setupWebhook } from './webhook'

const token = process.env['TELEGRAM_BOT_TOKEN']
if (!token) throw new Error('TELEGRAM_BOT_TOKEN is required')

const bot = new Telegraf(token)

setupCommands(bot)

const webhookSecret = process.env['TELEGRAM_WEBHOOK_SECRET']
const webhookUrl = process.env['NEXT_PUBLIC_APP_URL']

if (webhookUrl && webhookSecret) {
  void setupWebhook(bot, webhookUrl, webhookSecret)
} else {
  // Режим long-polling для разработки
  void bot.launch()
  console.log('Bot started in polling mode')
}

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
