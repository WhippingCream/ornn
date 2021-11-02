import { OpenChannelUserPerm, TalkChatData, TalkOpenChannel } from 'node-kakao';

import { Injectable } from '@nestjs/common';
import { KakaoOpenCommand } from './base.command';
import { PartyManagerService } from '@lib/party';
import { findOpenSender } from '@lib/kakao/utils';

@Injectable()
export class PartyJoinCommand extends KakaoOpenCommand {
  constructor(private readonly partyManagerService: PartyManagerService) {
    super({
      command: 'party-join',
      aliases: ['파티참', '파티참가'],
      roles: [
        OpenChannelUserPerm.OWNER,
        OpenChannelUserPerm.MANAGER,
        OpenChannelUserPerm.NONE,
      ],
      helpMessage: [
        '파티 참가하는법',
        '/파티참가 [이름]',
        '[이름] 참가할 파티 명',
        '-------- 사용 예 --------',
        '/파티참가 불금자랭',
        '/파티참가 도유팀연습',
      ].join('\n'),
    });
  }

  execute = async (
    data: TalkChatData,
    channel: TalkOpenChannel,
    args: string[] = [],
  ) => {
    const name = args[0].replace(' ', '').trim().slice(0, 10);
    return this.join(data, channel, [name]);
  };

  join = async (
    data: TalkChatData,
    channel: TalkOpenChannel,
    args: [string],
  ) => {
    const [partyName] = args;
    const senderInfo = findOpenSender(channel, data.chat.sender);

    const party = await this.partyManagerService.pushUser(
      channel.info.channelId.toString(),
      partyName,
      senderInfo.userId.toString(),
      senderInfo.nickname,
    );

    channel.sendChat(party.toString({ participants: true }));

    return `'${senderInfo.nickname}'님이 '${partyName}'에 참가하셨습니다.`;
  };
}
