import { ConfigModule, ConfigService } from '@nestjs/config';

import { CacheService } from './cache.service';
import { Module } from '@nestjs/common';
import { PartyManagerService } from './party.service';
import { RedisModule } from 'nestjs-redis';

@Module({
  imports: [
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          name: 'cache',
          host: configService.get('REDIS_HOST') || 'localhost',
          port: parseInt(configService.get('REDIS_PORT') || '6379'),
          password: configService.get('REDIS_PASS'),
          db: parseInt(configService.get('REDIS_CACHE_DB') || '10'),
          keyPrefix:
            configService.get('REDIS_CACHE_PREFIX') || 'ORNN_CACHE_DEV',
        },
        {
          name: 'party',
          host: configService.get('REDIS_HOST') || 'localhost',
          port: parseInt(configService.get('REDIS_PORT') || '6379'),
          password: configService.get('REDIS_PASS'),
          db: parseInt(configService.get('REDIS_PARTY_DB') || '9'),
          keyPrefix:
            configService.get('REDIS_PARTY_PREFIX') || 'ORNN_PARTY_DEV',
        },
      ],
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService, PartyManagerService],
  exports: [CacheService, PartyManagerService],
})
export class OrnnRedisModule {}
