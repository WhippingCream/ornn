import * as dayjs from 'dayjs';

import { KakaoUserLevel, KakaoUserStatus } from '@lib/utils/enumerations';
import {
  OpenChannelUserInfo,
  OpenChannelUserPerm,
  TalkChatData,
  TalkOpenChannel,
} from 'node-kakao';

import { CONNECTION } from '@lib/db/constants/connection';
import { Injectable } from '@nestjs/common';
import { KakaoChannelsEntity } from '@lib/db/entities/kakao/channel.entity';
import { KakaoOpenCommand } from './base.command';
import { KakaoUsersEntity } from '@lib/db/entities/kakao/user.entity';
import { getManager } from 'typeorm';

interface User {
  currentUserInfo?: OpenChannelUserInfo;
  userRow?: KakaoUsersEntity;
}

@Injectable()
export class SyncChannelCommand extends KakaoOpenCommand {
  constructor() {
    super({
      command: 'sync-channel',
      aliases: ['채널동기화'],
      roles: [OpenChannelUserPerm.OWNER, OpenChannelUserPerm.MANAGER],
    });
  }

  execute = async (data: TalkChatData, channel: TalkOpenChannel) => {
    const manager = getManager(CONNECTION.DEFAULT_NAME);

    const repositories = {
      channel: manager.getRepository(KakaoChannelsEntity),
      user: manager.getRepository(KakaoUsersEntity),
    };

    const channelRow = await repositories.channel.findOne({
      where: { kakaoId: channel.channelId.toString() },
    });

    if (!channelRow) {
      return `등록되지 않은 채널(${channel.getDisplayName()}) 입니다.`;
    }

    const currentDate = dayjs().toDate();

    channelRow.lastSynchronizedAt = currentDate;

    repositories.channel.save(channelRow);

    const currentChannelUserMap = new Map<bigint, User>();

    for (const channelUserInfo of channel.getAllUserInfo()) {
      currentChannelUserMap.set(channelUserInfo.userId.toBigInt(), {
        currentUserInfo: channelUserInfo,
      });
    }

    for (const userRow of await repositories.user.find({
      channelId: channelRow.id,
    })) {
      const user = currentChannelUserMap.get(userRow.kakaoId);
      if (user) {
        user.userRow = userRow;
      } else {
        currentChannelUserMap.set(userRow.kakaoId, { userRow });
      }
    }

    for (const [
      kakaoId,
      { currentUserInfo, userRow },
    ] of currentChannelUserMap) {
      if (!currentUserInfo) {
        throw new Error('현재 유저 정보를 가져올 수 없습니다.');
      }

      if (!userRow) {
        // entered
        repositories.user.insert({
          kakaoId: kakaoId,
          perm: currentUserInfo.perm,
          type: currentUserInfo.userType,
          name: currentUserInfo.nickname,
          profileImageUrl: currentUserInfo.fullProfileURL,
          channelId: channelRow.id,
          status: KakaoUserStatus.Inactivated,
          level: KakaoUserLevel.Newbie,
          activityScore: 0,
          lastEnteredAt: currentDate,
          lastExitedAt: currentDate,
        });
      } else if (!currentUserInfo) {
        // exited
        userRow.status = KakaoUserStatus.Exited;
        userRow.lastExitedAt = currentDate;
        repositories.user.save(userRow);
      }
    }

    return '동기화 성공!';
  };
}
