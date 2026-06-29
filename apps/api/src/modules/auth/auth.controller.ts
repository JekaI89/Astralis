import { Body, Controller, Post, Get, Param, HttpCode, Request, UseGuards, BadRequestException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength, IsOptional, IsDateString } from 'class-validator'
import { AuthService } from './auth.service'

class TelegramAuthDto {
  @IsString() initData!: string
  @IsOptional() @IsDateString() birthDate?: string
  @IsOptional() @IsString() birthTime?: string
  @IsOptional() @IsString() birthPlace?: string
}

class TelegramWidgetDto {
  @IsString() id!: string
  @IsString() first_name!: string
  @IsOptional() @IsString() last_name?: string
  @IsOptional() @IsString() username?: string
  @IsOptional() @IsString() photo_url?: string
  @IsString() auth_date!: string
  @IsString() hash!: string
}

class RegisterEmailDto {
  @IsString() @MinLength(2) name!: string
  @IsEmail() email!: string
  @IsString() @MinLength(6) password!: string
  @IsDateString() birthDate!: string
  @IsOptional() @IsString() birthTime?: string
  @IsOptional() @IsString() birthPlace?: string
}

class LoginEmailDto {
  @IsEmail() email!: string
  @IsString() password!: string
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('telegram')
  @ApiOperation({ summary: 'Авторизация через Telegram Mini App' })
  loginTelegram(@Body() dto: TelegramAuthDto) {
    return this.auth.loginWithTelegram(dto.initData, {
      birthDate: dto.birthDate,
      birthTime: dto.birthTime,
      birthPlace: dto.birthPlace,
    })
  }

  @Post('telegram-widget')
  @HttpCode(200)
  @ApiOperation({ summary: 'Авторизация через Telegram Login Widget' })
  loginTelegramWidget(@Body() dto: TelegramWidgetDto) {
    const id = parseInt(dto.id, 10)
    if (isNaN(id)) throw new BadRequestException('Invalid id')
    return this.auth.loginWithTelegramWidget({
      id,
      first_name: dto.first_name,
      last_name: dto.last_name,
      username: dto.username,
      photo_url: dto.photo_url,
      auth_date: parseInt(dto.auth_date, 10),
      hash: dto.hash,
    })
  }

  @Post('register')
  @ApiOperation({ summary: 'Регистрация через email' })
  register(@Body() dto: RegisterEmailDto) {
    return this.auth.registerWithEmail(dto)
  }

  @Post('login')
  @ApiOperation({ summary: 'Вход через email' })
  login(@Body() dto: LoginEmailDto) {
    return this.auth.loginWithEmail(dto.email, dto.password)
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Получить текущего пользователя' })
  getMe(@Request() req: { user: { id: string } }) {
    return req.user
  }

  @Post('link-email')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Привязать email к Telegram аккаунту' })
  linkEmail(
    @Request() req: { user: { id: string } },
    @Body() dto: { email: string; password: string },
  ) {
    return this.auth.linkEmail(req.user.id, dto.email, dto.password)
  }

  @Get('telegram-code')
  @ApiOperation({ summary: 'Создать одноразовый код для Telegram-авторизации' })
  createTelegramCode() {
    return { code: this.auth.createTelegramAuthCode() }
  }

  @Get('telegram-poll/:code')
  @ApiOperation({ summary: 'Опрос статуса Telegram-авторизации' })
  pollTelegramAuth(@Param('code') code: string) {
    return this.auth.pollTelegramAuth(code)
  }

  @Post('telegram-confirm')
  @HttpCode(200)
  @ApiOperation({ summary: 'Подтверждение от бота (внутренний)' })
  confirmTelegramAuth(@Body() body: { code: string; tgUser: { id: number; first_name: string; last_name?: string; username?: string; photo_url?: string } }) {
    return this.auth.confirmTelegramAuth(body.code, body.tgUser)
  }
}
