import { Module } from '@nestjs/common';
import { KakaoChannelModule } from './kakao-channels/kakao-channels.module';
import { KakaoCredentialModule } from './kakao-credentials/kakao-credentials.module';
import { KakaoUserModule } from './kakao-users/kakao-users.module';
import { V1Controller } from './v1.controller';
import { V1Service } from './v1.service';

@Module({
  imports: [KakaoChannelModule, KakaoUserModule, KakaoCredentialModule],
  controllers: [V1Controller],
  providers: [V1Service],
})
export class V1Module {}
