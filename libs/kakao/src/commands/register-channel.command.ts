import { CONNECTION } from '@lib/db/constants/connection';
import { KakaoChannelsEntity } from '@lib/db/entities/kakao/channel.entity';
import { KakaoUsersEntity } from '@lib/db/entities/kakao/user.entity';
import { KakaoUserLevel, KakaoUserStatus } from '@lib/utils/enumerations';
import * as dayjs from 'dayjs';
import {
  ChatBuilder,
  KnownChatType,
  OpenChannelUserPerm,
  ReplyContent,
  TalkChatData,
  TalkOpenChannel,
} from 'node-kakao';
import { getManager } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { KakaoOpenCommand } from './base.command';

const getLevel = (origin: OpenChannelUserPerm) => {
  switch (origin) {
    case OpenChannelUserPerm.OWNER:
      return KakaoUserLevel.Admin;
    case OpenChannelUserPerm.MANAGER:
      return KakaoUserLevel.Manager;
    case OpenChannelUserPerm.NONE:
      return KakaoUserLevel.Member;
    default:
      return KakaoUserLevel.Alien;
  }
};

export class RegisterChannelCommand extends KakaoOpenCommand {
  constructor() {
    super({
      command: 'register-channel',
      aliases: ['채널등록'],
      roles: [OpenChannelUserPerm.OWNER],
    });
  }

  execute = async (data: TalkChatData, channel: TalkOpenChannel) => {
    try {
      const manager = getManager(CONNECTION.DEFAULT_NAME);

      if (
        await manager
          .getRepository(KakaoChannelsEntity)
          .findOne({ where: { kakaoId: channel.channelId.toString() } })
      ) {
        return channel.sendChat(
          new ChatBuilder()
            .append(new ReplyContent(data.chat))
            .text(`이미 등록된 채널(${channel.getDisplayName()}) 입니다.`)
            .build(KnownChatType.REPLY),
        );
      }

      await manager.transaction(async (transactionManager) => {
        const result = await transactionManager
          .createQueryBuilder()
          .insert()
          .into(KakaoChannelsEntity)
          .values({
            kakaoId: channel.channelId.toBigInt(),
            type: channel.info.type,
            name: channel.getDisplayName(),
            coverUrl: channel.info.openLink?.linkCoverURL,
          })
          .execute();

        const users: QueryDeepPartialEntity<KakaoUsersEntity>[] = [];

        const currentDate = dayjs().toDate();

        for (const user of channel.getAllUserInfo()) {
          users.push({
            kakaoId: user.userId.toBigInt(),
            perm: user.perm,
            type: user.userType,
            name: user.nickname,
            profileImageUrl: user.fullProfileURL,
            channelId: result.identifiers[0].id,
            status: KakaoUserStatus.Activated,
            level: getLevel(user.perm),
            activityScore: 0,
            lastEnteredAt: currentDate,
            lastExitedAt: currentDate,
          });
        }

        await transactionManager
          .createQueryBuilder()
          .insert()
          .into(KakaoUsersEntity)
          .values(users)
          .execute();
      });
    } catch (e) {
      return channel.sendChat(
        new ChatBuilder()
          .append(new ReplyContent(data.chat))
          .text(e.message)
          .build(KnownChatType.REPLY),
      );
    }

    return channel.sendChat(
      new ChatBuilder()
        .append(new ReplyContent(data.chat))
        .text('등록 성공!')
        .build(KnownChatType.REPLY),
    );
  };
}
