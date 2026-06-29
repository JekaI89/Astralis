import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { ScheduleModule } from '@nestjs/schedule'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { AstroModule } from './modules/astro/astro.module'
import { NumerologyModule } from './modules/numerology/numerology.module'
import { HoroscopeModule } from './modules/horoscope/horoscope.module'
import { CompatibilityModule } from './modules/compatibility/compatibility.module'
import { MoodModule } from './modules/mood/mood.module'
import { AiModule } from './modules/ai/ai.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { TarotModule } from './modules/tarot/tarot.module'
import { TelegramModule } from './modules/telegram/telegram.module'
import { PrismaModule } from './prisma/prisma.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    AstroModule,
    NumerologyModule,
    HoroscopeModule,
    CompatibilityModule,
    MoodModule,
    AiModule,
    NotificationsModule,
    TarotModule,
    TelegramModule,
  ],
})
export class AppModule {}
