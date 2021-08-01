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
export class PartyJoinCommand extends KakaoCommand {
  constructor(private readonly partyService: PartyManagerService) {
    super({
      command: 'party-join',
      aliases: ['파티참가', '파티참여', '팟참'],
      helpMessage: [
        '파티참가(=파티참여 =팟참) 도움말',
        '\n/파티참여 N',
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
