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
export class PartyPrintCamilleCommand extends KakaoCommand {
  constructor(private readonly partyService: PartyManagerService) {
    super({
      command: 'party-print-camille',
      aliases: ['카밀출력', '카밀'],
      helpMessage: [
        '파티목록(=팟) 도움말',
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

    channel.sendChat(
      new ChatBuilder()
        .append(new ReplyContent(data.chat))
        .text(
          `/자동매칭 ${party.users
            .filter((user, idx) => idx < party.getLimit())
            .map((user) => user.nickname.split('/')[0])
            .join(',')}`,
        )
        .build(KnownChatType.REPLY),
    );

    return channel.sendChat(
      new ChatBuilder()
        .append(new ReplyContent(data.chat))
        .text(
          '※닉네임 뒤에 @1, @2를 붙이면 팀을 미리 나눌 수 있습니다.\nEx. /자동매칭 ZeroBoom@1,버스타는고먐미@2,캇셀프라임,잠탱이다, ...\n가능하면 서폿이랑 정글은 미리 나누고 하시면 밸런스 맞추는데 도움이 됩니다!',
        )
        .build(KnownChatType.REPLY),
    );
  };
}
