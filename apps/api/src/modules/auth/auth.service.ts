import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../prisma/prisma.service'
import * as crypto from 'crypto'

export interface TelegramInitData {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  validateTelegramData(initData: string): TelegramInitData {
    const params = new URLSearchParams(initData)
    const hash = params.get('hash')
    params.delete('hash')

    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n')

    const botToken = this.config.getOrThrow<string>('TELEGRAM_BOT_TOKEN')
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest()
    const expectedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

    if (expectedHash !== hash) throw new UnauthorizedException('Invalid Telegram data')

    const user = JSON.parse(params.get('user') ?? '{}') as TelegramInitData
    return user
  }

  async loginWithTelegram(initData: string) {
    const telegramUser = this.validateTelegramData(initData)

    const user = await this.prisma.user.upsert({
      where: { telegramId: BigInt(telegramUser.id) },
      update: {
        name: `${telegramUser.first_name} ${telegramUser.last_name ?? ''}`.trim(),
        avatarUrl: telegramUser.photo_url,
      },
      create: {
        telegramId: BigInt(telegramUser.id),
        name: `${telegramUser.first_name} ${telegramUser.last_name ?? ''}`.trim(),
        avatarUrl: telegramUser.photo_url,
        birthDate: new Date('2000-01-01'),
      },
    })

    const token = this.jwt.sign({ sub: user.id, telegramId: telegramUser.id })
    return { token, user }
  }

  async validateJwt(payload: { sub: string }) {
    return this.prisma.user.findUnique({ where: { id: payload.sub } })
  }
}
