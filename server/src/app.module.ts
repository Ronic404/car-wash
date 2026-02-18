import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';

import { envValidationSchema } from './config';
import { loggerConfig } from './logger';
import { AdminModule } from './admin';
import { PrismaModule } from './prisma';
import { AuthModule } from './auth';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    WinstonModule.forRoot(loggerConfig),
    PrismaModule,
    AuthModule,
    AdminModule,
  ],
})
export class AppModule {}
