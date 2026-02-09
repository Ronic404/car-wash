import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TokenDto {
  @ApiProperty({ description: 'JWT токен для авторизации' })
  @IsString()
  token: string;
}
