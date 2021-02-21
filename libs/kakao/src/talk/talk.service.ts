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

    this.client.on('chat', this.onChat);
    this.client.on('error', this.onError);
    this.client.on('switch_server', this.onSwitchServer);
    this.client.on('disconnected', this.onDisconnected);
    this.client.on('chat_deleted', this.onChatDeleted);
    this.client.on('link_created', this.onLinkCreated);
    this.client.on('link_deleted', this.onLinkDeleted);
    this.client.on('user_join', this.onUserJoin);
    this.client.on('user_left', this.onUserLeft);
    this.client.on('profile_changed', this.onProfileChanged);
    this.client.on('perm_changed', this.onPermChanged);
    this.client.on('channel_join', this.onChannelJoin);
    this.client.on('channel_left', this.onChannelLeft);
    this.client.on('message_hidden', this.onMessageHidden);
    this.client.on('channel_link_deleted', this.onChannelLinkDeleted);
    this.client.on('host_handover', this.onHostHandover);
    this.client.on('channel_kicked', this.onChannelKicked);
    this.client.on('meta_change', this.onMetaChanged);
    this.client.on('chat_event', this.onChatEvent);
  }
  client: TalkClient;

  onChat(data: TalkChatData, channel: TalkChannel): void {
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

    Logger.log(
      [
        'channel: ',
        channel.info.channelId,
        channel.info.type,
        channel.getDisplayName(),
      ].join(' '),
    );
    Logger.log(
      ['sender: ', sender.userId, sender.userType, sender.nickname].join(' '),
    );
    Logger.log(
      ['chat: ', data.chat.type, data.chat.messageId, data.chat.text].join(' '),
    );
    Logger.log(
      [
        'attachment: ',
        data.chat.attachment.mentions,
        data.chat.supplement,
      ].join(' '),
    );

    if (data.text === '!staff') {
      channel.sendChat(isStaff ? '운영진입니다.' : '일반 유저 입니다.');
    }

    if (data.originalType === KnownChatType.REPLY && data.text === '!readers') {
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
  }

  onError(err: unknown): void {
    Logger.log(`Client error!! err: ${err}`);
  }

  onSwitchServer(): void {
    Logger.log('Server switching requested.');
  }

  onDisconnected(reason: number): void {
    Logger.log(`Disconnected!! reason: ${reason}`);
  }

  onChatDeleted(
    feedChatlog: Readonly<TypedChatlog<KnownChatType.FEED>>,
    channel: TalkChannel,
    feed: DeleteAllFeed,
  ): void {
    Logger.log(`${feed.logId} deleted by ${feedChatlog.sender.userId}`);
  }

  onLinkCreated(link: InformedOpenLink): void {
    Logger.log(
      `Link created: ${link.openLink.linkId} url: ${link.openLink.linkURL}`,
    );
  }

  onLinkDeleted(link: InformedOpenLink): void {
    Logger.log(
      `Link deleted: ${link.openLink.linkId} url: ${link.openLink.linkURL}`,
    );
  }

  onUserJoin(
    joinLog: Readonly<TypedChatlog<KnownChatType.FEED>>,
    channel: TalkChannel,
    user: ChannelUserInfo,
    feed: ChatFeeds,
  ): void {
    Logger.log(
      `User ${user.nickname} (${user.userId}) joined channel ${channel.channelId}`,
    );
  }

  onUserLeft(
    leftLog: Readonly<TypedChatlog<KnownChatType.FEED>>,
    channel: TalkChannel,
    user: ChannelUserInfo,
    feed: ChatFeeds,
  ): void {
    Logger.log(
      `User ${user.nickname} (${user.userId}) left channel ${channel.channelId}`,
    );
  }

  onProfileChanged(
    channel: TalkOpenChannel,
    lastInfo: OpenChannelUserInfo,
    user: OpenLinkChannelUserInfo,
  ): void {
    Logger.log(
      `Profile of ${user.userId} changed. From name: ${lastInfo.nickname} profile: ${lastInfo.profileURL}`,
    );
  }

  onPermChanged(
    channel: TalkOpenChannel,
    lastInfo: OpenChannelUserInfo,
    user: OpenChannelUserInfo,
  ): void {
    Logger.log(
      `Perm of ${user.userId} changed. From ${lastInfo.perm} to ${user.perm}`,
    );
  }

  onChannelJoin(channel: TalkChannel): void {
    Logger.log(`Joining channel ${channel.getDisplayName()}`);
  }

  onChannelLeft(channel: TalkChannel): void {
    Logger.log(`Leaving channel ${channel.getDisplayName()}`);
  }

  onMessageHidden(
    hideLog: Readonly<TypedChatlog<KnownChatType.FEED>>,
    channel: TalkOpenChannel,
    feed: OpenRewriteFeed,
  ): void {
    Logger.log(
      `Message ${hideLog.logId} hid from ${channel.channelId} by ${hideLog.sender.userId}`,
    );
  }

  onChannelLinkDeleted(
    feedLog: Readonly<TypedChatlog<KnownChatType.FEED>>,
    channel: TalkOpenChannel,
    feed: OpenLinkDeletedFeed,
  ): void {
    Logger.log(`Open channel (${channel.channelId}) link has been deleted`);
  }

  onHostHandover(
    channel: TalkOpenChannel,
    lastLink: OpenLink,
    link: OpenLink,
  ): void {
    const lastOwnerNick = lastLink.linkOwner.nickname;
    const newOwnerNick = link.linkOwner.nickname;

    Logger.log(
      `OpenLink host handover on channel ${channel.channelId} from ${lastOwnerNick} to ${newOwnerNick}`,
    );
  }

  onChannelKicked(
    kickedLog: Readonly<TypedChatlog<KnownChatType.FEED>>,
    channel: TalkOpenChannel,
    feed: OpenKickFeed,
  ): void {
    Logger.log(`Kicked from channel ${channel.channelId}`);
  }

  onMetaChanged(
    channel: TalkOpenChannel,
    type: number,
    newMeta: SetChannelMeta,
  ): void {
    Logger.log(
      `Meta changed from ${channel.channelId} type: ${type} meta: ${newMeta.content} by ${newMeta.authorId}`,
    );
  }

  onChatEvent(
    channel: TalkOpenChannel,
    author: OpenChannelUserInfo,
    type: number,
    count: number,
    chat: ChatLoggedType,
  ): void {
    channel.sendChat(`${author.nickname} touched hearts ${count} times`);
  }
}
