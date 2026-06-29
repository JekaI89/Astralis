import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { MoodService } from './mood.service'
import type { MoodValue, MoodEmoji } from '@astralis/types'

@ApiTags('Mood Tracker')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('mood')
export class MoodController {
  constructor(private mood: MoodService) {}

  @Post('log')
  @ApiOperation({ summary: 'Записать настроение дня' })
  logMood(
    @Request() req: { user: { id: string } },
    @Body() body: { date?: string; mood: MoodValue; emoji: MoodEmoji; note?: string },
  ) {
    const date = body.date ?? new Date().toISOString().split('T')[0]!
    return this.mood.logMood(req.user.id, date, body.mood, body.emoji, body.note)
  }

  @Get('month')
  @ApiOperation({ summary: 'Записи настроения за месяц' })
  getMonth(
    @Request() req: { user: { id: string } },
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    const now = new Date()
    return this.mood.getMonthEntries(
      req.user.id,
      Number(year ?? now.getFullYear()),
      Number(month ?? now.getMonth() + 1),
    )
  }

  @Get('insights')
  @ApiOperation({ summary: 'Инсайты: настроение vs лунные транзиты' })
  getInsights(@Request() req: { user: { id: string } }) {
    return this.mood.getInsights(req.user.id)
  }
}
