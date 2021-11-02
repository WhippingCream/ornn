import { OpenChannelUserPerm, TalkChatData, TalkOpenChannel } from 'node-kakao';

import { Injectable } from '@nestjs/common';
import { KakaoOpenCommand } from './base.command';
import { PartyManagerService } from '@lib/party';
import { findOpenSender } from '@lib/kakao/utils';

@Injectable()
export class PartyNameCommand extends KakaoOpenCommand {
  constructor(private readonly partyManagerService: PartyManagerService) {
    super({
      command: 'party-name',
      aliases: ['파티이', '파티이름', '파티이름변경'],
      roles: [
        OpenChannelUserPerm.OWNER,
        OpenChannelUserPerm.MANAGER,
        OpenChannelUserPerm.NONE,
      ],
      helpMessage: [
        '파티 이름 변경하는법',
        '/파티이름 [이름] [새이름]',
        '[이름] 이름을 변경할 파티 명',
        '[새이름] 새로운 이름',
        '-------- 사용 예 --------',
        '/파티이름 불금자랭 즐토자랭',
        '/파티이름 플레듀오 골드듀오',
      ].join('\n'),
    });
  }

  execute = async (
    data: TalkChatData,
    channel: TalkOpenChannel,
    args: string[] = [],
  ) => {
    const name = args[0].replace(' ', '').trim().slice(0, 10);
    const newName = args[1].replace(' ', '').trim().slice(0, 10);
    return this.changeName(data, channel, [name, newName]);
  };

  changeName = async (
    data: TalkChatData,
    channel: TalkOpenChannel,
    args: [string, string],
  ) => {
    const [name, newName] = args;
    const senderInfo = findOpenSender(channel, data.chat.sender);

    const party = await this.partyManagerService.updateName(
      channel.info.channelId.toString(),
      name,
      newName,
    );

    channel.sendChat(party.toString({ participants: false }));

    return `'${senderInfo.nickname}'님이 '${name}'의 이름을 '${newName}'으로 변경하셨습니다.`;
  };
}
