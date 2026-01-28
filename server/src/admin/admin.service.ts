import { Inject, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Logger } from "winston";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";

import { LoginDto, TokenDto } from "./dto";
import { PrismaService } from "../prisma";

@Injectable()
export class AdminService {
    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
        private readonly prisma: PrismaService,
    ) { }

    /**
     * Вход администратора
     */
    async loginAdmin({ email, password }: LoginDto): Promise<TokenDto> {
        const admin = await this.prisma.adminUser.findUnique({
            where: { email },
        })

        if (!admin) {
            this.logger.warn('Неверный email или пароль');
            throw new UnauthorizedException('Неверный email или пароль');
        }

        if (!admin.isActive) {
            this.logger.warn('Аккаунт ожидает подтверждения main-администратором');
            throw new UnauthorizedException('Аккаунт ожидает подтверждения main-администратором');
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

        // Генерируем JWT токен
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            this.logger.warn('JWT_SECRET не установлен');
            throw new InternalServerErrorException('JWT_SECRET не установлен');
        }

        const token = jwt.sign(
            {
                adminId: admin.id,
                email: admin.email,
            },
            secret,
            {
                expiresIn: '7d',
            }
        );

        this.logger.log('Администратор вошел в систему', { adminId: admin.id });
        
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