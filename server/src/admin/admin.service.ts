import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonLogger } from 'nest-winston';

import { AdminDto } from './dto';
import { PrismaService } from '../prisma';
import { AdminUser } from '../generated/prisma/client';

@Injectable()
export class AdminService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: WinstonLogger,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Получение всех администраторов
   */
  async getAllAdmins(): Promise<Omit<AdminUser, 'password' | 'updatedAt'>[]> {
    const admins = await this.prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        role: true,
        createdAt: true,
        lastLogin: true,
        password: false,
        updatedAt: false,
      },
      orderBy: [{ createdAt: 'desc' }],
    });
    return admins;
  }

  /**
   * Получение администратора по ID
   */
  async getAdminById(id: string): Promise<AdminDto> {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id },
    });

    if (!admin) {
      this.logger.warn('Администратор не найден');
      throw new NotFoundException('Администратор не найден');
    }

    return {
      id: admin.id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      isActive: admin.isActive,
      role: admin.role,
      createdAt: admin.createdAt,
      lastLogin: admin.lastLogin,
    };
  }
}
