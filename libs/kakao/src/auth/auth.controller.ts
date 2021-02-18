import { ModelBaseController } from '@db/base/base.controller';
import {
  Body,
  Controller,
  ForbiddenException,
  InternalServerErrorException,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { encode } from 'js-base64';
import { AuthClient, DefaultConfiguration } from 'node-kakao';
import { KakaoCredentialService } from '../credentials/credentials.service';
import { KakaoAuthService } from './auth.service';
import { KakaoRegisterDeviceDto } from './dto/register-device.dto';

@ApiTags('카카오 Auth 기능 v1')
@Controller('/api/v1/kakao/auth')
export class KakaoAuthController extends ModelBaseController {
  constructor(
    protected credentialService: KakaoCredentialService,
    protected authService: KakaoAuthService,
  ) {
    super();
  }

  @Put('request-passcord')
  async requestPasscord(): Promise<void> {
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

    try {
      if (!this.authService.client) {
        this.authService.client = new AuthClient(clientName, encode(deviceId), {
          Configuration: DefaultConfiguration,
        });
      }
      this.authService.client.requestPasscode(email, password);
    } catch (err) {
      throw new InternalServerErrorException({
        message: 'request passcord failed',
        err,
      });
    }
  }

  @Put('register-device')
  async registerDevice(
    @Body() { passcord }: KakaoRegisterDeviceDto,
  ): Promise<void> {
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

    try {
      if (!this.authService.client) {
        this.authService.client = new AuthClient(clientName, encode(deviceId), {
          Configuration: DefaultConfiguration,
        });
      }
      await this.authService.client.registerDevice(
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
}
