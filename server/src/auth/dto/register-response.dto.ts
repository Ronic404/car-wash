import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AdminRole } from '../../generated/prisma/client';

export class RegisterResponseDto {
  @ApiProperty({ description: 'ID администратора' })
  id: string;

  @ApiProperty({ description: 'Email' })
  email: string;

  @ApiProperty({ description: 'Имя' })
  firstName: string;

  @ApiPropertyOptional({ description: 'Фамилия' })
  lastName?: string;

  @ApiProperty({ description: 'Активен (подтверждён main-админом)' })
  isActive: boolean;

  @ApiProperty({ enum: AdminRole, description: 'Роль' })
  role: AdminRole;

  @ApiProperty({ description: 'Дата создания' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Последний вход' })
  lastLogin?: Date;
}
