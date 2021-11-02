import { ModelBaseController } from '@lib/db/base/base.controller';
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
    const credential = await this.credentialService.getOne(1);

    if (!credential || !credential.email || !credential.password) {
      throw new ForbiddenException({
        message: 'Email and password is not existed',
      });
    }

    try {
      if (!this.authService.client) {
        this.authService.client = await AuthApiClient.create(
          credential.clientName,
          encode(credential.deviceId),
        );
      }

      const loginForm = {
        email: credential.email,
        password: credential.password,
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
    const credential = await this.credentialService.getOne(1);

    if (!credential || !credential.email || !credential.password) {
      throw new ForbiddenException({
        message: 'Email and password is not existed',
      });
    }

    try {
      if (!this.authService.client) {
        this.authService.client = await AuthApiClient.create(
          credential.clientName,
          credential.deviceId,
        );
      }

      const loginForm = {
        email: credential.email,
        password: credential.password,
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
