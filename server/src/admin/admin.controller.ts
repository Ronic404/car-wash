import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { LoginDto, TokenDto } from "./dto";

@Controller('admins')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() body: LoginDto): Promise<TokenDto> {
        return this.adminService.loginAdmin(body);
    }
}