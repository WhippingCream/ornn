import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { KakaoCredentialService } from '../credentials/credentials.service';
import { KakaoTalkController } from './talk.controller';
import { KakaoTalkService } from './talk.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: [`.envs/${process.env.NODE_ENV || 'development'}.env`],
    }),
  ],
  controllers: [KakaoTalkController],
  providers: [KakaoTalkService, KakaoCredentialService],
})
export class KakaoTalkModule {}
