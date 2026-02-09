import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { AdminRole } from '../../generated/prisma/client';

export class AdminDto {
  @ApiProperty({ description: 'ID администратора' })
  @IsUUID(4)
  id: string;

  @ApiProperty({ description: 'Email' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Имя' })
  @IsString()
  firstName: string;

  @ApiPropertyOptional({ description: 'Фамилия', type: String, nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string | null;

  @ApiProperty({ description: 'Активен' })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ enum: AdminRole, description: 'Роль' })
  @IsEnum(AdminRole)
  role: AdminRole;

  @ApiProperty({ description: 'Дата создания' })
  @IsDate()
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Последний вход',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  @IsOptional()
  @IsDate()
  lastLogin?: Date | null;
}
