import { ConfigModule, ConfigService } from '@nestjs/config';

import { Module } from '@nestjs/common';
import { PartyManagerService } from './party-manager.service';
import { PartyRepositoryService } from './party-repository.service';
import { RedisModule } from 'nestjs-redis';

@Module({
  imports: [
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        host: configService.get('REDIS_HOST') || 'localhost',
        port: parseInt(configService.get('REDIS_PORT') || '6379'),
        password: configService.get('REDIS_PASS'),
        db: parseInt(configService.get('REDIS_PARTY_DB') || '9'),
        keyPrefix: configService.get('REDIS_PARTY_PREFIX') || 'ORNN_PARTY_DEV@',
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  providers: [PartyManagerService, PartyRepositoryService],
  exports: [PartyManagerService],
})
export class PartyModule {}
