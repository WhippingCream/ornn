import { ModelBaseController } from '@db/base/base.controller';
import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { encode } from 'js-base64';
import { AuthApiClient, TalkOpenChannel } from 'node-kakao';
import { KakaoCredentialService } from '../credentials/credentials.service';
import {
  GetKakaoStatusResponseDto,
  SimpleChannelDto,
} from './dto/get.status.response.dto';
import { KakaoTalkService } from './talk.service';

@ApiTags('카카오 톡 기능 v1')
@Controller('/api/v1/kakao/talk')
export class KakaoTalkController extends ModelBaseController {
  constructor(
    protected credentialService: KakaoCredentialService,
    protected talkService: KakaoTalkService,
  ) {
    super();
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

  @Put('login')
  async login(): Promise<void> {
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

    if (this.talkService.client.logon) {
      throw new BadRequestException({
        message: 'Already logged on',
      });
    }

    if (!loginRes.success) {
      throw new BadRequestException(
        `Web login failed with status: ${loginRes.status}`,
      );
    }

    try {
      const res = await this.talkService.client.login(loginRes.result);

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
}
