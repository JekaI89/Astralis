import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { TarotService } from './tarot.service'

@ApiTags('Tarot')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('tarot')
export class TarotController {
  constructor(private tarot: TarotService) {}

  @Get('daily')
  @ApiOperation({ summary: 'Карта дня (детерминирована по userId + date)' })
  getDailyCard(
    @Request() req: { user: { id: string } },
    @Query('date') date?: string,
  ) {
    const today = date ?? new Date().toISOString().split('T')[0]!
    return this.tarot.getDailyCard(req.user.id, today)
  }

  @Get('random')
  @ApiOperation({ summary: 'Случайная карта Таро' })
  getRandomCard() {
    return this.tarot.getRandomCard()
  }
}
