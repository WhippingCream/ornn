/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import {
  ChannelUserInfo,
  ChatFeeds,
  ChatLoggedType,
  DeleteAllFeed,
  InformedOpenLink,
  KnownChatType,
  OpenChannelUserInfo,
  OpenChannelUserPerm,
  OpenKickFeed,
  OpenLink,
  OpenLinkChannelUserInfo,
  OpenLinkDeletedFeed,
  OpenRewriteFeed,
  ReplyAttachment,
  SetChannelMeta,
  TalkChannel,
  TalkChatData,
  TalkClient,
  TalkOpenChannel,
  TypedChatlog,
} from 'node-kakao';

@Injectable()
export class KakaoTalkService {
  constructor() {
    this.client = new TalkClient();

    this.client.on('chat', (data: TalkChatData, channel: TalkChannel): void => {
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

      Logger.debug(
        [
          'channel: ',
          channel.info.channelId,
          channel.info.type,
          channel.getDisplayName(),
        ].join(' '),
      );
      Logger.debug(
        ['sender: ', sender.userId, sender.userType, sender.nickname].join(' '),
      );
      Logger.debug(
        ['chat: ', data.chat.type, data.chat.messageId, data.chat.text].join(
          ' ',
        ),
      );
      Logger.debug(
        [
          'attachment: ',
          data.chat.attachment.mentions,
          data.chat.supplement,
        ].join(' '),
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

    this.client.on('error', (err: unknown): void => {
      Logger.error(`Client error!! err: ${err}`);
    });

    this.client.on('switch_server', (): void => {
      Logger.log('Server switching requested.');
    });

    this.client.on('disconnected', (reason: number): void => {
      Logger.error(`Disconnected!! reason: ${reason}`);
    });

    this.client.on(
      'chat_deleted',
      (
        feedChatlog: Readonly<TypedChatlog<KnownChatType.FEED>>,
        channel: TalkChannel,
        feed: DeleteAllFeed,
      ): void => {
        Logger.log(`${feed.logId} deleted by ${feedChatlog.sender.userId}`);
      },
    );

    this.client.on('link_created', (link: InformedOpenLink): void => {
      Logger.log(
        `Link created: ${link.openLink.linkId} url: ${link.openLink.linkURL}`,
      );
    });

    this.client.on('link_deleted', (link: InformedOpenLink): void => {
      Logger.log(
        `Link deleted: ${link.openLink.linkId} url: ${link.openLink.linkURL}`,
      );
    });

    this.client.on(
      'user_join',
      (
        joinLog: Readonly<TypedChatlog<KnownChatType.FEED>>,
        channel: TalkChannel,
        user: ChannelUserInfo,
        feed: ChatFeeds,
      ): void => {
        Logger.log(
          `User ${user.nickname} (${user.userId}) joined channel ${channel.channelId}`,
        );
      },
    );

    this.client.on(
      'user_left',
      (
        leftLog: Readonly<TypedChatlog<KnownChatType.FEED>>,
        channel: TalkChannel,
        user: ChannelUserInfo,
        feed: ChatFeeds,
      ): void => {
        Logger.log(
          `User ${user.nickname} (${user.userId}) left channel ${channel.channelId}`,
        );
      },
    );

    this.client.on(
      'profile_changed',
      (
        channel: TalkOpenChannel,
        lastInfo: OpenChannelUserInfo,
        user: OpenLinkChannelUserInfo,
      ): void => {
        Logger.log(
          `Profile of ${user.userId} changed. From name: ${lastInfo.nickname} profile: ${lastInfo.profileURL}`,
        );
      },
    );

    this.client.on(
      'perm_changed',
      (
        channel: TalkOpenChannel,
        lastInfo: OpenChannelUserInfo,
        user: OpenChannelUserInfo,
      ): void => {
        Logger.log(
          `Perm of ${user.userId} changed. From ${lastInfo.perm} to ${user.perm}`,
        );
      },
    );

    this.client.on('channel_join', (channel: TalkChannel): void => {
      Logger.log(`Joining channel ${channel.getDisplayName()}`);
    });

    this.client.on('channel_left', (channel: TalkChannel): void => {
      Logger.log(`Leaving channel ${channel.getDisplayName()}`);
    });

    this.client.on(
      'message_hidden',
      (
        hideLog: Readonly<TypedChatlog<KnownChatType.FEED>>,
        channel: TalkOpenChannel,
        feed: OpenRewriteFeed,
      ): void => {
        Logger.log(
          `Message ${hideLog.logId} hid from ${channel.channelId} by ${hideLog.sender.userId}`,
        );
      },
    );

    this.client.on(
      'channel_link_deleted',
      (
        feedLog: Readonly<TypedChatlog<KnownChatType.FEED>>,
        channel: TalkOpenChannel,
        feed: OpenLinkDeletedFeed,
      ): void => {
        Logger.log(`Open channel (${channel.channelId}) link has been deleted`);
      },
    );

    this.client.on(
      'host_handover',
      (channel: TalkOpenChannel, lastLink: OpenLink, link: OpenLink): void => {
        const lastOwnerNick = lastLink.linkOwner.nickname;
        const newOwnerNick = link.linkOwner.nickname;

        Logger.log(
          `OpenLink host handover on channel ${channel.channelId} from ${lastOwnerNick} to ${newOwnerNick}`,
        );
      },
    );

    this.client.on(
      'channel_kicked',
      (
        kickedLog: Readonly<TypedChatlog<KnownChatType.FEED>>,
        channel: TalkOpenChannel,
        feed: OpenKickFeed,
      ): void => {
        Logger.log(`Kicked from channel ${channel.channelId}`);
      },
    );
    this.client.on(
      'meta_change',
      (
        channel: TalkOpenChannel,
        type: number,
        newMeta: SetChannelMeta,
      ): void => {
        Logger.log(
          `Meta changed from ${channel.channelId} type: ${type} meta: ${newMeta.content} by ${newMeta.authorId}`,
        );
      },
    );

    this.client.on(
      'chat_event',
      (
        channel: TalkOpenChannel,
        author: OpenChannelUserInfo,
        type: number,
        count: number,
        chat: ChatLoggedType,
      ): void => {
        channel.sendChat(`${author.nickname} touched hearts ${count} times`);
      },
    );
  }
  client: TalkClient;
}
