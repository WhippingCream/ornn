import { Module } from '@nestjs/common';
import { KakaoUserController } from './kakao-users.controller';
import { KakaoUserService } from './kakao-users.service';

@Module({
  controllers: [KakaoUserController],
  providers: [KakaoUserService],
})
export class KakaoUserModule {}
