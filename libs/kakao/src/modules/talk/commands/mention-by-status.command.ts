import {
  ChatBuilder,
  KnownChatType,
  MentionContent,
  OpenChannelUserPerm,
  TalkChatData,
  TalkOpenChannel,
} from 'node-kakao';
import { KakaoUserLevel, KakaoUserStatus } from '@lib/utils/enumerations';

import { CONNECTION } from '@lib/db/constants/connection';
import { Injectable } from '@nestjs/common';
import { KakaoChannelsEntity } from '@lib/db/entities/kakao/channel.entity';
import { KakaoOpenCommand } from './base.command';
import { KakaoUsersEntity } from '@lib/db/entities/kakao/user.entity';
import { getManager } from 'typeorm';

const userStatusMap: Map<string, KakaoUserStatus> = new Map<
  string,
  KakaoUserStatus
>([['휴면', KakaoUserStatus.Inactivated]]);

const userLevelMap: Map<string, KakaoUserLevel> = new Map<
  string,
  KakaoUserLevel
>([['신입', KakaoUserLevel.Newbie]]);

@Injectable()
export class MentionByStatusCommand extends KakaoOpenCommand {
  constructor() {
    super({
      command: 'mention-by-type-room',
      aliases: ['조건부호출'],
      roles: [OpenChannelUserPerm.OWNER, OpenChannelUserPerm.MANAGER],
      helpMessage: `/조건부호출 M N\n - M: 타입(신입, 휴면)\n - N:전달할 메시지`,
    });
  }

  execute = async (
    data: TalkChatData,
    channel: TalkOpenChannel,
    args: [string, string],
  ) => {
    const typeName = args[0];
    if (!userStatusMap.has(typeName) || !userLevelMap.has(typeName)) {
      return `올바른 타입을 입력해 주세요.\n${this.helpMessage}`;
    }

    const chatBuilder = new ChatBuilder().text(
      `※ [${typeName}유저] 대상으로 호출 되는 메시지입니다.\n\n${args[1]}\n\n`,
    );
    const targetStatus: KakaoUserStatus =
      userStatusMap.get(typeName) ?? KakaoUserStatus.Activated;
    const targetLevel: KakaoUserLevel =
      userLevelMap.get(typeName) ?? KakaoUserLevel.Member;

    const manager = getManager(CONNECTION.DEFAULT_NAME);

    const channelRepository = await manager.getRepository(KakaoChannelsEntity);
    const channelEntity = await channelRepository.findOne({
      where: { kakaoId: channel.channelId.toString() },
    });

    if (!channelEntity) {
      return `등록되지 않은 채널(${channel.getDisplayName()}) 입니다.`;
    }

    const userRepository = await manager.getRepository(KakaoUsersEntity);
    const users = await userRepository.find({
      where: { channelId: channelEntity.id },
      relations: ['channel'],
    });

    for (const user of channel.getAllUserInfo()) {
      if (
        users.findIndex(
          (elem) =>
            elem.kakaoId == user.userId.toBigInt() &&
            elem.status == targetStatus &&
            elem.level == targetLevel,
        ) != -1
      ) {
        chatBuilder.append(new MentionContent(user)).text(' ');
      }
    }

    channel.sendChat(chatBuilder.build(KnownChatType.TEXT));

    return null;
  };
}
