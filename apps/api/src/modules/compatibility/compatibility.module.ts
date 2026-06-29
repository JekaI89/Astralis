import { Module } from '@nestjs/common'
import { CompatibilityController } from './compatibility.controller'
import { CompatibilityService } from './compatibility.service'
import { AstroModule } from '../astro/astro.module'
import { NumerologyModule } from '../numerology/numerology.module'

@Module({
  imports: [AstroModule, NumerologyModule],
  controllers: [CompatibilityController],
  providers: [CompatibilityService],
})
export class CompatibilityModule {}
