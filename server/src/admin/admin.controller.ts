import { type Request } from 'express';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AdminService } from './admin.service';
import { AdminDto } from './dto';
import { AdminUser } from '../generated/prisma/client';
import { AuthGuard, MainAdminGuard } from '../auth/guards';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('admins')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @UseGuards(MainAdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Список администраторов',
    description: 'Доступно только main-администратору',
  })
  @ApiOkResponse({
    description: 'Список администраторов',
    type: [AdminDto],
  })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав (требуется MAIN)' })
  getAllAdmins(): Promise<Omit<AdminUser, 'password' | 'updatedAt'>[]> {
    return this.adminService.getAllAdmins();
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Текущий администратор' })
  @ApiOkResponse({
    description: 'Данные текущего авторизованного администратора',
    type: AdminDto,
  })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  getMe(@Req() req: Request): Promise<AdminDto> {
    return this.adminService.getAdminById(req.admin?.adminId || '');
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Администратор по ID' })
  @ApiParam({ name: 'id', description: 'UUID администратора' })
  @ApiOkResponse({
    description: 'Данные администратора',
    type: AdminDto,
  })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав (требуется MAIN)' })
  @ApiNotFoundResponse({ description: 'Администратор не найден' })
  getAdminById(@Param('id') id: string): Promise<AdminDto> {
    return this.adminService.getAdminById(id);
  }
}
