import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { UsersService, UpdateProfileDto, CreateContactDto } from './users.service'

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Профиль текущего пользователя' })
  getProfile(@Request() req: { user: { id: string } }) {
    return this.users.getProfile(req.user.id)
  }

  @Patch('me')
  @ApiOperation({ summary: 'Обновить профиль (дата рождения, геолокация)' })
  updateProfile(
    @Request() req: { user: { id: string } },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.users.updateProfile(req.user.id, dto)
  }

  @Get('contacts')
  @ApiOperation({ summary: 'Книга друзей (картотека натальных карт)' })
  getContacts(@Request() req: { user: { id: string } }) {
    return this.users.getContacts(req.user.id)
  }

  @Post('contacts')
  @ApiOperation({ summary: 'Добавить контакт' })
  createContact(
    @Request() req: { user: { id: string } },
    @Body() dto: CreateContactDto,
  ) {
    return this.users.createContact(req.user.id, dto)
  }

  @Delete('contacts/:id')
  @ApiOperation({ summary: 'Удалить контакт' })
  deleteContact(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.users.deleteContact(req.user.id, id)
  }
}
