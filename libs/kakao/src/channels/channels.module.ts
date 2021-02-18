import { Module } from '@nestjs/common';
import { KakaoChannelController } from './channels.controller';
import { KakaoChannelService } from './channels.service';

@Module({
  controllers: [KakaoChannelController],
  providers: [KakaoChannelService],
})
export class KakaoChannelModule {}
