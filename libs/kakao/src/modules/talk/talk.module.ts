import { ConfigModule } from '@nestjs/config';
import { KakaoCredentialService } from '../credentials/credentials.service';
import { KakaoTalkAlertService } from './talk-alert.service';
import { KakaoTalkCommandModule } from './commands/commands.module';
import { KakaoTalkController } from './talk.controller';
import { KakaoTalkService } from './talk.service';
import { Module } from '@nestjs/common';
import { OrnnRedisModule } from '@lib/redis';
import { ScheduleModule } from '@nestjs/schedule';
import { WebhookModule } from '@lib/utils/webhook/webhook.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: [`.envs/${process.env.NODE_ENV || 'development'}.env`],
    }),
    WebhookModule,
    OrnnRedisModule,
    KakaoTalkCommandModule,
  ],
  controllers: [KakaoTalkController],
  providers: [KakaoTalkService, KakaoCredentialService, KakaoTalkAlertService],
})
export class KakaoTalkModule {}
