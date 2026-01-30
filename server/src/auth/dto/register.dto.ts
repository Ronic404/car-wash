import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @MinLength(1)
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;
}
