import { COMMAND_ARGUMENT_TYPE, KakaoOpenCommand } from '../base.command';
import {
  ChatBuilder,
  KnownChatType,
  OpenChannelUserPerm,
  ReplyContent,
  TalkChannel,
  TalkChatData,
} from 'node-kakao';

import { Injectable } from '@nestjs/common';
import { PartyManagerService } from '@lib/redis/party.service';

@Injectable()
export class PartyKickCommand extends KakaoOpenCommand {
  constructor(private readonly partyService: PartyManagerService) {
    super({
      command: 'party-kick',
      aliases: ['파티강퇴', '팟킥'],
      helpMessage: [
        '파티강퇴(=팟킥) 도움말',
        '\n/파티강퇴 N I',
        ' - N: 파티명 (10자 제한, 띄어쓰기 X)',
        ' - I: 참가자 번호',
      ].join('\n'),
      argOptions: [
        {
          type: COMMAND_ARGUMENT_TYPE.STRING,
          optional: false,
        },
        {
          type: COMMAND_ARGUMENT_TYPE.INTEGER,
          optional: false,
        },
      ],
      roles: [OpenChannelUserPerm.OWNER, OpenChannelUserPerm.MANAGER],
    });
  }

  execute = async (
    data: TalkChatData,
    channel: TalkChannel,
    args: [string, number],
  ) => {
    const party = await this.partyService.getOne(
      channel.info.channelId.toString(),
      args[0],
    );

    if (!party) {
      return channel.sendChat(
        new ChatBuilder()
          .append(new ReplyContent(data.chat))
          .text(`'${args[0]}' 파티가 존재하지 않습니다.`)
          .build(KnownChatType.REPLY),
      );
    }

    party.userDelByIdx(args[1]);

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
