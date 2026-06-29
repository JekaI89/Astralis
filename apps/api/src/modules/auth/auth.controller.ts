import { Body, Controller, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'

class TelegramAuthDto {
  initData!: string
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('telegram')
  @ApiOperation({ summary: 'Авторизация через Telegram Mini App' })
  loginTelegram(@Body() dto: TelegramAuthDto) {
    return this.auth.loginWithTelegram(dto.initData)
  }
}
