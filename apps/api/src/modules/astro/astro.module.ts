import { Module } from '@nestjs/common'
import { AstroController } from './astro.controller'
import { AstroService } from './astro.service'
import { SwissEphemerisService } from './swiss-ephemeris.service'

@Module({
  controllers: [AstroController],
  providers: [AstroService, SwissEphemerisService],
  exports: [AstroService],
})
export class AstroModule {}
