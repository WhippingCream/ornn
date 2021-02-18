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
import { Chat, ChatMention, TalkClient } from 'node-kakao';
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

    if (!this.talkService.client) {
      this.talkService.client = new TalkClient(clientName, encode(deviceId));
    }

    if (this.talkService.client.Logon) {
      throw new BadRequestException({
        message: 'Already logged on',
      });
    }

    try {
      await this.talkService.client.login(email, password);
      this.talkService.client.on('message', (chat: Chat) => {
        const userInfo = chat.Channel.getUserInfo(chat.Sender);
        if (!userInfo) return;
        if (chat.Text === '켜졌냐?') {
          chat.replyText('켜졌다! ', new ChatMention(userInfo));
        }
      });
    } catch (err) {
      throw new InternalServerErrorException({
        message: 'register device failed',
        err,
      });
    }
  }

  @Put('logout')
  async logout(): Promise<void> {
    const { email, password } = await this.credentialService.getOne(1);

    if (!email || !password) {
      throw new ForbiddenException({
        message: 'Email and password is not existed',
      });
    }

    if (!this.talkService.client || !this.talkService.client.Logon) {
      throw new BadRequestException({
        message: 'Not logged on yet',
      });
    }

    try {
      await this.talkService.client.logout();
    } catch (err) {
      throw new InternalServerErrorException({
        message: 'register device failed',
        err,
      });
    }
  }
}
