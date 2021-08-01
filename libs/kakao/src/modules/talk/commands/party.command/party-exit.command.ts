import { COMMAND_ARGUMENT_TYPE, KakaoCommand } from '../base.command';
import {
  ChatBuilder,
  KnownChatType,
  ReplyContent,
  TalkChannel,
  TalkChatData,
} from 'node-kakao';

import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';
import { PartyManagerService } from '@lib/redis/party.service';

@Injectable()
export class PartyExitCommand extends KakaoCommand {
  constructor(private readonly partyService: PartyManagerService) {
    super({
      command: 'party-exit',
      aliases: ['파티탈퇴', '파티나가기', '팟탈'],
      helpMessage: [
        '파티탈퇴(=파티나가기 =팟탈) 도움말',
        '\n/파티탈퇴 N',
        ' - N: 파티명 (10자 제한, 띄어쓰기 X)',
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
    const party = await this.partyService.getOne(
      channel.info.channelId.toString(),
      params[0],
    );

    if (!party) {
      return channel.sendChat(
        new ChatBuilder()
          .append(new ReplyContent(data.chat))
          .text(`'${params[0]}' 파티가 존재하지 않습니다.`)
          .build(KnownChatType.REPLY),
      );
    }

    if (party.type === 'FriendlyMatch') {
      const diffNowMills = DateTime.fromISO(party.startedAt)
        .diffNow()
        .valueOf();
      if (diffNowMills > 0 && diffNowMills < 180000) {
        return channel.sendChat(
          new ChatBuilder()
            .append(new ReplyContent(data.chat))
            .text(
              '내전 30분 전엔 탈퇴할 수 없습니다.\n대타 기능을 이용해 주세요.',
            )
            .build(KnownChatType.REPLY),
        );
      }
    }

    const result = party.userDel(data.chat.sender.userId.toString());

    if (!result) {
      return channel.sendChat(
        new ChatBuilder()
          .append(new ReplyContent(data.chat))
          .text(`참가하지 않은 파티입니다.`)
          .build(KnownChatType.REPLY),
      );
    }

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
