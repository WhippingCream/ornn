import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { KakaoCredentialService } from '../credentials/credentials.service';
import { KakaoTalkController } from './talk.controller';
import { KakaoTalkService } from './talk.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [KakaoTalkController],
  providers: [KakaoTalkService, KakaoCredentialService],
})
export class KakaoTalkModule {}
