import { Module } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { NotificationsController } from './notifications.controller'
import { PushService } from './push.service'
import { SchedulerService } from './scheduler.service'
import { HoroscopeModule } from '../horoscope/horoscope.module'

@Module({
  imports: [HoroscopeModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, PushService, SchedulerService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
