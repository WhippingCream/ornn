import {
  KnownChatType,
  OpenChannelUserPerm,
  ReplyAttachment,
  TalkChatData,
  TalkOpenChannel,
} from 'node-kakao';

import { Injectable } from '@nestjs/common';
import { KakaoOpenCommand } from './base.command';

@Injectable()
export class GetReadersCommand extends KakaoOpenCommand {
  constructor() {
    super({
      command: 'get-readers',
      aliases: ['읽은사람'],
      roles: [OpenChannelUserPerm.OWNER, OpenChannelUserPerm.MANAGER],
    });
  }

  execute = (data: TalkChatData, channel: TalkOpenChannel) => {
    if (data.originalType !== KnownChatType.REPLY) {
      return channel.sendChat('[Error] Reply 형식이 아닙니다.');
    }

    const reply = data.attachment<ReplyAttachment>();
    const logId = reply.src_logId;

    if (!logId) {
      return channel.sendChat('[Error] 알 수 없는 메시지 입니다.');
    }

    const readers = channel.getReaders({ logId });
    return channel.sendChat(
      `읽은 사람 (총 ${readers.length}명)\n${readers
        .map((reader) => reader.nickname)
        .join(', ')}`,
    );
  };
}
