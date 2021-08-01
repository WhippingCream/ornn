import { COMMAND_ARGUMENT_TYPE, KakaoCommand } from './base.command';
import {
  ChatBuilder,
  KnownChatType,
  ReplyContent,
  TalkChannel,
  TalkChatData,
} from 'node-kakao';
import { CommonDate, CommonTime } from '@lib/utils/interfaces';

import { Injectable } from '@nestjs/common';

@Injectable()
export class ParamTestCommand extends KakaoCommand {
  constructor() {
    super({
      command: 'param-test',
      aliases: ['인자테스트'],
      helpMessage: [
        '/인자테스트 A B C D E',
        ' - A: 정수 (필수)',
        ' - B: 숫자 (필수)',
        ' - C: 부울 (필수)',
        ' - D: 날짜 (필수)',
        ' - E: 시간 (필수)',
      ].join('\n'),
      argOptions: [
        {
          type: COMMAND_ARGUMENT_TYPE.INTEGER,
          optional: false,
        },
        {
          type: COMMAND_ARGUMENT_TYPE.NUMBER,
          optional: false,
        },
        {
          type: COMMAND_ARGUMENT_TYPE.BOOLEAN,
          optional: false,
        },
        {
          type: COMMAND_ARGUMENT_TYPE.DATE,
          optional: false,
        },
        {
          type: COMMAND_ARGUMENT_TYPE.TIME,
          optional: false,
        },
      ],
    });
  }

  execute = (
    data: TalkChatData,
    channel: TalkChannel,
    args: [number, number, boolean, CommonDate, CommonTime],
  ) => {
    return channel.sendChat(
      new ChatBuilder()
        .append(new ReplyContent(data.chat))
        .text(`정수: (${args[0]})\n`)
        .text(`숫자: (${args[1]})\n`)
        .text(`부울: (${args[2]})\n`)
        .text(`날짜: (${JSON.stringify(args[3])})\n`)
        .text(`시간: (${JSON.stringify(args[4])})\n`)
        .text('테스트에 성공했습니다.')
        .build(KnownChatType.REPLY),
    );
  };
}
