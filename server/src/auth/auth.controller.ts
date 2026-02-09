import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RegisterResponseDto, TokenDto } from './dto';
import { AdminUser } from '../generated/prisma/client';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход администратора' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Успешный вход',
    type: TokenDto,
  })
  @ApiUnauthorizedResponse({
    description:
      'Неверный email или пароль; либо аккаунт ожидает подтверждения main-администратором',
  })
  login(@Body() body: LoginDto): Promise<TokenDto> {
    return this.authService.loginAdmin(body);
  }

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Регистрация администратора',
    description:
      'Создаёт администратора со статусом "ожидает подтверждения" (isActive=false, role=REGULAR). Исключение: если это первый администратор в системе, он создаётся как MAIN и активный.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({
    description: 'Администратор создан',
    type: RegisterResponseDto,
  })
  @ApiConflictResponse({
    description: 'Администратор с таким email уже существует',
  })
  @ApiBadRequestResponse({
    description: 'Ошибка валидации (email, пароль, имя и т.д.)',
  })
  register(@Body() body: RegisterDto): Promise<AdminUser> {
    return this.authService.registerAdmin(body);
  }
}
