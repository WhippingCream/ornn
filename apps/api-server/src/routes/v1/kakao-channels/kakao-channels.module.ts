import { Module } from '@nestjs/common';
import { KakaoChannelController } from './kakao-channels.controller';
import { KakaoChannelService } from './kakao-channels.service';

@Module({
  controllers: [KakaoChannelController],
  providers: [KakaoChannelService],
})
export class KakaoChannelModule {}
