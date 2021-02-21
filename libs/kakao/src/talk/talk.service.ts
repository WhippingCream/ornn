import { Injectable } from '@nestjs/common';
import { TalkClient } from 'node-kakao';

@Injectable()
export class KakaoTalkService {
  constructor() {
    this.client = new TalkClient();
  }
  client: TalkClient;
}
