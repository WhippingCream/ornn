import {
  AuthError,
  AuthErrorCode,
  OauthError,
  OauthErrorCode,
} from './auth.errors';

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OauthCredentialsService } from './oauth-credentials.service';
import { OauthService } from './oauth.service';
import { OrnnUsersEntity } from '@lib/db/entities/ornn/user.entity';
import { OrnnUsersService } from 'libs/ornn/src/users/users.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private oauthService: OauthService,
    private ornnUsersService: OrnnUsersService,
    private oauthCredentialsService: OauthCredentialsService,
  ) {}

  async signUp(dto: SignUpDto): Promise<void> {
    const memberId = await this.oauthService.validateKakaoUser(dto.memberId);

    if (!memberId || memberId !== dto.memberId) {
      throw new OauthError(400, OauthErrorCode.KakaoUserValidationFailed);
    }

    const oauthCredential = await this.oauthCredentialsService.findOne(dto);

    if (oauthCredential) {
      throw new OauthError(400, OauthErrorCode.ExistedCredential);
    }

    const runner = this.ornnUsersService.createQueryRunner();
    await runner.startTransaction();
    try {
      const userId = await this.ornnUsersService.createOne(dto, runner);

      if (!userId) {
        throw new AuthError(500, AuthErrorCode.UserCreationFailed);
      }

      const credentialId = await this.oauthCredentialsService.createOne(
        { ...dto, ornnUserId: userId },
        runner,
      );

      if (!credentialId) {
        throw new AuthError(500, AuthErrorCode.CredentialRegistrationFailed);
      }

      await runner.commitTransaction();
    } catch (e) {
      await runner.rollbackTransaction();
      await runner.release();
    } finally {
      await runner.release();
    }
  }

  async signIn(
    dto: SignInDto,
  ): Promise<OrnnUsersEntity & { accessToken: string }> {
    const credential = await this.oauthCredentialsService.findOne(dto);
    if (!credential) {
      throw new OauthError(404, OauthErrorCode.CannotFindCredential);
    }

    const memberId = await this.oauthService.validateKakaoUser(dto.memberId);

    if (!memberId || memberId !== dto.memberId) {
      throw new OauthError(400, OauthErrorCode.KakaoUserValidationFailed);
    }

    const user = await this.ornnUsersService.getOne(credential.ornnUserId);

    if (!user) {
      throw new AuthError(400, AuthErrorCode.NotRegistered);
    }

    return {
      ...user,
      accessToken: this.jwtService.sign({
        username: user.username,
        sub: user.id,
      }),
    };
  }

  async withdrawal(userId: number): Promise<void> {
    const credential = await this.oauthCredentialsService.findOneByUserId(
      userId,
    );
    if (!credential) {
      throw new OauthError(404, OauthErrorCode.CannotFindCredential);
    }

    const user = await this.ornnUsersService.getOne(userId);

    if (!user) {
      throw new AuthError(400, AuthErrorCode.NotRegistered);
    }

    const runner = this.ornnUsersService.createQueryRunner();
    await runner.startTransaction();
    try {
      await this.ornnUsersService.removeOne(user.id, runner);
      await this.oauthCredentialsService.removeOne(credential.id, runner);
      await this.oauthService.unlinkKakaoUser(credential.memberId);

      await runner.commitTransaction();
    } catch (e) {
      await runner.rollbackTransaction();
      await runner.release();
      throw new AuthError(500, AuthErrorCode.UserCreationFailed);
    } finally {
      await runner.release();
    }
  }
}
