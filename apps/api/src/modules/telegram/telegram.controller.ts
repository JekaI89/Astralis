import { Controller, Post, Body, Headers, HttpCode } from '@nestjs/common'
import { TelegramService } from './telegram.service'

@Controller('api/telegram')
export class TelegramController {
  constructor(private readonly telegram: TelegramService) {}

  @Post('webhook')
  @HttpCode(200)
  async webhook(
    @Body() body: object,
    @Headers('x-telegram-bot-api-secret-token') secret: string,
  ) {
    await this.telegram.handleWebhook(body, secret)
    return { ok: true }
  }
}
