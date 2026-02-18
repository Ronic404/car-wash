import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonLogger } from 'nest-winston';

import { JwtDto } from './dto';

@Injectable()
export class JwtService {
  private readonly jwtSecret: string;

  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: WinstonLogger,
    private readonly configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.getOrThrow<string>('JWT_SECRET');
  }

  /*
   * Генерируем JWT токен
   */
  generateToken(adminId: string, email: string): string {
    if (!this.jwtSecret) {
      this.logger.warn('JWT_SECRET не установлен');
      throw new InternalServerErrorException('JWT_SECRET не установлен');
    }

    const token = jwt.sign(
      {
        adminId,
        email,
      },
      this.jwtSecret,
      {
        expiresIn: '7d',
      },
    );

    return token;
  }

  /*
   * Парсим JWT токен
   */
  parseToken(token: string): JwtDto {
    if (!this.jwtSecret) {
      this.logger.warn('JWT_SECRET не установлен в переменных окружения');
      throw new InternalServerErrorException('Ошибка конфигурации сервера');
    }

    const decoded = jwt.verify(token, this.jwtSecret) as JwtDto;
    return decoded;
  }
}
