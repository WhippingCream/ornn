import { ModelBaseController } from '@db/base/base.controller';
import { KakaoCredentialEntity } from '@db/entities/kakaoTalk/credential.entity';
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  InternalServerErrorException,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { generateString, generateUUID } from '@utils/generators';
import { encode } from 'js-base64';
import { KakaotalkBotService } from 'libs/kakaotalk-bot/src';
import {
  AuthClient,
  Chat,
  ChatMention,
  DefaultConfiguration,
  TalkClient,
} from 'node-kakao';
import { UpdateResult } from 'typeorm';
import { RegisterDeviceKakaoCredentialDto } from './dto/register-device.kakao-credential.dto';
import { UpdateKakaoCredentialDto } from './dto/update.kakao-credential.dto';
import { KakaoCredentialService } from './kakao-credentials.service';

@ApiTags('카카오톡 로그인 제어 v1')
@Controller('/api/v1/kakao/credentials')
export class KakaoCredentialController extends ModelBaseController {
  constructor(
    protected service: KakaoCredentialService,
    protected botService: KakaotalkBotService,
  ) {
    super();
  }

  @Get()
  async find(): Promise<KakaoCredentialEntity> {
    let result = await this.service.getOne(1);
    if (!result) {
      await this.service.createOne({
        deviceId: generateUUID(4),
        clientName: `DESKTOP-${generateString(7)}`,
      });

      result = await this.service.getOne(1);
    }

    return result;
  }

  @Put()
  @HttpCode(204) // no content
  async updateOne(
    @Body() updateDto: UpdateKakaoCredentialDto,
  ): Promise<UpdateResult> {
    const found = await this.service.getOne(1);
    if (!found) {
      return await this.service.createOne({
        deviceId: generateUUID(4),
        clientName: `DESKTOP-${generateString(7)}`,
        ...updateDto,
      });
    }

    return this.service.updateOne(1, updateDto);
  }

  @Put('_request-passcord')
  async requestPasscord(): Promise<void> {
    const { email, password, clientName, deviceId } = await this.service.getOne(
      1,
    );

    if (!email || !password) {
      throw new ForbiddenException({
        message: 'Email and password is not existed',
      });
    }

    try {
      if (!this.botService.authClient) {
        this.botService.authClient = new AuthClient(
          clientName,
          encode(deviceId),
          {
            Configuration: DefaultConfiguration,
          },
        );
      }
      this.botService.authClient.requestPasscode(email, password);
    } catch (err) {
      throw new InternalServerErrorException({
        message: 'request passcord failed',
        err,
      });
    }
  }

  @Put('_register-device')
  async registerDevice(
    @Body() { passcord }: RegisterDeviceKakaoCredentialDto,
  ): Promise<void> {
    const { email, password, clientName, deviceId } = await this.service.getOne(
      1,
    );

    if (!email || !password) {
      throw new ForbiddenException({
        message: 'Email and password is not existed',
      });
    }

    try {
      if (!this.botService.authClient) {
        this.botService.authClient = new AuthClient(
          clientName,
          encode(deviceId),
          {
            Configuration: DefaultConfiguration,
          },
        );
      }
      await this.botService.authClient.registerDevice(
        passcord,
        email,
        password,
        true,
      );
    } catch (err) {
      throw new InternalServerErrorException({
        message: 'register device failed',
        err,
      });
    }
  }

  @Put('_login')
  async login(): Promise<void> {
    const { email, password, clientName, deviceId } = await this.service.getOne(
      1,
    );

    if (!email || !password) {
      throw new ForbiddenException({
        message: 'Email and password is not existed',
      });
    }

    if (!this.botService.talkClient) {
      this.botService.talkClient = new TalkClient(clientName, encode(deviceId));
    }

    if (this.botService.talkClient.Logon) {
      throw new BadRequestException({
        message: 'Already logged on',
      });
    }

    try {
      await this.botService.talkClient.login(email, password);
      this.botService.talkClient.on('message', (chat: Chat) => {
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

  @Put('_logout')
  async logout(): Promise<void> {
    const { email, password } = await this.service.getOne(1);

    if (!email || !password) {
      throw new ForbiddenException({
        message: 'Email and password is not existed',
      });
    }

    if (!this.botService.talkClient || !this.botService.talkClient.Logon) {
      throw new BadRequestException({
        message: 'Not logged on yet',
      });
    }

    try {
      await this.botService.talkClient.logout();
    } catch (err) {
      throw new InternalServerErrorException({
        message: 'register device failed',
        err,
      });
    }
  }
}
