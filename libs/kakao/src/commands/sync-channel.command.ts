import { CONNECTION } from '@lib/db/constants/connection';
import { KakaoChannelsEntity } from '@lib/db/entities/kakao/channel.entity';
import { KakaoUsersEntity } from '@lib/db/entities/kakao/user.entity';
import { KakaoUserLevel, KakaoUserStatus } from '@lib/utils/enumerations';
import * as dayjs from 'dayjs';
import {
  ChatBuilder,
  KnownChatType,
  OpenChannelUserInfo,
  OpenChannelUserPerm,
  ReplyContent,
  TalkChatData,
  TalkOpenChannel,
} from 'node-kakao';
import { getManager } from 'typeorm';
import { KakaoOpenCommand } from './base.command';

interface User {
  currentUserInfo?: OpenChannelUserInfo;
  userRow?: KakaoUsersEntity;
}

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
      return channel.sendChat(
        new ChatBuilder()
          .append(new ReplyContent(data.chat))
          .text(`등록되지 않은 채널(${channel.getDisplayName()}) 입니다.`)
          .build(KnownChatType.REPLY),
      );
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
        // exited
        userRow.status = KakaoUserStatus.Exited;
        userRow.lastExitedAt = currentDate;
        repositories.user.save(userRow);
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
      }
    }

    return channel.sendChat(
      new ChatBuilder()
        .append(new ReplyContent(data.chat))
        .text('동기화 성공!')
        .build(KnownChatType.REPLY),
    );
  };
}
