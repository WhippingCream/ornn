import { COMMAND_ARGUMENT_TYPE, KakaoCommand } from '../base.command';
import {
  ChannelUserInfo,
  ChatBuilder,
  KnownChatType,
  ReplyContent,
  TalkChannel,
  TalkChatData,
} from 'node-kakao';

import { Injectable } from '@nestjs/common';
import { PartyManagerService } from '@lib/redis/party.service';

@Injectable()
export class PartyReplaceCommand extends KakaoCommand {
  constructor(private readonly partyService: PartyManagerService) {
    super({
      command: 'party-replace',
      aliases: ['파티대타'],
      helpMessage: [
        '파티대타 도움말',
        '\n/파티대타 N I',
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

    let senderInfo: ChannelUserInfo | undefined;

    for (const user of channel.getAllUserInfo()) {
      if (user.userId.eq(data.chat.sender.userId)) {
        senderInfo = user;
        break;
      }
    }

    if (!senderInfo) {
      return channel.sendChat(
        new ChatBuilder()
          .append(new ReplyContent(data.chat))
          .text(`사용자를 찾을 수 없습니다.`)
          .build(KnownChatType.REPLY),
      );
    }

    const result = party.userAdd(
      senderInfo.userId.toString(),
      senderInfo.nickname,
    );

    if (!result) {
      return channel.sendChat(
        new ChatBuilder()
          .append(new ReplyContent(data.chat))
          .text(`이미 참가한 파티입니다.`)
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
