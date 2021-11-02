import { OpenChannelUserPerm, TalkChatData, TalkOpenChannel } from 'node-kakao';

import { CommonTime } from '@lib/utils/interfaces';
import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';
import { KakaoOpenCommand } from './base.command';
import { PartyManagerService } from '@lib/party';
import { converters } from '@lib/kakao/utils';

@Injectable()
export class PartyCreateCommand extends KakaoOpenCommand {
  constructor(private readonly partyManagerService: PartyManagerService) {
    super({
      command: 'party-create',
      aliases: ['파티생', '파티생성'],
      roles: [
        OpenChannelUserPerm.OWNER,
        OpenChannelUserPerm.MANAGER,
        OpenChannelUserPerm.NONE,
      ],
      helpMessage: [
        '파티 생성하는법',
        '/파티생성 [이름] [타입] [시간]',
        '[이름] 10자 이내, 띄어쓰기 미지원',
        '[타입] 큐 타입 or 인원수(2~10)',
        '[시간] 시작 시간 (HH:mm)',
        '-------- 사용 예 --------',
        '/파티생성 불금내전 내전 22:00',
        '/파티생성 도유팀연습 스크림 18:30',
        '/파티생성 점심롤체 롤체 12:10',
        '/파티생성 강남족발팟 6 12:10',
        '/파티생성 홍대방탈출 4 12:10',
      ].join('\n'),
    });
  }

  execute = async (
    data: TalkChatData,
    channel: TalkOpenChannel,
    args: string[] = [],
  ) => {
    const name = args[0].replace(' ', '').trim().slice(0, 10);
    const startedAt = converters.str2time(args[2]);

    return this.create(data, channel, [name, args[1], startedAt]);
  };

  create = async (
    data: TalkChatData,
    channel: TalkOpenChannel,
    args: [string, string, CommonTime],
  ) => {
    const [name, type, time] = args;
    const startedAt = DateTime.fromObject(time);

    await this.partyManagerService.create(
      channel.info.channelId.toString(),
      name,
      type,
      startedAt.diffNow().valueOf() <= 0
        ? startedAt.plus({
            day: 1,
          })
        : startedAt,
    );

    return `파티 '${name}'이 생성되었습니다.`;
  };
}
