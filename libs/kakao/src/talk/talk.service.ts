import { Injectable } from '@nestjs/common';
import {
  KnownChatType,
  OpenChannelUserPerm,
  ReplyAttachment,
  TalkClient,
  TalkOpenChannel,
} from 'node-kakao';

@Injectable()
export class KakaoTalkService {
  constructor() {
    this.client = new TalkClient();

    this.client.on('chat', (data, channel) => {
      const sender = data.getSenderInfo(channel);
      if (!sender) return;

      let isStaff = false;

      if (channel.info.type === 'OM') {
        const _channel = this.client.channelList.get(channel.channelId);
        if (_channel instanceof TalkOpenChannel) {
          const openUserInfo = _channel.getUserInfo(data.chat.sender);
          if (
            openUserInfo.perm === OpenChannelUserPerm.MANAGER ||
            openUserInfo.perm === OpenChannelUserPerm.OWNER
          ) {
            isStaff = true;
          }
        }
      }

      console.log(
        'channel: ',
        channel.info.channelId,
        channel.info.type,
        // channel.getName(),
        channel.getDisplayName(),
      );
      console.log('sender: ', sender.userId, sender.userType, sender.nickname);
      console.log(
        'chat: ',
        data.chat.type,
        data.chat.messageId,
        data.chat.text,
      );
      console.log(
        'attachment: ',
        data.chat.attachment.mentions,
        data.chat.supplement,
      );

      if (data.text === '!staff') {
        channel.sendChat(isStaff ? '운영진입니다.' : '일반 유저 입니다.');
      }

      if (
        data.originalType === KnownChatType.REPLY &&
        data.text === '!readers'
      ) {
        const reply = data.attachment<ReplyAttachment>();
        const logId = reply.src_logId;
        if (logId) {
          const readers = channel.getReaders({ logId });
          channel.sendChat(
            `${logId} Readers (${readers.length})\n${readers
              .map((reader) => reader.nickname)
              .join(', ')}`,
          );
        }
      }
    });

    this.client.on('error', (err) => {
      console.log(`Client error!! err: ${err}`);
    });

    this.client.on('switch_server', () => {
      console.log('Server switching requested.');
    });

    this.client.on('disconnected', (reason) => {
      console.log(`Disconnected!! reason: ${reason}`);
    });

    this.client.on('chat_deleted', (feedChatlog, channel, feed) => {
      console.log(`${feed.logId} deleted by ${feedChatlog.sender.userId}`);
    });

    this.client.on('link_created', (link) => {
      console.log(
        `Link created: ${link.openLink.linkId} url: ${link.openLink.linkURL}`,
      );
    });

    this.client.on('link_deleted', (link) => {
      console.log(
        `Link deleted: ${link.openLink.linkId} url: ${link.openLink.linkURL}`,
      );
    });

    this.client.on('user_join', (joinLog, channel, user, feed) => {
      console.log(
        `User ${user.nickname} (${user.userId}) joined channel ${channel.channelId}`,
      );
    });

    this.client.on('user_left', (leftLog, channel, user, feed) => {
      console.log(
        `User ${user.nickname} (${user.userId}) left channel ${channel.channelId}`,
      );
    });

    this.client.on('profile_changed', (channel, lastInfo, user) => {
      console.log(
        `Profile of ${user.userId} changed. From name: ${lastInfo.nickname} profile: ${lastInfo.profileURL}`,
      );
    });

    this.client.on('perm_changed', (channel, lastInfo, user) => {
      console.log(
        `Perm of ${user.userId} changed. From ${lastInfo.perm} to ${user.perm}`,
      );
    });

    this.client.on('channel_join', (channel) => {
      console.log(`Joining channel ${channel.getDisplayName()}`);
    });

    this.client.on('channel_left', (channel) => {
      console.log(`Leaving channel ${channel.getDisplayName()}`);
    });

    this.client.on('message_hidden', (hideLog, channel, feed) => {
      console.log(
        `Message ${hideLog.logId} hid from ${channel.channelId} by ${hideLog.sender.userId}`,
      );
    });

    this.client.on('channel_link_deleted', (feedLog, channel, feed) => {
      console.log(`Open channel (${channel.channelId}) link has been deleted`);
    });

    this.client.on('host_handover', (channel, lastLink, link) => {
      const lastOwnerNick = lastLink.linkOwner.nickname;
      const newOwnerNick = link.linkOwner.nickname;

      console.log(
        `OpenLink host handover on channel ${channel.channelId} from ${lastOwnerNick} to ${newOwnerNick}`,
      );
    });

    this.client.on('channel_kicked', (kickedLog, channel, feed) => {
      console.log(`Kicked from channel ${channel.channelId}`);
    });

    this.client.on('meta_change', (channel, type, newMeta) => {
      console.log(
        `Meta changed from ${channel.channelId} type: ${type} meta: ${newMeta.content} by ${newMeta.authorId}`,
      );
    });

    this.client.on('chat_event', (channel, author, type, count, chat) => {
      channel.sendChat(`${author.nickname} touched hearts ${count} times`);
    });
  }
  client: TalkClient;
}
