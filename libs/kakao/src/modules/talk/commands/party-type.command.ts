import { OpenChannelUserPerm, TalkChatData, TalkOpenChannel } from 'node-kakao';

import { Injectable } from '@nestjs/common';
import { KakaoOpenCommand } from './base.command';
import { PartyManagerService } from '@lib/party';
import { findOpenSender } from '@lib/kakao/utils';

@Injectable()
export class PartyTypeCommand extends KakaoOpenCommand {
  constructor(private readonly partyManagerService: PartyManagerService) {
    super({
      command: 'party-type',
      aliases: ['파티타', '파티타입', '파티타입변경'],
      roles: [
        OpenChannelUserPerm.OWNER,
        OpenChannelUserPerm.MANAGER,
        OpenChannelUserPerm.NONE,
      ],
      helpMessage: [
        '파티 타입 변경하는법',
        '/파티타입 [이름] [타입]',
        '[이름] 이름을 변경할 파티 명',
        '[타입] 큐 타입 or 인원수(2~10)',
        '-------- 사용 예 --------',
        '/파티타입 도유팀연습 4',
        '/파티타입 즐겜 칼바람',
      ].join('\n'),
    });
  }

  execute = async (
    data: TalkChatData,
    channel: TalkOpenChannel,
    args: string[] = [],
  ) => {
    const name = args[0].replace(' ', '').trim().slice(0, 10);
    return this.changeType(data, channel, [name, args[1]]);
  };

  changeType = async (
    data: TalkChatData,
    channel: TalkOpenChannel,
    args: [string, string],
  ) => {
    const [name, type] = args;
    const senderInfo = findOpenSender(channel, data.chat.sender);

    const party = await this.partyManagerService.updateType(
      channel.info.channelId.toString(),
      name,
      type,
    );

    channel.sendChat(party.toString({ participants: false }));

    return `'${senderInfo.nickname}'님이 '${name}'의 타입을 '${type}'으로 변경하셨습니다.`;
  };
}
