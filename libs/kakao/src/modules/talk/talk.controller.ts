import { ModelBaseController } from '@db/base/base.controller';
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  Logger,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { encode } from 'js-base64';
import {
  AsyncCommandResult,
  AuthApiClient,
  LoginResult,
  ChannelUserInfo,
  ChatFeeds,
  ChatLoggedType,
  DeleteAllFeed,
  InformedOpenLink,
  KnownChatType,
  OpenChannelUserInfo,
  OpenKickFeed,
  OpenLink,
  OpenLinkChannelUserInfo,
  OpenLinkDeletedFeed,
  OpenRewriteFeed,
  SetChannelMeta,
  TalkChannel,
  TalkChatData,
  TalkOpenChannel,
  TypedChatlog,
  Long,
  ChatBuilder,
  MentionContent,
} from 'node-kakao';
import { KakaoCredentialService } from '../credentials/credentials.service';
import {
  GetKakaoStatusResponseDto,
  SimpleChannelDto,
} from './dto/get.status.response.dto';
import { SendMessageDto } from './dto/send.message.dto';
import { KakaoTalkService } from './talk.service';

@ApiTags('카카오 톡 기능 v1')
@Controller('/api/v1/kakao/talk')
export class KakaoTalkController extends ModelBaseController {
  constructor(
    protected credentialService: KakaoCredentialService,
    protected talkService: KakaoTalkService,
  ) {
    super();

    this.talkService.client.on(
      'chat',
      async (data: TalkChatData, channel: TalkChannel): Promise<void> => {
        const sender = data.getSenderInfo(channel);
        if (!sender) return;

        switch (data.text.charAt(0)) {
          case '!': {
            await this.talkService.runCommand(data, channel);
            break;
          }
          case '?': {
            await this.talkService.showCommandHelp(data, channel);
          }
        }

        // Logger.debug(
        //   [
        //     '[Kakao] channel: ',
        //     channel.info.channelId,
        //     channel.info.type,
        //     channel.getDisplayName(),
        //   ].join(' '),
        // );
        // Logger.debug(
        //   [
        //     '[Kakao] sender: ',
        //     sender.userId,
        //     sender.userType,
        //     sender.nickname,
        //   ].join(' '),
        // );
        // Logger.debug(
        //   [
        //     '[Kakao] chat: ',
        //     data.chat.type,
        //     data.chat.messageId,
        //     data.chat.text,
        //   ].join(' '),
        // );
        // Logger.debug(
        //   [
        //     '[Kakao] attachment: ',
        //     data.chat.attachment?.mentions,
        //     data.chat.supplement,
        //   ].join(' '),
        // );
      },
    );

    this.talkService.client.on('error', (err: unknown): void => {
      Logger.error(`[Kakao] Client error!! err: ${err}`);
    });

    this.talkService.client.on('switch_server', (): void => {
      Logger.log('[Kakao] Server switching requested.');
      this._login()
        .then((result) => {
          if (result.success) {
            Logger.log('[Kakao] Success to auto login!');
          }
        })
        .catch((reason) => {
          Logger.warn(`[Kakao] Fail to auto login(${reason})!`);
        });
    });

    this.talkService.client.on('disconnected', (reason: number): void => {
      Logger.error(`[Kakao] Disconnected!! reason: ${reason}`);
      this._login()
        .then((result) => {
          if (result.success) {
            Logger.log('[Kakao] Success to auto login!');
          }
        })
        .catch((reason) => {
          Logger.warn(`[Kakao] Fail to auto login(${reason})!`);
        });
    });

    this.talkService.client.on(
      'chat_deleted',
      (
        feedChatlog: Readonly<TypedChatlog<KnownChatType.FEED>>,
        channel: TalkChannel,
        feed: DeleteAllFeed,
      ): void => {
        Logger.log(
          `[Kakao] ${feed.logId} deleted by ${feedChatlog.sender.userId}`,
        );
      },
    );

    this.talkService.client.on(
      'link_created',
      (link: InformedOpenLink): void => {
        Logger.log(
          `[Kakao] Link created: ${link.openLink.linkId} url: ${link.openLink.linkURL}`,
        );
      },
    );

    this.talkService.client.on(
      'link_deleted',
      (link: InformedOpenLink): void => {
        Logger.log(
          `[Kakao] Link deleted: ${link.openLink.linkId} url: ${link.openLink.linkURL}`,
        );
      },
    );

    this.talkService.client.on(
      'user_join',
      (
        joinLog: Readonly<TypedChatlog<KnownChatType.FEED>>,
        channel: TalkChannel,
        user: ChannelUserInfo,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        feed: ChatFeeds,
      ): void => {
        Logger.log(
          `[Kakao] User ${user.nickname} (${user.userId}) joined channel ${channel.channelId}`,
        );
      },
    );

    this.talkService.client.on(
      'user_left',
      (
        leftLog: Readonly<TypedChatlog<KnownChatType.FEED>>,
        channel: TalkChannel,
        user: ChannelUserInfo,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        feed: ChatFeeds,
      ): void => {
        Logger.log(
          `[Kakao] User ${user.nickname} (${user.userId}) left channel ${channel.channelId}`,
        );
      },
    );

    this.talkService.client.on(
      'profile_changed',
      (
        channel: TalkOpenChannel,
        lastInfo: OpenChannelUserInfo,
        user: OpenLinkChannelUserInfo,
      ): void => {
        Logger.log(
          `[Kakao] Profile of ${user.userId} changed. From name: ${lastInfo.nickname} profile: ${lastInfo.profileURL}`,
        );
      },
    );

    this.talkService.client.on(
      'perm_changed',
      (
        channel: TalkOpenChannel,
        lastInfo: OpenChannelUserInfo,
        user: OpenChannelUserInfo,
      ): void => {
        Logger.log(
          `[Kakao] Perm of ${user.userId} changed. From ${lastInfo.perm} to ${user.perm}`,
        );
      },
    );

    this.talkService.client.on('channel_join', (channel: TalkChannel): void => {
      Logger.log(`[Kakao] Joining channel ${channel.getDisplayName()}`);
    });

    this.talkService.client.on('channel_left', (channel: TalkChannel): void => {
      Logger.log(`[Kakao] Leaving channel ${channel.getDisplayName()}`);
    });

    this.talkService.client.on(
      'message_hidden',
      (
        hideLog: Readonly<TypedChatlog<KnownChatType.FEED>>,
        channel: TalkOpenChannel,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        feed: OpenRewriteFeed,
      ): void => {
        Logger.log(
          `[Kakao] Message ${hideLog.logId} hid from ${channel.channelId} by ${hideLog.sender.userId}`,
        );
      },
    );

    this.talkService.client.on(
      'channel_link_deleted',
      (
        feedLog: Readonly<TypedChatlog<KnownChatType.FEED>>,
        channel: TalkOpenChannel,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        feed: OpenLinkDeletedFeed,
      ): void => {
        Logger.log(
          `[Kakao] Open channel (${channel.channelId}) link has been deleted`,
        );
      },
    );

    this.talkService.client.on(
      'host_handover',
      (channel: TalkOpenChannel, lastLink: OpenLink, link: OpenLink): void => {
        const lastOwnerNick = lastLink.linkOwner.nickname;
        const newOwnerNick = link.linkOwner.nickname;

        Logger.log(
          `[Kakao] OpenLink host handover on channel ${channel.channelId} from ${lastOwnerNick} to ${newOwnerNick}`,
        );
      },
    );

    this.talkService.client.on(
      'channel_kicked',
      (
        kickedLog: Readonly<TypedChatlog<KnownChatType.FEED>>,
        channel: TalkOpenChannel,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        feed: OpenKickFeed,
      ): void => {
        Logger.log(`[Kakao] Kicked from channel ${channel.channelId}`);
      },
    );
    this.talkService.client.on(
      'meta_change',
      (
        channel: TalkOpenChannel,
        type: number,
        newMeta: SetChannelMeta,
      ): void => {
        Logger.log(
          `[Kakao] Meta changed from ${channel.channelId} type: ${type} meta: ${newMeta.content} by ${newMeta.authorId}`,
        );
      },
    );

    this.talkService.client.on(
      'chat_event',
      (
        channel: TalkOpenChannel,
        author: OpenChannelUserInfo,
        type: number,
        count: number,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        chat: ChatLoggedType,
      ): void => {
        channel.sendChat(`${author.nickname} touched hearts ${count} times`);
      },
    );

    this._login()
      .then((result) => {
        if (result.success) {
          Logger.log('[Kakao] Success to auto login!');
        }
      })
      .catch((reason) => {
        Logger.warn(`[Kakao] Fail to auto login(${reason})!`);
      });
  }

