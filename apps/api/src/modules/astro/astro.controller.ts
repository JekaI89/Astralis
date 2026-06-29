import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AstroService } from './astro.service'

@ApiTags('Astrology')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('astro')
export class AstroController {
  constructor(private astro: AstroService) {}

  @Get('natal-chart')
  @ApiOperation({ summary: 'Натальная карта текущего пользователя' })
  getNatalChart(@Request() req: { user: { id: string } }) {
    return this.astro.getNatalChart(req.user.id)
  }

  @Get('transits')
  @ApiOperation({ summary: 'Текущие транзиты планет к натальной карте' })
  getTransits(
    @Request() req: { user: { id: string } },
    @Query('date') date?: string,
  ) {
    const today = date ?? new Date().toISOString().split('T')[0]!
    return this.astro.getCurrentTransits(req.user.id, today)
  }

  @Get('lunar-day')
  @ApiOperation({ summary: 'Лунный день' })
  getLunarDay(@Query('date') date?: string) {
    const today = date ?? new Date().toISOString().split('T')[0]!
    return this.astro.getLunarDay(today)
  }

  @Get('lunar-calendar')
  @ApiOperation({ summary: 'Лунный календарь на месяц' })
  getLunarCalendar(
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    const now = new Date()
    return this.astro.getLunarCalendar(
      Number(year ?? now.getFullYear()),
      Number(month ?? now.getMonth() + 1),
    )
  }
}
