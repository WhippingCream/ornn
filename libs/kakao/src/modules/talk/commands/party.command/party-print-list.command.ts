import { COMMAND_ARGUMENT_TYPE, KakaoCommand } from '../base.command';
import {
  ChatBuilder,
  KnownChatType,
  ReplyContent,
  TalkChannel,
  TalkChatData,
} from 'node-kakao';

import { Injectable } from '@nestjs/common';
import { PartyManagerService } from '@lib/redis/party.service';

@Injectable()
export class PartyPrintListCommand extends KakaoCommand {
  constructor(private readonly partyService: PartyManagerService) {
    super({
      command: 'party-print-list',
      aliases: ['파티목록', '파티리스트', '팟'],
      helpMessage: [
        '파티목록(=팟) 도움말',
        '\n/파티목록',
        '\n/파티목록 상세',
      ].join('\n'),
      argOptions: [
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
    params: [string],
  ) => {
    const partyList = await this.partyService.getAll(
      channel.info.channelId.toString(),
    );

    let verbose = false;
    if (params[0] === '자세히' || params[0] === '상세') verbose = true;

    const message = partyList
      .map((party) => party.toString(verbose))
      .join('\n');

    return channel.sendChat(
      new ChatBuilder()
        .append(new ReplyContent(data.chat))
        .text(message)
        .build(KnownChatType.REPLY),
    );
  };
}
