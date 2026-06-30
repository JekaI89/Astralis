import { Body, Controller, Post, Request, UseGuards, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AiService } from './ai.service'
import type { AstroQuestion } from '@astralis/types'

@ApiTags('AI Astrologer')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name)

  constructor(private ai: AiService) {}

  @Post('ask')
  @ApiOperation({ summary: 'Задать вопрос ИИ-астрологу' })
  async ask(
    @Request() req: { user: { id: string } },
    @Body() question: AstroQuestion,
  ) {
    try {
      return await this.ai.askAstrologer(req.user.id, question)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Ошибка ИИ-астролога'
      this.logger.error(`AI ask failed: ${message}`)
      throw new HttpException(message, HttpStatus.BAD_GATEWAY)
    }
  }
}
