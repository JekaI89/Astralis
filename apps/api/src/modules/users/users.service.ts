import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

export interface UpdateProfileDto {
  name?: string
  birthDate?: string
  birthTime?: string
  birthPlace?: string
  birthLat?: number
  birthLng?: number
  timezone?: string
  language?: 'ru' | 'en'
}

export interface CreateContactDto {
  name: string
  birthDate: string
  birthTime?: string
  birthPlace?: string
  birthLat?: number
  birthLng?: number
  relation?: string
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { numerologyProfile: true },
    })
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...dto,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        // При обновлении даты рождения сбрасываем кэшированные карты
        natalChart: dto.birthDate ? { delete: true } : undefined,
        numerologyProfile: dto.birthDate ? { delete: true } : undefined,
      },
    })
  }

  async getContacts(userId: string) {
    return this.prisma.contact.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async createContact(userId: string, dto: CreateContactDto) {
    return this.prisma.contact.create({
      data: {
        ownerId: userId,
        name: dto.name,
        birthDate: new Date(dto.birthDate),
        birthTime: dto.birthTime,
        birthPlace: dto.birthPlace,
        birthLat: dto.birthLat,
        birthLng: dto.birthLng,
        relation: dto.relation ?? 'other',
      },
    })
  }

  async deleteContact(userId: string, contactId: string) {
    return this.prisma.contact.deleteMany({
      where: { id: contactId, ownerId: userId },
    })
  }
}
