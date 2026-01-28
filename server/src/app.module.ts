import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';

import { loggerConfig } from './logger';
import { AdminModule } from './admin';
import { PrismaModule } from './prisma';

@Module({
  imports: [
    WinstonModule.forRoot(loggerConfig),
    AdminModule,
    PrismaModule,
  ],
})
export class AppModule {}
