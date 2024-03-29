import { ConfigModule, ConfigService } from '@nestjs/config';

import { CacheService } from './cache.service';
import { Module } from '@nestjs/common';
import { RedisModule } from 'nestjs-redis';

@Module({
  imports: [
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        host: configService.get('REDIS_HOST') || 'localhost',
        port: parseInt(configService.get('REDIS_PORT') || '6379'),
        password: configService.get('REDIS_PASS'),
        db: parseInt(configService.get('REDIS_CACHE_DB') || '10'),
        keyPrefix: configService.get('REDIS_CACHE_PREFIX') || 'ORNN_CACHE_DEV',
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class OrnnRedisModule {}
