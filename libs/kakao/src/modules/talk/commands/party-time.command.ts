import { OpenChannelUserPerm, TalkChatData, TalkOpenChannel } from 'node-kakao';
import { converters, findOpenSender } from '@lib/kakao/utils';

import { CommonTime } from '@lib/utils/interfaces';
import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';
import { KakaoOpenCommand } from './base.command';
import { PartyManagerService } from '@lib/party';

@Injectable()
export class PartyTimeCommand extends KakaoOpenCommand {
  constructor(private readonly partyManagerService: PartyManagerService) {
    super({
      command: 'party-time',
      aliases: ['파티시', '파티시간', '파티시간변경'],
      roles: [
        OpenChannelUserPerm.OWNER,
        OpenChannelUserPerm.MANAGER,
        OpenChannelUserPerm.NONE,
      ],
      helpMessage: [
        '파티 시간 변경하는법',
        '/파티시간 [이름] [시간]',
        '[이름] 이름을 변경할 파티 명',
        '[시간] 시작 시간 (HH:mm)',
        '-------- 사용 예 --------',
        '/파티시간 불금자랭 22:05',
        '/파티시간 플레듀오 14:30',
      ].join('\n'),
    });
  }

  execute = async (
    data: TalkChatData,
    channel: TalkOpenChannel,
    args: string[] = [],
  ) => {
    const name = args[0].replace(' ', '').trim().slice(0, 10);
    const startedAt = converters.str2time(args[1]);
    return this.changeTime(data, channel, [name, startedAt]);
  };

  changeTime = async (
    data: TalkChatData,
    channel: TalkOpenChannel,
    args: [string, CommonTime],
  ) => {
    const [name, time] = args;
    const senderInfo = findOpenSender(channel, data.chat.sender);

    const startedAt = DateTime.fromObject(time);

    const party = await this.partyManagerService.updateTime(
      channel.info.channelId.toString(),
      name,
      startedAt.diffNow().valueOf() <= 0
        ? startedAt.plus({
            day: 1,
          })
        : startedAt,
    );

    channel.sendChat(party.toString({ participants: false }));

    return `'${
      senderInfo.nickname
    }'님이 '${name}'의 시작 시간을 '${startedAt.toFormat(
      'MM/dd HH:mm',
    )}'으로 변경하셨습니다.`;
  };
}
