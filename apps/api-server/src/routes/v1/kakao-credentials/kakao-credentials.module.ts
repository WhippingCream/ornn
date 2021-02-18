import { Module } from '@nestjs/common';
import { KakaotalkBotService } from 'libs/kakaotalk-bot/src';
import { KakaoCredentialController } from './kakao-credentials.controller';
import { KakaoCredentialService } from './kakao-credentials.service';

@Module({
  controllers: [KakaoCredentialController],
  providers: [KakaoCredentialService, KakaotalkBotService],
})
export class KakaoCredentialModule {}
