import { OpenChannelUserPerm, TalkChatData, TalkOpenChannel } from 'node-kakao';

import { Injectable } from '@nestjs/common';
import { KakaoOpenCommand } from './base.command';
import { PartyManagerService } from '@lib/party';
import { findOpenSender } from '@lib/kakao/utils';

@Injectable()
export class PartyExitCommand extends KakaoOpenCommand {
  constructor(private readonly partyManagerService: PartyManagerService) {
    super({
      command: 'party-exit',
      aliases: ['파티탈', '파티탈퇴'],
      roles: [
        OpenChannelUserPerm.OWNER,
        OpenChannelUserPerm.MANAGER,
        OpenChannelUserPerm.NONE,
      ],
      helpMessage: [
        '파티 탈퇴하는법',
        '/파티탈퇴 [이름]',
        '[이름] 탈퇴할 파티 명',
        '-------- 사용 예 --------',
        '/파티탈퇴 불금자랭',
        '/파티탈퇴 도유팀연습',
      ].join('\n'),
    });
  }

  execute = async (
    data: TalkChatData,
    channel: TalkOpenChannel,
    args: string[] = [],
  ) => {
    const name = args[0].replace(' ', '').trim().slice(0, 10);
    return this.exit(data, channel, [name]);
  };

  exit = async (
    data: TalkChatData,
    channel: TalkOpenChannel,
    args: [string],
  ) => {
    const [partyName] = args;
    const senderInfo = findOpenSender(channel, data.chat.sender);

    const party = await this.partyManagerService.popUser(
      channel.info.channelId.toString(),
      partyName,
      data.chat.sender.userId.toString(),
    );

    channel.sendChat(party.toString({ participants: true }));

    return `'${senderInfo.nickname}'님이 '${partyName}'에서 나가셨습니다.`;
  };
}
