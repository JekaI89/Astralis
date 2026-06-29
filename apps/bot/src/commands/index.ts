import type { Telegraf } from 'telegraf'
import { startCommand } from './start'
import { horoscopeCommand } from './horoscope'
import { menuCommand } from './menu'

export function setupCommands(bot: Telegraf) {
  bot.start(startCommand)
  bot.command('horoscope', horoscopeCommand)
  bot.command('menu', menuCommand)
  bot.on('callback_query', handleCallbackQuery)
}

async function handleCallbackQuery(ctx: Parameters<Telegraf['on']>[1]) {
  // @ts-expect-error telegraf types
  const data = ctx.callbackQuery?.data as string | undefined
  if (!data) return
  await ctx.answerCbQuery()
}
