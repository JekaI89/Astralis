import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { HoroscopeService } from './horoscope.service'

@ApiTags('Horoscope')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('horoscope')
export class HoroscopeController {
  constructor(private horoscope: HoroscopeService) {}

  @Get('daily')
  @ApiOperation({ summary: 'Персональный прогноз на день (астро + нумеро)' })
  getDaily(
    @Request() req: { user: { id: string } },
    @Query('date') date?: string,
  ) {
    const today = date ?? new Date().toISOString().split('T')[0]!
    return this.horoscope.getDailyForecast(req.user.id, today)
  }
}
