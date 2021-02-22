import { ModelBaseController } from '@db/base/base.controller';
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  InternalServerErrorException,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { encode } from 'js-base64';
import { AuthApiClient, KnownAuthStatusCode } from 'node-kakao';
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
        this.authService.client = await AuthApiClient.create(
          clientName,
          encode(deviceId),
        );
      }

      const loginForm = {
        email,
        password,
        forced: true,
      };

      const loginRes = await this.authService.client.login(loginForm);

      if (loginRes.success) {
        throw new BadRequestException('Device already registered!');
      }

      if (loginRes.status !== KnownAuthStatusCode.DEVICE_NOT_REGISTERED) {
        throw new BadRequestException(
          `Web login failed with status: ${loginRes.status}`,
        );
      }

      const passcodeRes = await this.authService.client.requestPasscode(
        loginForm,
      );

      if (!passcodeRes.success) {
        throw new InternalServerErrorException(
          `Passcode request failed with status: ${passcodeRes.status}`,
        );
      }

      this.authService.client.requestPasscode(loginForm);
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
        this.authService.client = await AuthApiClient.create(
          clientName,
          deviceId,
        );
      }

      const loginForm = {
        email,
        password,
        forced: true,
      };

      const res = await this.authService.client.registerDevice(
        loginForm,
        passcord,
        true,
      );

      if (!res.success) {
        throw new BadRequestException(
          `Device registration failed with status: ${res.status}`,
        );
      }
    } catch (err) {
      throw new InternalServerErrorException({
        message: 'register device failed',
        err,
      });
    }
  }
}
