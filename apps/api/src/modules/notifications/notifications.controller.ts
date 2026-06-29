import { Body, Controller, Get, Patch, Request, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { NotificationsService } from './notifications.service'
import type { NotificationPreferences } from '@astralis/types'

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationsController {
  constructor(private notifications: NotificationsService) {}

  @Get('preferences')
  @ApiOperation({ summary: 'Настройки уведомлений' })
  getPreferences(@Request() req: { user: { id: string } }) {
    return this.notifications.getPreferences(req.user.id)
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Обновить настройки уведомлений' })
  updatePreferences(
    @Request() req: { user: { id: string } },
    @Body() prefs: Partial<NotificationPreferences>,
  ) {
    return this.notifications.updatePreferences(req.user.id, prefs)
  }
}
