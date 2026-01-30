import { type Request } from "express";
import { Controller, Get, HttpCode, HttpStatus, Param, Req, UseGuards } from "@nestjs/common";

import { AdminService } from "./admin.service";
import { AdminDto } from "./dto";
import { AdminUser } from "../generated/prisma/client";
import { AuthGuard } from "../auth/guards";

@UseGuards(AuthGuard)
@Controller('admins')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    /**
     * Получение списка администраторов (только main)
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    getAllAdmins(): Promise<Omit<AdminUser, "password" | "updatedAt">[]> {
        return this.adminService.getAllAdmins();
    }

    /**
     * Получение информации о текущем администраторе
     */
    @Get('me')
    @HttpCode(HttpStatus.OK)
    getMe(@Req() req: Request): Promise<AdminDto> {
        return this.adminService.getAdminById(req.admin?.adminId || '');
    }

    /**
     * Получение администратора по ID
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    getAdminById(@Param('id') id: string): Promise<AdminDto> {
        return this.adminService.getAdminById(id);
    }
}