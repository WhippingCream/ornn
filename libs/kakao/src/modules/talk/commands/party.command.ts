import { KakaoCommandError, KakaoCommandErrorCode } from '@lib/kakao/errors';
import { OpenChannelUserPerm, TalkChatData, TalkOpenChannel } from 'node-kakao';
import { converters, findOpenSender } from '@lib/kakao/utils';

import { CommonTime } from '@lib/utils/interfaces';
import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';
import { KakaoOpenCommand } from './base.command';
import { PartyManagerService } from '@lib/party';

@Injectable()
export class PartyCommand extends KakaoOpenCommand {
  constructor(private readonly partyManagerService: PartyManagerService) {
    super({
      command: 'party',
      aliases: ['파', '파티'],
      roles: [
        OpenChannelUserPerm.OWNER,
        OpenChannelUserPerm.MANAGER,
        OpenChannelUserPerm.NONE,
      ],
      helpMessage: [
        '/파티 리스트',
        '/파티 생성 N Q T',
        '/파티 참가 N',
        '/파티 탈퇴 N',
        // '/파티 추방 N I',
        '/파티 이름 N N',
        '/파티 시간 N T',
        '/파티 타입 N Q',
        ' - Q: 큐 타입 or 인원수(2~10)',
        ' 사용 가능한 큐 타입',
        ' 일반 | 솔랭 | 자랭 | 칼바 | 내전 | 스크림 | 롤체',
        ' - N: 파티명 (10자 제한, 띄어쓰기 X)',
        ' - T: 시간(HH:mm)',
        ' - I: 참가자 번호',
      ].join('\n'),
    });
  }

  execute = async (
    data: TalkChatData,
    channel: TalkOpenChannel,
    args: string[] = [],
  ) => {
    switch (args[0]) {
      default:
      case '리':
      case '리스트': {
        let verbose = false;
        if (args[1] === '자세히' || args[1] === '상세') verbose = true;
        return this.list(data, channel, [verbose]);
      }
      case '생':
      case '생성': {
        const name = args[1].replace(' ', '').trim().slice(0, 10);
        const startedAt = converters.str2time(args[3]);

        return this.create(data, channel, [name, args[2], startedAt]);
      }
      case '생?':
      case '생성?': {
        return [
          '파티 생성하는법',
          '/파티 생성 [이름] [타입] [시간]',
          '[이름] 10자 이내, 띄어쓰기 미지원',
          '[타입] 큐 타입 or 인원수(2~10)',
          '[시간] 시작 시간 (HH:mm)',
          '-------- 사용 예 --------',
          '/파티 생성 불금내전 내전 22:00',
          '/파티 생성 도유팀연습 스크림 18:30',
          '/파티 생성 점심롤체 롤체 12:10',
          '/파티 생성 강남족발팟 6 12:10',
          '/파티 생성 홍대방탈출 4 12:10',
        ].join('\n');
      }
      case '참':
      case '참가': {
        const name = args[1].replace(' ', '').trim().slice(0, 10);
        return this.join(data, channel, [name]);
      }
      case '참?':
      case '참가?': {
        return [
          '파티 참가하는법',
          '/파티 참가 [이름]',
          '[이름] 참가할 파티 명',
          '-------- 사용 예 --------',
          '/파티 참가 불금자랭',
          '/파티 참가 도유팀연습',
        ].join('\n');
      }
      case '탈':
      case '탈퇴': {
        const name = args[1].replace(' ', '').trim().slice(0, 10);
        return this.exit(data, channel, [name]);
      }
      case '탈?':
      case '탈퇴?': {
        return [
          '파티 탈퇴하는법',
          '/파티 탈퇴 [이름]',
          '[이름] 탈퇴할 파티 명',
          '-------- 사용 예 --------',
          '/파티 탈퇴 불금자랭',
          '/파티 탈퇴 도유팀연습',
        ].join('\n');
      }
      case '추':
      case '추방': {
        const name = args[1].replace(' ', '').trim().slice(0, 10);
        const idx = converters.str2int(args[1]);
        return this.kick(data, channel, [name, idx]);
      }
      case '추?':
      case '추방?': {
        return [
          '파티 추방시키는법',
          '(운영진만 사용 가능)',
          '/파티 추방 [이름] [번호]',
          '[이름] 추방시킬 파티 명',
          '[번호] 추방시킬 참가자 번호',
          '-------- 사용 예 --------',
          '/파티 추방 불금자랭 3',
          '/파티 추방 도유팀연습 4',
        ].join('\n');
      }
      case '이':
      case '이름': {
        const name = args[1].replace(' ', '').trim().slice(0, 10);
        const newName = args[2].replace(' ', '').trim().slice(0, 10);
        return this.changeName(data, channel, [name, newName]);
      }
      case '이?':
      case '이름?': {
        return [
          '파티 이름 변경하는법',
          '/파티 이름 [이름] [새이름]',
          '[이름] 이름을 변경할 파티 명',
          '[새이름] 새로운 이름',
          '-------- 사용 예 --------',
          '/파티 이름 불금자랭 즐토자랭',
          '/파티 이름 플레듀오 골드듀오',
        ].join('\n');
      }
      case '타':
      case '타입': {
        const name = args[1].replace(' ', '').trim().slice(0, 10);
        return this.changeType(data, channel, [name, args[2]]);
      }
      case '타?':
      case '타입?': {
        return [
          '파티 타입 변경하는법',
          '/파티 타입 [이름] [타입]',
          '[이름] 이름을 변경할 파티 명',
          '[타입] 큐 타입 or 인원수(2~10)',
          '-------- 사용 예 --------',
          '/파티 타입 도유팀연습 4',
          '/파티 타입 즐겜 칼바람',
        ].join('\n');
      }
      case '시':
      case '시간': {
        const name = args[1].replace(' ', '').trim().slice(0, 10);
        const startedAt = converters.str2time(args[2]);
        return this.changeTime(data, channel, [name, startedAt]);
      }
      case '시?':
      case '시간?': {
        return [
          '파티 시간 변경하는법',
          '/파티 시간 [이름] [시간]',
          '[이름] 이름을 변경할 파티 명',
          '[시간] 시작 시간 (HH:mm)',
          '-------- 사용 예 --------',
          '/파티 시간 불금자랭 22:05',
          '/파티 시간 플레듀오 14:30',
        ].join('\n');
      }
    }
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

  create = async (
    data: TalkChatData,
    channel: TalkOpenChannel,
    args: [string, string, CommonTime],
  ) => {
    const [name, type, time] = args;
    const startedAt = DateTime.fromObject(time);

    this.partyManagerService.create(
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
      startedAt,
    );

    channel.sendChat(party.toString({ participants: false }));

    return `'${senderInfo.nickname}'님이 '${name}'의 시작 시간을 '${startedAt}'으로 변경하셨습니다.`;
  };
}
