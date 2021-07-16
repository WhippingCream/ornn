import { ConfigModule } from '@nestjs/config';
import { KakaoCredentialService } from '../credentials/credentials.service';
import { KakaoTalkController } from './talk.controller';
import { KakaoTalkService } from './talk.service';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { WebhookModule } from '@lib/utils/webhook/webhook.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: [`.envs/${process.env.NODE_ENV || 'development'}.env`],
    }),
    WebhookModule,
  ],
  controllers: [KakaoTalkController],
  providers: [KakaoTalkService, KakaoCredentialService],
})
export class KakaoTalkModule {}
