import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminDto, LoginDto, TokenDto } from "./dto";

@Controller('admins')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    /**
     * Получение администратора по ID
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    getAdminById(@Param('id') id: string): Promise<AdminDto> {
        return this.adminService.getAdminById(id);
    }

    /**
     * Получение информации о текущем администраторе
     */
    @Get('me/:token')
    @HttpCode(HttpStatus.OK)
    getMe(@Param('token') token: string): Promise<AdminDto> {
        return this.adminService.getMe(token);
    }

    /**
     * Вход администратора
     */
    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() body: LoginDto): Promise<TokenDto> {
        return this.adminService.loginAdmin(body);
    }
}