  @Get('status')
  async getStatus(): Promise<GetKakaoStatusResponseDto> {
    const { logon } = this.talkService.client;

    if (logon) {
      const { channelList } = this.talkService.client;
      const channels: SimpleChannelDto[] = [];

      for (const channel of channelList.all()) {
        if (channel.info.type === 'OM') {
          const _channel = channelList.get(channel.channelId);

          if (_channel instanceof TalkOpenChannel) {
            const {
              channelId,
              activeUserCount,
              displayUserList,
              openLink: { linkId, linkName, linkURL, searchable },
            } = _channel.info;

            const userList = displayUserList.map(({ userId, nickname }) => ({
              id: userId.toString(),
              nickname,
            }));

            channels.push({
              id: channelId.toString(),
              activeUserCount,
              linkId: linkId.toString(),
              linkName,
              linkURL,
              searchable,
              userList,
            });
          }
        }
      }

      return { logon, channels };
    }

    return { logon };
  }

  async _login(): AsyncCommandResult<LoginResult> {
    const {
      email,
      password,
      clientName,
      deviceId,
    } = await this.credentialService.getOne(1);

    if (!email || !password) {
      throw new ForbiddenException({
        message: 'Email and password is not existed',
      });
    }

    const api = await AuthApiClient.create(clientName, encode(deviceId));
    const loginRes = await api.login({
      email,
      password,

      // This option force login even other devices are logon
      forced: true,
    });

    if (!loginRes.success) {
      throw new BadRequestException(
        `Web login failed with status: ${loginRes.status}`,
      );
    }

    return await this.talkService.client.login(loginRes.result);
  }

  @Put('login')
  async login(): Promise<void> {
    if (this.talkService.client.logon) {
      throw new BadRequestException({
        message: 'Already logged on',
      });
    }

    try {
      const res = await this._login();

      if (!res.success) {
        throw new Error(`Login failed with status: ${res.status}`);
      }
    } catch (err) {
      throw new InternalServerErrorException({
        message: 'register device failed',
        err,
      });
    }
  }

  @Put('message')
  async message(@Body() dto: SendMessageDto): Promise<void> {
    const channel = this.talkService.client.channelList.get(
      Long.fromString(dto.channelId),
    );

    const chatBuilder = new ChatBuilder();

    dto.tokens.forEach(({ type, content }) => {
      switch (type) {
        case 'text': {
          chatBuilder.text(content);
          break;
        }
        case 'mention': {
          const userInfo = channel.getUserInfo({
            userId: Long.fromString(content),
          });

          chatBuilder.append(new MentionContent(userInfo));
        }
      }
    });

    channel.sendChat(chatBuilder.build(KnownChatType.TEXT));
  }
}
