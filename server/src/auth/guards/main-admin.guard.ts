import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonLogger } from 'nest-winston';

import { PrismaService } from '../../prisma';

/**
 * Guard для проверки прав main-администратора
 */
@Injectable()
export class MainAdminGuard implements CanActivate {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: WinstonLogger,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    if (!request.admin?.adminId) {
      throw new UnauthorizedException('Не авторизован');
    }

    const admin = await this.prisma.adminUser.findUnique({
      where: { id: request.admin.adminId },
      select: { id: true, isActive: true, role: true },
    });

    if (!admin || !admin.isActive) {
      this.logger.warn(
        `Попытка доступа неактивного администратора: ${request.admin.adminId}`,
      );
      throw new UnauthorizedException('Не авторизован');
    }

    if (admin.role !== 'MAIN') {
      this.logger.warn(
        `Недостаточно прав: ${request.admin.adminId}, роль: ${admin.role}`,
      );
      throw new ForbiddenException('Недостаточно прав');
    }

    return true;
  }
}
