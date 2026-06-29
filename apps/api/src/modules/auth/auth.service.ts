import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../prisma/prisma.service'
import * as bcrypt from 'bcryptjs'
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

  // ─── Email регистрация ───────────────────────────────────────────────
  async registerWithEmail(dto: {
    name: string
    email: string
    password: string
    birthDate: string
    birthTime?: string
    birthPlace?: string
  }) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (existing) throw new ConflictException('Email уже используется')
    if (dto.password.length < 6) throw new BadRequestException('Пароль минимум 6 символов')

    const passwordHash = await bcrypt.hash(dto.password, 10)
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        birthDate: new Date(dto.birthDate),
        birthTime: dto.birthTime ?? null,
        birthPlace: dto.birthPlace ?? null,
      },
    })

    const token = this.jwt.sign({ sub: user.id })
    return { token, user: this.safeUser(user) }
  }

  // ─── Email логин ─────────────────────────────────────────────────────
  async loginWithEmail(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })
    if (!user?.passwordHash) throw new UnauthorizedException('Неверный email или пароль')

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Неверный email или пароль')

    const token = this.jwt.sign({ sub: user.id })
    return { token, user: this.safeUser(user) }
  }

  // ─── Telegram Mini App ───────────────────────────────────────────────
  validateTelegramData(initData: string): TelegramInitData {
    const params = new URLSearchParams(initData)
    const hash = params.get('hash')
    params.delete('hash')

    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n')

    const botToken = this.config.get<string>('TELEGRAM_BOT_TOKEN') ?? ''
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest()
    const expectedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

    if (expectedHash !== hash) throw new UnauthorizedException('Invalid Telegram data')

    return JSON.parse(params.get('user') ?? '{}') as TelegramInitData
  }

  async loginWithTelegram(initData: string, birthData?: {
    birthDate?: string
    birthTime?: string
    birthPlace?: string
  }) {
    const tg = this.validateTelegramData(initData)

    const updateData: Record<string, unknown> = {
      name: `${tg.first_name} ${tg.last_name ?? ''}`.trim(),
      avatarUrl: tg.photo_url,
    }
    if (birthData?.birthDate) updateData['birthDate'] = new Date(birthData.birthDate)
    if (birthData?.birthTime) updateData['birthTime'] = birthData.birthTime
    if (birthData?.birthPlace) updateData['birthPlace'] = birthData.birthPlace

    const user = await this.prisma.user.upsert({
      where: { telegramId: BigInt(tg.id) },
      update: updateData,
      create: {
        telegramId: BigInt(tg.id),
        name: `${tg.first_name} ${tg.last_name ?? ''}`.trim(),
        avatarUrl: tg.photo_url,
        birthDate: birthData?.birthDate ? new Date(birthData.birthDate) : new Date('2000-01-01'),
        birthTime: birthData?.birthTime ?? null,
        birthPlace: birthData?.birthPlace ?? null,
      },
    })

    const token = this.jwt.sign({ sub: user.id, telegramId: tg.id })
    return { token, user: this.safeUser(user) }
  }

  async validateJwt(payload: { sub: string }) {
    return this.prisma.user.findUnique({ where: { id: payload.sub } })
  }

  private safeUser(user: {
    id: string; name: string; email: string | null; avatarUrl: string | null
    isPremium: boolean; birthDate: Date; birthTime: string | null; birthPlace: string | null
  }) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      isPremium: user.isPremium,
      birthDate: user.birthDate,
      birthTime: user.birthTime,
      birthPlace: user.birthPlace,
    }
  }
}
