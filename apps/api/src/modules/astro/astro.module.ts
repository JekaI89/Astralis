import { Module } from '@nestjs/common'
import { AstroController } from './astro.controller'
import { AstroService } from './astro.service'
import { EphemerisService } from './ephemeris.service'

@Module({
  controllers: [AstroController],
  providers: [AstroService, EphemerisService],
  exports: [AstroService],
})
export class AstroModule {}
