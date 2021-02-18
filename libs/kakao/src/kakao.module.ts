import { Module } from '@nestjs/common';
import { KakaoAuthModule } from './auth/auth.module';
import { KakaoChannelModule } from './channels/channels.module';
import { KakaoCredentialModule } from './credentials/credentials.module';
import { KakaoTalkModule } from './talk/talk.module';
import { KakaoUserModule } from './users/users.module';

@Module({
  imports: [
    KakaoAuthModule,
    KakaoTalkModule,
    KakaoCredentialModule,
    KakaoChannelModule,
    KakaoUserModule,
  ],
})
export class KakaoModule {}
