import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthModule } from '../auth';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [AuthModule],
})
export class AdminModule {}
