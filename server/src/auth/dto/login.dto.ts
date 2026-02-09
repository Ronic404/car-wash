import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'ronic@inbox.ru',
    description: 'Email администратора',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Metall404', minLength: 6, description: 'Пароль' })
  @MinLength(6)
  password: string;
}
