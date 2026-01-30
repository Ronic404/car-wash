import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonLogger } from 'nest-winston';

import { LoginDto, RegisterDto, TokenDto } from './dto';
import { PrismaService } from '../prisma';
import { JwtService } from './jwt.service';
import { AdminUser } from '../generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: WinstonLogger,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  /**
   * Публичная регистрация администратора (создаёт заявку).
   * - если админов ещё нет (первый запуск) — создаём MAIN + активный (bootstrap)
   * - иначе создаём REGULAR + неактивный (ожидает подтверждения main-админом)
   */
  async registerAdmin(data: RegisterDto): Promise<AdminUser> {
    const { email, password, firstName, lastName } = data;

    // Проверяем, существует ли уже администратор с таким email
    const existingAdmin = await this.prisma.adminUser.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      this.logger.warn('Администратор с таким email уже существует');
      throw new ConflictException('Администратор с таким email уже существует');
    }

    const adminsCount = await this.prisma.adminUser.count();
    const isFirstAdmin = adminsCount === 0;

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await this.prisma.adminUser.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: isFirstAdmin ? 'MAIN' : 'REGULAR',
        isActive: isFirstAdmin ? true : false,
      },
    });

    this.logger.log(`Создан новый администратор ${admin.id}`);
    return admin;
  }

  /**
   * Вход администратора
   */
  async loginAdmin({ email, password }: LoginDto): Promise<TokenDto> {
    const admin = await this.prisma.adminUser.findUnique({
      where: { email },
    });

    if (!admin) {
      this.logger.warn('Неверный email или пароль');
      throw new UnauthorizedException('Неверный email или пароль');
    }

    if (!admin.isActive) {
      this.logger.warn('Аккаунт ожидает подтверждения main-администратором');
      throw new UnauthorizedException(
        'Аккаунт ожидает подтверждения main-администратором',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      this.logger.warn('Неверный email или пароль');
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // Обновляем время последнего входа
    await this.prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });

    const token = this.jwtService.generateToken(admin.id, admin.email);

    this.logger.log(`Администратор ${admin.id} вошел в систему`);

    return { token };
    // return {
    //     token,
    //     admin: {
    //         id: admin.id,
    //         email: admin.email,
    //         firstName: admin.firstName,
    //         lastName: admin.lastName,
    //         role: admin.role,
    //     },
    // };
  }
}
