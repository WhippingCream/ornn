import { OrnnUsersEntity } from '@lib/db/entities/ornn/user.entity';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OrnnUsersService } from 'libs/ornn/src/users/users.service';
import {
  AuthError,
  AuthErrorCode,
  OauthError,
  OauthErrorCode,
} from './auth.errors';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { OauthCredentialsService } from './oauth-credentials.service';
import { OauthService } from './oauth.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private oauthService: OauthService,
    private ornnUsersService: OrnnUsersService,
    private oauthCredentialsService: OauthCredentialsService,
  ) {}

  async signUp(dto: SignUpDto): Promise<void> {
    const {
      nickname,
      profileImage,
    } = await this.oauthService.getKakaoUserInfoByAdminKey(dto.memberId);

    const oauthCredential = await this.oauthCredentialsService.findOne(dto);

    if (oauthCredential) {
      throw new OauthError(OauthErrorCode.ExistedCredential);
    }

    const runner = this.ornnUsersService.createQueryRunner();
    await runner.startTransaction();
    try {
      const userId = await this.ornnUsersService.createOne(
        {
          ...dto,
          username: nickname,
          profileImage,
        },
        runner,
      );

      if (!userId) {
        throw new AuthError(AuthErrorCode.UserCreationFailed);
      }

      const credentialId = await this.oauthCredentialsService.createOne(
        { ...dto, ornnUserId: userId },
        runner,
      );

      if (!credentialId) {
        throw new AuthError(AuthErrorCode.CredentialRegistrationFailed);
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
      throw new OauthError(OauthErrorCode.CannotFindCredential);
    }

    const kakaoUser = await this.oauthService.getKakaoUserInfoByAdminKey(
      credential.memberId,
    );

    if (!kakaoUser) {
      throw new OauthError(OauthErrorCode.KakaoGetMeByAdminKey);
    }

    const user = await this.ornnUsersService.getOne(credential.ornnUserId);

    if (!user) {
      throw new AuthError(AuthErrorCode.NotRegistered);
    }

    return {
      ...user,
      accessToken: this.jwtService.sign({
        username: user.username,
        sub: user.id,
      }),
    };
  }
}
