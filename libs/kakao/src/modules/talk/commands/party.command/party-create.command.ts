import { COMMAND_ARGUMENT_TYPE, KakaoCommand } from '../base.command';
import {
  ChatBuilder,
  KnownChatType,
  ReplyContent,
  TalkChannel,
  TalkChatData,
} from 'node-kakao';

import { CommonTime } from '@lib/utils/interfaces';
import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';
import { PartyManagerService } from '@lib/redis/party.service';

@Injectable()
export class PartyCreateCommand extends KakaoCommand {
  constructor(private readonly partyService: PartyManagerService) {
    super({
      command: 'party-create',
      aliases: ['팟생', '파티생성'],
      helpMessage: [
        '파티생성(=팟생) 도움말',
        '\n/파티생성 Q N T',
        ' - N: 파티명 (10자 제한, 띄어쓰기 X)',
        ' - Q: 큐 타입 or 인원수(2~10)',
        ' - T: 시간(HH:mm)',
        '\n사용 가능한 큐 타입',
        '일반 | 솔랭 | 자랭 | 칼바 | 내전 | 스크림 | 롤체',
        '\n사용 예',
        '/파티생성 점심롤체 롤체 12:30',
        '/팟생 제로붐버스팟 일반 20:00',
        '/팟생 저녁드실분 4 19:00',
      ].join('\n'),
      argOptions: [
        {
          type: COMMAND_ARGUMENT_TYPE.STRING,
          optional: false,
        },
        {
          type: COMMAND_ARGUMENT_TYPE.STRING,
          optional: false,
        },
        {
          type: COMMAND_ARGUMENT_TYPE.TIME,
          optional: false,
        },
      ],
    });
  }

  getPartyQueueType(arg: string) {
    switch (arg) {
      case '2':
        return 'Custom02';
      case '3':
        return 'Custom03';
      case '4':
        return 'Custom04';
      case '5':
        return 'Custom05';
      case '6':
        return 'Custom06';
      case '7':
        return 'Custom07';
      case '8':
        return 'Custom08';
      case '9':
        return 'Custom09';
      case '10':
        return 'Custom10';
      case '일반':
      case '노말':
        return 'Normal';
      case '솔랭':
      case '듀오':
        return 'SoloRank';
      case '자랭':
        return 'FreeRank';
      case '칼바':
      case '칼바람':
        return 'HowlingAbyss';
      case '내전':
        return 'FriendlyMatch';
      case '스크림':
      case '외전':
      case '친선':
        return 'Scrimmage';
      case '롤체':
      case 'tft':
      case '롤토체스':
        return 'TeamFightTactics';
      default:
        return null;
    }
  }

  execute = async (
    data: TalkChatData,
    channel: TalkChannel,
    args: [string, string, CommonTime],
  ) => {
    const type = this.getPartyQueueType(args[1]);

    if (!type) {
      return channel.sendChat(
        new ChatBuilder()
          .append(new ReplyContent(data.chat))
          .text(`지원하지 않는 큐 타입 혹은 인원수 입니다.`)
          .build(KnownChatType.REPLY),
      );
    }

    const startedAt = DateTime.fromObject(args[2]);

    const name = args[0].replace(' ', '').trim().slice(0, 10);

    const origin = await this.partyService.getOne(
      channel.info.channelId.toString(),
      name,
    );
    if (origin) {
      return channel.sendChat(
        new ChatBuilder()
          .append(new ReplyContent(data.chat))
          .text(`이미 존재하는 파티명 입니다.`)
          .build(KnownChatType.REPLY),
      );
    }

    this.partyService.create(
      channel.info.channelId.toString(),
      name,
      type,
      startedAt.diffNow().valueOf() <= 0
        ? startedAt.plus({
            day: 1,
          })
        : startedAt,
    );

    return channel.sendChat(
      new ChatBuilder()
        .append(new ReplyContent(data.chat))
        .text(`파티 '${name}'이 생성되었습니다.`)
        .build(KnownChatType.REPLY),
    );
  };
}
