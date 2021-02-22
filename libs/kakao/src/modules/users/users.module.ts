import { Module } from '@nestjs/common';
import { KakaoUserController } from './users.controller';
import { KakaoUserService } from './users.service';

@Module({
  controllers: [KakaoUserController],
  providers: [KakaoUserService],
})
export class KakaoUserModule {}
