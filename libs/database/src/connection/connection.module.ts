import { ConfigModule, ConfigService } from '@nestjs/config';

import { CONNECTION } from '../constants/connection';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from '../entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      name: CONNECTION.DEFAULT_NAME,
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host:
          configService.get(`DATABASE_${CONNECTION.DEFAULT_NAME}_HOST`) ||
          'localhost',
        port: parseInt(
          configService.get(`DATABASE_${CONNECTION.DEFAULT_NAME}_PORT`) ||
            '3306',
          10,
        ),
        username:
          configService.get(`DATABASE_${CONNECTION.DEFAULT_NAME}_USER`) ||
          'root',
        password:
          configService.get(`DATABASE_${CONNECTION.DEFAULT_NAME}_PASS`) ||
          'pass',
        database: configService.get(`DATABASE_${CONNECTION.DEFAULT_NAME}_NAME`),
        synchronize: true,
        timezone: 'Z',
        logging:
          configService.get(`DATABASE_${CONNECTION.DEFAULT_NAME}_LOGGING`) ===
          '1',
        extra: {
          charset: 'utf8mb4_unicode_ci',
        },
        entities,
      }),
    }),
  ],
})
export class ConnectionModule {}
