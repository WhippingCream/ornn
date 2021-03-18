import { Module } from '@nestjs/common';
import { KakaoCredentialService } from '../credentials/credentials.service';
import { KakaoTalkController } from './talk.controller';
import { KakaoTalkService } from './talk.service';

@Module({
  controllers: [KakaoTalkController],
  providers: [KakaoTalkService, KakaoCredentialService],
})
export class KakaoTalkModule {}
