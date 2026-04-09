import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { LoggerModule } from 'nestjs-pino'

import { validateEnv } from './config/env.schema'
import { AuthModule } from './auth/auth.module'
import { HealthController } from './health/health.controller'
import { PrismaModule } from './prisma/prisma.module'
import { UsersModule } from './users/users.module'
import { UploadModule } from './upload/upload.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV === 'development'
            ? {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                  colorize: true,
                  translateTime: 'SYS:standard',
                },
              }
            : undefined,
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    UploadModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
