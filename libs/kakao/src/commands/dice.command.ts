import {
  ChatBuilder,
  KnownChatType,
  ReplyContent,
  TalkChannel,
  TalkChatData,
} from 'node-kakao';
import { KakaoCommand } from './base.command';

export class DiceCommand extends KakaoCommand {
  constructor() {
    super({
      command: 'dice',
      aliases: ['주사위'],
      helpMessage: [
        '!주사위',
        ' - 1부터 6 중 하나의 숫자가 나옵니다.',
        '!주사위 N',
        ' - N: 1보다 큰 양의 정수',
        ' - 1부터 N 중 하나의 숫자가 나옵니다.',
      ].join('\n'),
    });
  }

  execute = (data: TalkChatData, channel: TalkChannel, argString: string) => {
    let max = 6;

    if (typeof argString === 'number' && isFinite(argString)) {
      const arg = Math.floor(parseInt(argString, 10));
      if (arg > 1) {
        max = arg;
      }
    }

    let result = `${Math.ceil(Math.random() * max)}`;

    switch (result) {
      case '1': {
        result = '⚀';
        break;
      }
      case '2': {
        result = '⚁';
        break;
      }
      case '3': {
        result = '⚂';
        break;
      }
      case '4': {
        result = '⚃';
        break;
      }
      case '5': {
        result = '⚄';
        break;
      }
      case '6': {
        result = '⚅';
        break;
      }
    }

    return channel.sendChat(
      new ChatBuilder()
        .append(new ReplyContent(data.chat))
        .text(result)
        .build(KnownChatType.REPLY),
    );
  };
}
