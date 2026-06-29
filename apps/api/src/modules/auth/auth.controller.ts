import { Body, Controller, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength, IsOptional, IsDateString } from 'class-validator'
import { AuthService } from './auth.service'

class TelegramAuthDto {
  @IsString() initData!: string
  @IsOptional() @IsDateString() birthDate?: string
  @IsOptional() @IsString() birthTime?: string
  @IsOptional() @IsString() birthPlace?: string
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
}
