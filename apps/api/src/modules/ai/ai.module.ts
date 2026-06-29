import { Module } from '@nestjs/common'
import { AiController } from './ai.controller'
import { AiService } from './ai.service'
import { AstroModule } from '../astro/astro.module'

@Module({
  imports: [AstroModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
