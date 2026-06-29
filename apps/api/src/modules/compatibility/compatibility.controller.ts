import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CompatibilityService } from './compatibility.service'

@ApiTags('Compatibility')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('compatibility')
export class CompatibilityController {
  constructor(private compatibility: CompatibilityService) {}

  @Get(':contactId')
  @ApiOperation({ summary: 'Синастрия + нумерологическая совместимость с контактом' })
  getCompatibility(
    @Request() req: { user: { id: string } },
    @Param('contactId') contactId: string,
  ) {
    return this.compatibility.getCompatibility(req.user.id, contactId)
  }
}
