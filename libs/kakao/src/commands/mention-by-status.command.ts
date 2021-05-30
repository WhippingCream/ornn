import { CONNECTION } from '@lib/db/constants/connection';
import { KakaoChannelEntity } from '@lib/db/entities/kakao/channel.entity';
import { KakaoUserEntity } from '@lib/db/entities/kakao/user.entity';
import { USER_LEVEL, USER_STATUS } from '@lib/db/enum';
import {
  ChatBuilder,
  KnownChatType,
  MentionContent,
  OpenChannelUserPerm,
  ReplyContent,
  TalkChatData,
  TalkOpenChannel,
} from 'node-kakao';
import { getManager } from 'typeorm';
import { COMMAND_ARGUMENT_TYPE, KakaoOpenCommand } from './base.command';

const userStatusMap: Map<string, USER_STATUS> = new Map<string, USER_STATUS>([
  ['휴면', USER_STATUS.INACTIVATED],
]);

const userLevelMap: Map<string, USER_LEVEL> = new Map<string, USER_LEVEL>([
  ['신입', USER_LEVEL.NEWBIE],
]);

export class MentionByStatusCommand extends KakaoOpenCommand {
  constructor() {
    super({
      command: 'mention-by-type-room',
      aliases: ['조건부호출'],
      argOptions: [
        {
          type: COMMAND_ARGUMENT_TYPE.STRING,
          optional: false,
        },
        {
          type: COMMAND_ARGUMENT_TYPE.STRING,
          optional: false,
        },
      ],
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
      return channel.sendChat(
        new ChatBuilder()
          .append(new ReplyContent(data.chat))
          .text(`올바른 타입을 입력해 주세요.\n${this.helpMessage}`)
          .build(KnownChatType.REPLY),
      );
    }

    const chatBuilder = new ChatBuilder().text(
      `※ [${typeName}유저] 대상으로 호출 되는 메시지입니다.\n\n${args[1]}\n\n`,
    );
    const targetStatus: USER_STATUS =
      userStatusMap.get(typeName) ?? USER_STATUS.ACTIVATED;
    const targetLevel: USER_LEVEL =
      userLevelMap.get(typeName) ?? USER_LEVEL.MEMBER;

    try {
      const manager = getManager(CONNECTION.DEFAULT_NAME);

      const channelRepository = await manager.getRepository(KakaoChannelEntity);
      const channelEntity = await channelRepository.findOne({
        where: { kakaoId: channel.channelId.toString() },
      });

      if (!channelEntity) {
        return channel.sendChat(
          new ChatBuilder()
            .append(new ReplyContent(data.chat))
            .text(`등록되지 않은 채널(${channel.getDisplayName()}) 입니다.`)
            .build(KnownChatType.REPLY),
        );
      }

      const userRepository = await manager.getRepository(KakaoUserEntity);
      const users = await userRepository.find({
        where: { channelId: channelEntity.id },
        relations: ['channel'],
      });

      for (const user of channel.getAllUserInfo()) {
        if (
          users.findIndex(
            (elem) =>
              elem.kakaoId == user.userId.toString() &&
              elem.status == targetStatus &&
              elem.level == targetLevel,
          ) != -1
        ) {
          chatBuilder.append(new MentionContent(user)).text(' ');
        }
      }
    } catch (e) {
      return channel.sendChat(
        new ChatBuilder()
          .append(new ReplyContent(data.chat))
          .text(e.message)
          .build(KnownChatType.REPLY),
      );
    }

    return channel.sendChat(chatBuilder.build(KnownChatType.TEXT));
  };
}
