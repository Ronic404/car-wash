import { Module } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtService } from './jwt.service';
import { AuthGuard, MainAdminGuard } from './guards';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtService, AuthGuard, MainAdminGuard],
  exports: [JwtService, AuthGuard, MainAdminGuard],
})
export class AuthModule {}
