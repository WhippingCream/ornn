import { Injectable } from '@nestjs/common';
import { AuthApiClient } from 'node-kakao';

@Injectable()
export class KakaoAuthService {
  client: AuthApiClient;
}
