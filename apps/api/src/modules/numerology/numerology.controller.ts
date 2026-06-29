import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { NumerologyService } from './numerology.service'

@ApiTags('Numerology')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('numerology')
export class NumerologyController {
  constructor(private numerology: NumerologyService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Нумерологическая карта пользователя' })
  getProfile(@Request() req: { user: { id: string } }) {
    return this.numerology.getProfile(req.user.id)
  }

  @Get('cycle')
  @ApiOperation({ summary: 'Личные циклы на указанную дату' })
  getCycle(
    @Request() req: { user: { id: string } },
    @Query('date') date?: string,
  ) {
    const today = date ?? new Date().toISOString().split('T')[0]!
    return this.numerology.getPersonalCycle(req.user.id, today)
  }

  @Post('analyze')
  @ApiOperation({ summary: 'Анализ произвольного числа (номер машины, квартиры, телефона)' })
  analyzeNumber(@Body() body: { input: string }) {
    return this.numerology.analyzeNumber(body.input)
  }

  @Get('angel')
  @ApiOperation({ summary: 'Расшифровка ангельского числа (11:11, 22:22...)' })
  getAngelNumber(@Query('pattern') pattern: string) {
    return this.numerology.getAngelNumber(pattern)
  }
}
