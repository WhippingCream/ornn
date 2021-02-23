import {
  ChatBuilder,
  KnownChatType,
  ReplyContent,
  TalkChannel,
  TalkChatData,
} from 'node-kakao';
import { COMMAND_ARGUMENT_TYPE, KakaoCommand } from './base.command';

export class DiceCommand extends KakaoCommand {
  constructor() {
    super({
      command: 'dice',
      aliases: ['주사위'],
      helpMessage: [
        '/주사위',
        ' - 1부터 6 중 하나의 숫자가 나옵니다.',
        '/주사위 N',
        ' - N: 1보다 큰 양의 정수',
        ' - 1부터 N 중 하나의 숫자가 나옵니다.',
      ].join('\n'),
      argOptions: [
        {
          type: COMMAND_ARGUMENT_TYPE.INTEGER,
          optional: true,
          validationErrorMessage: [
            '/주사위 N',
            ' - N: 1보다 큰 양의 정수여야 합니다.',
          ].join('\n'),
        },
      ],
    });
  }

  execute = (data: TalkChatData, channel: TalkChannel, args: [number]) => {
    let max = 6;

    if (args[0]) {
      if (args[0] > 1) {
        max = args[0];
      }
    }

    let result = `${Math.ceil(Math.random() * max)}`;

    if (max < 7) {
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
    }

    return channel.sendChat(
      new ChatBuilder()
        .append(new ReplyContent(data.chat))
        .text(result)
        .build(KnownChatType.REPLY),
    );
  };
}
