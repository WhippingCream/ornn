import {
  ChatBuilder,
  KnownChatType,
  MentionContent,
  OpenChannelUserPerm,
  ReplyContent,
  TalkChatData,
  TalkOpenChannel,
} from 'node-kakao';
import { COMMAND_ARGUMENT_TYPE, KakaoOpenCommand } from './base.command';

export class MentionEntireRoomCommand extends KakaoOpenCommand {
  constructor() {
    super({
      command: 'mention-entire-room',
      aliases: ['전체호출'],
      argOptions: [
        {
          type: COMMAND_ARGUMENT_TYPE.STRING,
          optional: false,
        },
      ],
      roles: [OpenChannelUserPerm.OWNER, OpenChannelUserPerm.MANAGER],
    });
  }

  execute = async (
    data: TalkChatData,
    channel: TalkOpenChannel,
    args: [string],
  ) => {
    const chatBuilder = new ChatBuilder().text(`${args[0]}\n\n`);

    try {
      for (const user of channel.getAllUserInfo()) {
        chatBuilder.append(new MentionContent(user)).text(' ');
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
