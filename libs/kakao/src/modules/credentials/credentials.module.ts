import { Module } from '@nestjs/common';
import { KakaoCredentialController } from './credentials.controller';
import { KakaoCredentialService } from './credentials.service';

@Module({
  controllers: [KakaoCredentialController],
  providers: [KakaoCredentialService],
})
export class KakaoCredentialModule {}
