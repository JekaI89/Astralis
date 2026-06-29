import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AiService } from './ai.service'
import type { AstroQuestion } from '@astralis/types'

@ApiTags('AI Astrologer')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('ai')
export class AiController {
  constructor(private ai: AiService) {}

  @Post('ask')
  @ApiOperation({ summary: 'Задать вопрос ИИ-астрологу' })
  ask(
    @Request() req: { user: { id: string } },
    @Body() question: AstroQuestion,
  ) {
    return this.ai.askAstrologer(req.user.id, question)
  }
}
