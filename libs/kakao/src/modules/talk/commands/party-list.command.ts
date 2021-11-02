import { OpenChannelUserPerm, TalkChatData, TalkOpenChannel } from 'node-kakao';

import { Injectable } from '@nestjs/common';
import { KakaoOpenCommand } from './base.command';
import { PartyManagerService } from '@lib/party';

@Injectable()
export class PartyListCommand extends KakaoOpenCommand {
  constructor(private readonly partyManagerService: PartyManagerService) {
    super({
      command: 'party-list',
      aliases: ['파', '파티', '파티리스트'],
      roles: [
        OpenChannelUserPerm.OWNER,
        OpenChannelUserPerm.MANAGER,
        OpenChannelUserPerm.NONE,
      ],
      helpMessage: ['/파티리스트'].join('\n'),
    });
  }

  execute = async (
    data: TalkChatData,
    channel: TalkOpenChannel,
    // args: string[] = [],
  ) => {
    // let verbose = false;
    // if (args[1] === '자세히' || args[1] === '상세') verbose = true;
    return this.list(data, channel, [true]);
  };

  list = async (
    data: TalkChatData,
    channel: TalkOpenChannel,
    args: [boolean],
  ) => {
    const [verbose] = args;
    const partyList = await this.partyManagerService.getAll(
      channel.info.channelId.toString(),
    );

    if (partyList.length === 0) {
      return '파티가 없습니다.';
    }

    return partyList
      .map((party) => party.toString({ participants: verbose }))
      .join('\n');
  };
}
