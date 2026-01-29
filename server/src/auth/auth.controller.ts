import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto, TokenDto } from "./dto";
import { AdminUser } from "../generated/prisma/client";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * Вход администратора
     */
    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() body: LoginDto): Promise<TokenDto> {
        return this.authService.loginAdmin(body);
    }

    /**
     * Регистрация администратора
     */
    @Post('register')
    @HttpCode(HttpStatus.OK)
    register(@Body() body: RegisterDto): Promise<AdminUser> {
        return this.authService.registerAdmin(body);
    }
}   
