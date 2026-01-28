import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Logger } from "winston";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";

import { AdminDto } from "./dto";
import { PrismaService } from "../prisma";
import { JwtService } from "../auth";

@Injectable()
export class AdminService {
    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

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

    /**
     * Получение информации о текущем администраторе
     */
    async getMe(token: string): Promise<AdminDto> {
        const decoded = this.jwtService.parseToken(token);
        return this.getAdminById(decoded.adminId);
    }
}