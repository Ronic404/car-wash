import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import jwt from "jsonwebtoken";
import { Logger } from "winston";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";

import { JwtDto } from "./dto";

@Injectable()
export class JwtService {
    constructor(@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger) { }

    /*
     * Генерируем JWT токен
     */
    generateToken(adminId: string, email: string): string {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            this.logger.warn('JWT_SECRET не установлен');
            throw new InternalServerErrorException('JWT_SECRET не установлен');
        }

        const token = jwt.sign(
            {
                adminId,
                email,
            },
            secret,
            {
                expiresIn: '7d',
            }
        );

        return token;
    }

    /*
     * Парсим JWT токен
     */
    parseToken(token: string): JwtDto {
        const JWT_SECRET = process.env.JWT_SECRET;

        if (!JWT_SECRET) {
            this.logger.warn('JWT_SECRET не установлен в переменных окружения');
            throw new InternalServerErrorException('Ошибка конфигурации сервера');
        }

        const decoded = jwt.verify(token, JWT_SECRET) as JwtDto;
        return decoded;
    }
}