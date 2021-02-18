import { Injectable } from '@nestjs/common';
import { AuthClient, TalkClient } from 'node-kakao';

@Injectable()
export class KakaotalkBotService {
  talkClient: TalkClient;
  authClient: AuthClient;
}
