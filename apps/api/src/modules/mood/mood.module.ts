import { Module } from '@nestjs/common'
import { MoodController } from './mood.controller'
import { MoodService } from './mood.service'
import { AstroModule } from '../astro/astro.module'
import { NumerologyModule } from '../numerology/numerology.module'

@Module({
  imports: [AstroModule, NumerologyModule],
  controllers: [MoodController],
  providers: [MoodService],
})
export class MoodModule {}
