import { Module } from "@nestjs/common";

import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtService } from "./jwt.service";

@Module({
    controllers: [AuthController],
    providers: [AuthService, JwtService],
    exports: [JwtService],
})
export class AuthModule {}