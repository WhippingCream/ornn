import { ModelBaseController } from '@lib/db/base/base.controller';
import { DiscordWebhookService } from '@lib/utils/webhook/discord-webhook.service';
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
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { ApiTags } from '@nestjs/swagger';
import { encode } from 'js-base64';
import {
  AsyncCommandResult,
  AuthApiClient,
  LoginResult,
  ChannelUserInfo,
  ChatFeeds,
  InformedOpenLink,
  KnownChatType,
  OpenChannelUserInfo,
  OpenLink,
  OpenLinkChannelUserInfo,
  SetChannelMeta,
  TalkChannel,
  TalkChatData,
  TalkOpenChannel,
  TypedChatlog,
  Long,
  ChatBuilder,
  MentionContent,
  ReplyContent,
  OpenChannelUserPerm,
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
    protected configService: ConfigService,
    protected discordWebhookService: DiscordWebhookService,
  ) {
    super();

    this.talkService.client.on(
      'chat',
      async (data: TalkChatData, channel: TalkChannel): Promise<void> => {
        const sender = data.getSenderInfo(channel);
        if (!sender) return;

        if (data.text.charAt(0) === '/') {
          try {
            const { isHelp, command, args } = this.talkService.parseCommand(
              data,
              channel,
            );

            if (!command) {
              return;
            }

            if (isHelp) {
              channel.sendChat(
                new ChatBuilder()
                  .append(new ReplyContent(data.chat))
                  .text(
                    command
                      ? (command.helpMessage as string)
                      : '없는 명령어 입니다.',
                  )
                  .build(KnownChatType.REPLY),
              );
            } else {
              const verifiedArgs = this.talkService.validateCommandArguments(
                command,
                args,
              );
              command.execute(data, channel, verifiedArgs);
            }
          } catch (err) {
            channel.sendChat(
              new ChatBuilder()
                .append(new ReplyContent(data.chat))
                .text(`⚠️ ${err.message}`)
                .build(KnownChatType.REPLY),
            );
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
      this.discordWebhookService.error({
        name: 'Elise Bot',
        title: 'Error',
        text: `\`\`\`json\n${JSON.stringify(err, null, 2)}\n\`\`\``,
      });
    });

    this.talkService.client.on('switch_server', (): void => {
      this.discordWebhookService.warning({
        name: 'Elise Bot',
        title: 'Switch Server',
      });
    });

    this.talkService.client.on('disconnected', (reason: number): void => {
      this.discordWebhookService.error({
        name: 'Elise Bot',
        title: 'Disconnected',
        text: `(reason: ${reason})`,
      });
    });

    this.talkService.client.on(
      'chat_deleted',
      async (
        feedChatlog: Readonly<TypedChatlog<KnownChatType.FEED>>,
        channel: TalkChannel,
        // feed: DeleteAllFeed,
      ): Promise<void> => {
        const userInfo = channel.getUserInfo(feedChatlog.sender);
        const logId = Long.fromNumber(
          JSON.parse(feedChatlog.text as string).logId,
        );
        const chat = await channel.chatListStore.get(logId);
        this.discordWebhookService.info({
          name: 'Elise Bot',
          title: 'Chat Deleted',
          author: {
            author: userInfo?.nickname ?? 'unknown',
            iconURL: userInfo?.profileURL,
          },
          fields: [
            {
              title: 'Deleted Message',
              value: `${chat?.text}`,
              inline: false,
            },
          ],
          footer: {
            footer: channel.getDisplayName(),
            footerIcon:
              'https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/service/453a624d017900001.png',
          },
        });
      },
    );

    this.talkService.client.on(
      'link_created',
      (link: InformedOpenLink): void => {
        this.discordWebhookService.info({
          name: 'Elise Bot',
          title: 'Link Created',
          text: `(url: ${link.openLink.linkURL})`,
          footer: {
            footer: link.openLink.linkName,
            footerIcon:
              'https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/service/453a624d017900001.png',
          },
        });
      },
    );

    this.talkService.client.on(
      'link_deleted',
      (link: InformedOpenLink): void => {
        this.discordWebhookService.info({
          name: 'Elise Bot',
          title: 'Link Deleted',
          text: `(url: ${link.openLink.linkURL})`,
          footer: {
            footer: link.openLink.linkName,
            footerIcon:
              'https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/service/453a624d017900001.png',
          },
        });
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
        this.discordWebhookService.info({
          name: 'Elise Bot',
          title: 'User Join',
          author: {
            author: user.nickname,
            iconURL: user.profileURL,
          },
          footer: {
            footer: channel.getDisplayName(),
            footerIcon:
              'https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/service/453a624d017900001.png',
          },
        });
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
        this.discordWebhookService.info({
          name: 'Elise Bot',
          title: 'User Left',
          author: {
            author: user.nickname,
            iconURL: user.profileURL,
          },
          footer: {
            footer: channel.getDisplayName(),
            footerIcon:
              'https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/service/453a624d017900001.png',
          },
        });
      },
    );

    this.talkService.client.on(
      'profile_changed',
      (
        channel: TalkOpenChannel,
        lastInfo: OpenChannelUserInfo,
        user: OpenLinkChannelUserInfo,
      ): void => {
        this.discordWebhookService.info({
          name: 'Elise Bot',
          title: 'Profile Changed',
          author: {
            author: lastInfo.nickname,
            iconURL: lastInfo.profileURL,
          },
          fields: [
            {
              title: 'Change Log',
              value: `\`\`\`json\n${JSON.stringify(
                {
                  from: lastInfo.nickname,
                  to: user.nickname,
                },
                null,
                2,
              )}\n\`\`\``,
            },
          ],
          footer: {
            footer: channel.getDisplayName(),
            footerIcon:
              'https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/service/453a624d017900001.png',
          },
        });
      },
    );

    this.talkService.client.on(
      'perm_changed',
      (
        channel: TalkOpenChannel,
        lastInfo: OpenChannelUserInfo,
        user: OpenChannelUserInfo,
      ): void => {
        const permToString = (perm: OpenChannelUserPerm) => {
          switch (perm) {
            case OpenChannelUserPerm.OWNER:
              return 'Owner';
            case OpenChannelUserPerm.MANAGER:
              return 'Manager';
            case OpenChannelUserPerm.BOT:
              return 'Bot';
            case OpenChannelUserPerm.NONE:
              return 'Member';
          }
        };
        this.discordWebhookService.info({
          name: 'Elise Bot',
          title: 'Permission Changed',
          author: {
            author: channel.info.openLink?.linkOwner.nickname as string,
            iconURL: channel.info.openLink?.linkOwner.profileURL as string,
          },
          fields: [
            {
              title: 'Change Log',
              value: `\`\`\`json\n${JSON.stringify(
                {
                  user: user.nickname,
                  from: permToString(lastInfo.perm),
                  to: permToString(user.perm),
                },
                null,
                2,
              )}\n\`\`\``,
            },
          ],
          footer: {
            footer: channel.getDisplayName(),
            footerIcon:
              'https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/service/453a624d017900001.png',
          },
        });
      },
    );

    this.talkService.client.on('channel_join', (channel: TalkChannel): void => {
      this.discordWebhookService.info({
        name: 'Elise Bot',
        title: 'Channel Join',
        footer: {
          footer: channel.getDisplayName(),
          footerIcon:
            'https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/service/453a624d017900001.png',
        },
      });
    });

    this.talkService.client.on('channel_left', (channel: TalkChannel): void => {
      this.discordWebhookService.info({
        name: 'Elise Bot',
        title: 'Channel Left',
        footer: {
          footer: channel.getDisplayName(),
          footerIcon:
            'https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/service/453a624d017900001.png',
        },
      });
    });

    this.talkService.client.on(
      'message_hidden',
      async (
        hideLog: Readonly<TypedChatlog<KnownChatType.FEED>>,
        channel: TalkOpenChannel,
        // feed: OpenRewriteFeed,
      ): Promise<void> => {
        const author = channel.getUserInfo(hideLog.sender);
        const logId = Long.fromNumber(JSON.parse(hideLog.text as string).logId);
        const chat = await channel.chatListStore.get(logId);
        const userInfo = chat
          ? channel.getUserInfo({
              userId: chat?.sender.userId,
            })
          : null;
        this.discordWebhookService.info({
          name: 'Elise Bot',
          title: 'Message Hidden',
          author: {
            author: author?.nickname ?? 'unknown',
            iconURL: author?.profileURL,
          },
          fields: [
            {
              title: 'Deleted Message Sender',
              value: `${userInfo?.nickname ?? 'Not text'}`,
              inline: false,
            },
            {
              title: 'Deleted Message',
              value: `${chat?.text}`,
              inline: false,
            },
          ],
          footer: {
            footer: channel.getDisplayName(),
            footerIcon:
              'https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/service/453a624d017900001.png',
          },
        });
      },
    );

    this.talkService.client.on(
      'channel_link_deleted',
      (
        feedLog: Readonly<TypedChatlog<KnownChatType.FEED>>,
        channel: TalkOpenChannel,
        // feed: OpenLinkDeletedFeed,
      ): void => {
        this.discordWebhookService.warning({
          name: 'Elise Bot',
          title: 'Channel Link Deleted',
          footer: {
            footer: channel.getDisplayName(),
            footerIcon:
              'https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/service/453a624d017900001.png',
          },
        });
      },
    );

    this.talkService.client.on(
      'host_handover',
      (channel: TalkOpenChannel, lastLink: OpenLink, link: OpenLink): void => {
        this.discordWebhookService.info({
          name: 'Elise Bot',
          title: 'Host Handover',
          author: {
            author: lastLink.linkOwner.nickname,
            iconURL: lastLink.linkOwner.profileURL,
          },
          fields: [
            { title: 'From', value: `${lastLink.linkOwner.nickname}` },
            { title: 'To', value: `${link.linkOwner.nickname}` },
          ],
          footer: {
            footer: channel.getDisplayName(),
            footerIcon:
              'https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/service/453a624d017900001.png',
          },
        });
      },
    );

    this.talkService.client.on(
      'channel_kicked',
      (
        kickedLog: Readonly<TypedChatlog<KnownChatType.FEED>>,
        channel: TalkOpenChannel,
        // feed: OpenKickFeed,
      ): void => {
        this.discordWebhookService.warning({
          name: 'Elise Bot',
          title: 'Channel Kicked',
          footer: {
            footer: channel.getDisplayName(),
            footerIcon:
              'https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/service/453a624d017900001.png',
          },
        });
      },
    );

    this.talkService.client.on(
      'meta_change',
      (
        channel: TalkOpenChannel,
        type: number,
        newMeta: SetChannelMeta,
      ): void => {
        const userInfo = channel.getUserInfo({
          userId: newMeta.authorId,
        });
        this.discordWebhookService.info({
          name: 'Elise Bot',
          title: 'Channel Meta Changed',
          author: {
            author: userInfo?.nickname ?? 'unknown',
            iconURL: userInfo?.profileURL,
          },
          fields: [
            {
              title: 'New Meta',
              value: newMeta.content,
            },
          ],
          footer: {
            footer: channel.getDisplayName(),
            footerIcon:
              'https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/service/453a624d017900001.png',
          },
        });
      },
    );

    this.talkService.client.on(
      'chat_event',
      (
        channel: TalkOpenChannel,
        author: OpenChannelUserInfo,
        type: number,
        count: number,
        // chat: ChatLoggedType,
      ): void => {
        this.discordWebhookService.info({
          name: 'Elise Bot',
          title: 'Chat Event',
          author: {
            author: author.nickname,
            iconURL: author.profileURL,
          },
          fields: [
            {
              title: 'How many touched',
              value: `${count} times`,
            },
          ],
          footer: {
            footer: channel.getDisplayName(),
            footerIcon:
              'https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/service/453a624d017900001.png',
          },
        });
      },
    );

    if (configService.get('KAKAO_BOT_AUTO_SIGN_IN') !== '0') {
      this._login()
        .then((result) => {
          if (result.success) {
            Logger.log('[Kakao] Success to auto login!');
          }
        })
        .catch((reason) => {
          Logger.warn(`[Kakao] Fail to auto login(${reason})!`);
        });
    } else {
      Logger.warn(
        '[Kakao] Auto login is disabled, check env[KAKAO_BOT_AUTO_SIGN_IN]!',
      );
    }
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
              openLink,
            } = _channel.info;

            const userList = displayUserList.map(({ userId, nickname }) => ({
              id: userId.toString(),
              nickname,
            }));

            channels.push({
              id: channelId.toString(),
              activeUserCount,
              linkId: openLink?.linkId.toString(),
              linkName: openLink?.linkName,
              linkURL: openLink?.linkURL,
              searchable: openLink?.searchable,
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
    const credential = await this.credentialService.getOne(1);

    if (!credential || !credential.email || !credential.password) {
      throw new ForbiddenException({
        message: 'Email and password is not existed',
      });
    }

    const api = await AuthApiClient.create(
      credential.clientName,
      encode(credential.deviceId),
    );

    const loginRes = await api.login({
      email: credential.email,
      password: credential.password,

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

    const res = await this._login();

    if (!res.success) {
      throw new InternalServerErrorException(
        `Login failed with status: ${res.status}`,
      );
    }
  }

  @Put('message')
  async message(@Body() dto: SendMessageDto): Promise<void> {
    const channel = this.talkService.client.channelList.get(
      Long.fromString(dto.channelId),
    );

    if (!channel) {
      throw new Error('채널 정보를 가져오는데 실패했습니다.');
    }

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

          if (!userInfo) {
            throw new Error('유저 정보를 가져오는데 실패하였습니다.');
          }

          chatBuilder.append(new MentionContent(userInfo));
        }
      }
    });

    channel.sendChat(chatBuilder.build(KnownChatType.TEXT));
  }

  @Cron('0 */5 * * * *') // every 5 minutes
  logonStatusMonitor() {
    const { logon } = this.talkService.client;
    this.discordWebhookService.info({
      name: 'Elise Bot',
      fields: [
        {
          title: 'Is activated?',
          value: `${logon}`,
        },
      ],
    });
  }
}
