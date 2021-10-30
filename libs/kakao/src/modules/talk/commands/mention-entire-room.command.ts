import {
  ChatBuilder,
  KnownChatType,
  MentionContent,
  OpenChannelUserPerm,
  TalkChatData,
  TalkOpenChannel,
} from 'node-kakao';

import { Injectable } from '@nestjs/common';
import { KakaoOpenCommand } from './base.command';

@Injectable()
export class MentionEntireRoomCommand extends KakaoOpenCommand {
  constructor() {
    super({
      command: 'mention-entire-room',
      aliases: ['전체호출'],

      roles: [OpenChannelUserPerm.OWNER, OpenChannelUserPerm.MANAGER],
      helpMessage: '/전체호출 M\n - M: 전달할 메시지',
    });
  }

  execute = async (
    data: TalkChatData,
    channel: TalkOpenChannel,
    args: [string],
  ) => {
    const chatBuilder = new ChatBuilder().text(`${args[0]}\n\n`);

    for (const user of channel.getAllUserInfo()) {
      chatBuilder.append(new MentionContent(user)).text(' ');
    }

    channel.sendChat(chatBuilder.build(KnownChatType.TEXT));

    return null;
  };
}
