import { IsBoolean, IsDate, IsEmail, IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { AdminRole } from "../../generated/prisma/enums";

export class AdminDto {
    @IsUUID(4)
    id: string;

    @IsEmail()
    email: string;

    @IsString()
    firstName: string;

    @IsOptional()
    @IsString()
    lastName: string | null;

    @IsBoolean()
    isActive: boolean;

    @IsEnum(AdminRole)
    role: AdminRole;

    @IsDate()
    createdAt: Date;

    @IsOptional()
    @IsDate()
    lastLogin: Date | null;
}
