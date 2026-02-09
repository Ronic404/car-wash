import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'admin@example.com',
    description: 'Email администратора',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6, description: 'Пароль' })
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Иван', description: 'Имя' })
  @MinLength(1)
  firstName: string;

  @ApiPropertyOptional({ example: 'Петров', description: 'Фамилия' })
  @IsOptional()
  @IsString()
  lastName?: string;
}
