import { Injectable } from '@nestjs/common';
import { AuthClient } from 'node-kakao';

@Injectable()
export class KakaoAuthService {
  client: AuthClient;
}
