import {
  ChatBuilder,
  KnownChatType,
  ReplyContent,
  TalkChannel,
  TalkChatData,
} from 'node-kakao';
import { KakaoCommand } from './base.command';

export class CoinFlipCommand extends KakaoCommand {
  constructor() {
    super({
      command: 'flip-coin',
      aliases: ['동전던지기', '동전'],
      helpMessage: '동전 뒤집기 입니다.\n 반반의 확률로 앞면/뒷면이 나옵니다.',
    });
  }

  execute = (data: TalkChatData, channel: TalkChannel) => {
    return channel.sendChat(
      new ChatBuilder()
        .append(new ReplyContent(data.chat))
        .text(Math.round(Math.random()) ? '앞면' : '뒷면')
        .build(KnownChatType.REPLY),
    );
  };
}
