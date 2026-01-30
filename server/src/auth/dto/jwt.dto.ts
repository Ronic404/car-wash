import { IsEmail, IsUUID } from 'class-validator';

export class JwtDto {
  @IsUUID(4)
  adminId: string;

  @IsEmail()
  email: string;
}
