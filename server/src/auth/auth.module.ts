import { Module } from "@nestjs/common";

import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtService } from "./jwt.service";
import { AuthGuard } from "./guards";

@Module({
    controllers: [AuthController],
    providers: [AuthService, JwtService, AuthGuard],
    exports: [JwtService, AuthGuard],
})
export class AuthModule {}