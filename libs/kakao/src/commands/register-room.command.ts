import { CONNECTION } from '@lib/db/constants/connection';
import { KakaoChannelEntity } from '@lib/db/entities/kakao/channel.entity';
import { KakaoUserEntity } from '@lib/db/entities/kakao/user.entity';
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
          .getRepository(KakaoChannelEntity)
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
          .into(KakaoChannelEntity)
          .values({
            kakaoId: channel.channelId.toString(),
            type: channel.info.type,
            name: channel.getDisplayName(),
            coverUrl: channel.info.openLink.linkCoverURL,
          })
          .execute();

        const users: QueryDeepPartialEntity<KakaoUserEntity>[] = [];

        for (const user of channel.getAllUserInfo()) {
          users.push({
            kakaoId: user.userId.toString(),
            perm: user.perm,
            type: user.userType,
            name: user.nickname,
            profileImageUrl: user.fullProfileURL,
            channelId: result.identifiers[0].id,
          });
        }

        await transactionManager
          .createQueryBuilder()
          .insert()
          .into(KakaoUserEntity)
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
