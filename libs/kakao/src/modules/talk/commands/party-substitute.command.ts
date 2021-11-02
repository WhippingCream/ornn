import { OpenChannelUserPerm, TalkChatData, TalkOpenChannel } from 'node-kakao';
import { converters, findOpenSender } from '@lib/kakao/utils';

import { Injectable } from '@nestjs/common';
import { KakaoOpenCommand } from './base.command';
import { PartyManagerService } from '@lib/party';

@Injectable()
export class PartySubstituteCommand extends KakaoOpenCommand {
  constructor(private readonly partyManagerService: PartyManagerService) {
    super({
      command: 'party-substitute',
      aliases: ['파티대', '파티대타'],
      roles: [
        OpenChannelUserPerm.OWNER,
        OpenChannelUserPerm.MANAGER,
        OpenChannelUserPerm.NONE,
      ],
      helpMessage: [
        '파티 대타하는법',
        '/파티대타 [이름] [번호]',
        '[이름] 대신 참가할 파티 명',
        '[번호] 대신할 참가자의 번호',
        '-------- 사용 예 --------',
        '/파티대타 불금자랭 3',
        '/파티대타 도유팀연습 2',
      ].join('\n'),
    });
  }

  execute = async (
    data: TalkChatData,
    channel: TalkOpenChannel,
    args: string[] = [],
  ) => {
    const name = args[0].replace(' ', '').trim().slice(0, 10);
    const idx = converters.str2int(args[1]);
    return this.substitute(data, channel, [name, idx]);
  };

  substitute = async (
    data: TalkChatData,
    channel: TalkOpenChannel,
    [partyName, idx]: [string, number],
  ) => {
    const senderInfo = findOpenSender(channel, data.chat.sender);

    const { user, party } = await this.partyManagerService.replaceUser(
      channel.info.channelId.toString(),
      partyName,
      idx,
      senderInfo.userId.toString(),
      senderInfo.nickname,
    );

    channel.sendChat(party.toString({ participants: true }));

    return `'${senderInfo.nickname}'님이 '${user.nickname}'님을 대신하여 '${partyName}'에 참가하셨습니다.`;
  };
}
