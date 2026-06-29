import { Module } from '@nestjs/common'
import { HoroscopeController } from './horoscope.controller'
import { HoroscopeService } from './horoscope.service'
import { AstroModule } from '../astro/astro.module'
import { NumerologyModule } from '../numerology/numerology.module'

@Module({
  imports: [AstroModule, NumerologyModule],
  controllers: [HoroscopeController],
  providers: [HoroscopeService],
  exports: [HoroscopeService],
})
export class HoroscopeModule {}
