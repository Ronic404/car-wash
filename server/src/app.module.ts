import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';

import { loggerConfig } from './logger';
import { AdminModule } from './admin';
import { PrismaModule } from './prisma';
import { AuthModule } from './auth';

@Module({
  imports: [
    WinstonModule.forRoot(loggerConfig),
    AdminModule,
    AuthModule,
    PrismaModule,
  ],
})
export class AppModule {}
