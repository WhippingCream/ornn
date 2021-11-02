import { KakaoCommandError, KakaoCommandErrorCode } from '@lib/kakao/errors';
import { OpenChannelUserPerm, TalkChatData, TalkOpenChannel } from 'node-kakao';
import { converters, findOpenSender } from '@lib/kakao/utils';

import { Injectable } from '@nestjs/common';
import { KakaoOpenCommand } from './base.command';
import { PartyManagerService } from '@lib/party';

@Injectable()
export class PartyKickCommand extends KakaoOpenCommand {
  constructor(private readonly partyManagerService: PartyManagerService) {
    super({
      command: 'party-kick',
      aliases: ['파티추방'],
      roles: [
        OpenChannelUserPerm.OWNER,
        OpenChannelUserPerm.MANAGER,
        OpenChannelUserPerm.NONE,
      ],
      helpMessage: [
        '파티 추방시키는법',
        '(운영진만 사용 가능)',
        '/파티추방 [이름] [번호]',
        '[이름] 추방시킬 파티 명',
        '[번호] 추방시킬 참가자 번호',
        '-------- 사용 예 --------',
        '/파티추방 불금자랭 3',
        '/파티추방 도유팀연습 4',
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
    return this.kick(data, channel, [name, idx]);
  };

  kick = async (
    data: TalkChatData,
    channel: TalkOpenChannel,
    args: [string, number],
  ) => {
    const [partyName, userIdx] = args;
    const senderInfo = findOpenSender(channel, data.chat.sender);

    if (
      senderInfo.perm !== OpenChannelUserPerm.OWNER &&
      senderInfo.perm !== OpenChannelUserPerm.MANAGER
    ) {
      throw new KakaoCommandError(403, KakaoCommandErrorCode.PermissionDenied);
    }

    const { party, user } = await this.partyManagerService.popUserByIndex(
      channel.info.channelId.toString(),
      partyName,
      userIdx,
    );

    channel.sendChat(party.toString({ participants: true }));

    return `'${senderInfo.nickname}'님이 '${user.nickname}'님을 '${partyName}'에서 강퇴하셨습니다.`;
  };
}
