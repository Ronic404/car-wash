import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonLogger } from 'nest-winston';

import { JwtService } from '../jwt.service';

/**
 * Guard для проверки JWT токена администратора
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: WinstonLogger,
    private readonly jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.warn(`Токен не предоставлен: ${request.path}`);
      throw new UnauthorizedException('Токен не предоставлен');
    }

    const token = authHeader.substring(7);

    try {
      const decoded = this.jwtService.parseToken(token);
      request.admin = {
        adminId: decoded.adminId,
        email: decoded.email,
      };
      return true;
    } catch (error) {
      this.logger.warn(
        `Ошибка аутентификации: ${error} (path: ${request.path})`,
      );
      throw new UnauthorizedException('Недействительный токен');
    }
  }
}
