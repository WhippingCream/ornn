import { Module } from '@nestjs/common';
import { KakaoCredentialService } from '../credentials/credentials.service';
import { KakaoAuthController } from './auth.controller';
import { KakaoAuthService } from './auth.service';

@Module({
  controllers: [KakaoAuthController],
  providers: [KakaoAuthService, KakaoCredentialService],
})
export class KakaoAuthModule {}
