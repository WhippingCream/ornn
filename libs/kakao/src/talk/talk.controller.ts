import { ModelBaseController } from '@db/base/base.controller';
import {
  BadRequestException,
  Controller,
  ForbiddenException,
  InternalServerErrorException,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { encode } from 'js-base64';
import { AuthApiClient } from 'node-kakao';
import { KakaoCredentialService } from '../credentials/credentials.service';
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
