import { COMMAND_ARGUMENT_TYPE, KakaoCommand } from './base.command';
import {
  ChatBuilder,
  KnownChatType,
  ReplyContent,
  TalkChannel,
  TalkChatData,
} from 'node-kakao';

import { CacheService } from '@lib/redis';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheCommand extends KakaoCommand {
  constructor(private readonly cacheService: CacheService) {
    super({
      command: 'cache',
      aliases: ['캐시'],
      helpMessage: [
        '/캐시 저장 K V',
        ' - K: 키',
        ' - V: 값',
        '/캐시 읽기 K',
        ' - K: 키',
      ].join('\n'),
      argOptions: [
        {
          type: COMMAND_ARGUMENT_TYPE.STRING,
          optional: false,
        },
        {
          type: COMMAND_ARGUMENT_TYPE.STRING,
          optional: false,
        },
        {
          type: COMMAND_ARGUMENT_TYPE.STRING,
          optional: true,
        },
      ],
    });
  }

  execute = async (
    data: TalkChatData,
    channel: TalkChannel,
    args: [string, string, string],
  ) => {
    let result = '';
    switch (args[0]) {
      case '저장':
      case 'save':
      case 's':
        await this.cacheService.set(args[1], args[2]);
        result = '저장했습니다.';
        break;
      case '읽기':
      case 'load':
      case 'l':
        const data = await this.cacheService.get(args[1]);
        result = data as string;
        break;
    }

    return channel.sendChat(
      new ChatBuilder()
        .append(new ReplyContent(data.chat))
        .text(result)
        .build(KnownChatType.REPLY),
    );
  };
}
