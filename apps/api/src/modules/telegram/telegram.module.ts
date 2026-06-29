import { Module } from '@nestjs/common'
import { TelegramService } from './telegram.service'
import { TelegramController } from './telegram.controller'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AuthModule],
  controllers: [TelegramController],
  providers: [TelegramService],
})
export class TelegramModule {}
