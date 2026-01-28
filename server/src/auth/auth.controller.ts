import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto, TokenDto } from "./dto";

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
}