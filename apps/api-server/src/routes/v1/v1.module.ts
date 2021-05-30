import { Module } from '@nestjs/common';
import { KakaoModule } from '@lib/kakao';

import { V1Controller } from './v1.controller';
import { V1Service } from './v1.service';
import { AuthModule } from '@lib/auth';

@Module({
  imports: [KakaoModule, AuthModule],
  controllers: [V1Controller],
  providers: [V1Service],
})
export class V1Module {}
