import { COMMAND_ARGUMENT_TYPE, KakaoCommand } from '../base.command';
import {
  ChatBuilder,
  KnownChatType,
  ReplyContent,
  TalkChannel,
  TalkChatData,
} from 'node-kakao';

import { CommonTime } from '@lib/utils/interfaces';
import { Injectable } from '@nestjs/common';
import { PartyManagerService } from '@lib/redis/party.service';

@Injectable()
export class PartyUpdateTimeCommand extends KakaoCommand {
  constructor(private readonly partyService: PartyManagerService) {
    super({
      command: 'party-update-time',
      aliases: ['파티시간변경', '파티시간', '파티타임', '팟탐'],
      helpMessage: [
        '파티시간(=파티시간변경 =파티타임 =팟탐) 도움말',
        '/파티시간 N Q',
        ' - N: 파티명 (10자 제한, 띄어쓰기 X)',
        ' - T: 시간(HH:mm)',
        '\n사용 예',
        '/파티시간 점심롤체 13:00',
        '/팟시 피방내전 19:30',
      ].join('\n'),
      argOptions: [
        {
          type: COMMAND_ARGUMENT_TYPE.STRING,
          optional: false,
        },
        {
          type: COMMAND_ARGUMENT_TYPE.TIME,
          optional: false,
        },
      ],
    });
  }

  execute = async (
    data: TalkChatData,
    channel: TalkChannel,
    args: [string, CommonTime],
  ) => {
    const party = await this.partyService.getOne(
      channel.info.channelId.toString(),
      args[0],
    );

    if (!party) {
      return channel.sendChat(
        new ChatBuilder()
          .append(new ReplyContent(data.chat))
          .text(`파티 '${args[0]}'이 존재하지 않습니다.`)
          .build(KnownChatType.REPLY),
      );
    }

    party.setTime(args[1]);

    await this.partyService.update(
      channel.info.channelId.toString(),
      party.name,
      party,
    );

    return channel.sendChat(
      new ChatBuilder()
        .append(new ReplyContent(data.chat))
        .text(party.toString(true))
        .build(KnownChatType.REPLY),
    );
  };
}
