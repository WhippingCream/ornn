import { OrnnUsersEntity } from '@lib/db/entities/ornn/user.entity';
import { OrnnErrorMeta } from '@lib/utils/interfaces';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OrnnUsersService } from 'libs/ornn/src/users/users.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { OauthCredentialsService } from './oauth-credentials.service';

@Injectable()
export class AuthService {
  constructor(
    protected oauthCredentialsService: OauthCredentialsService,
    private jwtService: JwtService,
    private ornnUsersService: OrnnUsersService,
  ) {}

  async signUp(dto: SignUpDto): Promise<OrnnUsersEntity | OrnnErrorMeta> {
    const oauthMeta = await this.oauthCredentialsService.findOne(dto);

    if (oauthMeta) {
      return {
        code: 'ORNN_ERROR__EXISTED_OAUTH_CREDENTIAL',
        message: 'Already existed credential',
      };
    }

    let insertedUserId: number;

    const runner = this.ornnUsersService.createQueryRunner();
    await runner.startTransaction();
    try {
      const userInsertRes = await this.ornnUsersService.createOne(dto, runner);

      if (!userInsertRes.identifiers.length) {
        throw new Error('fail to insert user');
      }

      insertedUserId = userInsertRes.identifiers[0].id;

      const oauthCredentialInsertRes = await this.oauthCredentialsService.createOne(
        { ...dto, ornnUserId: insertedUserId },
        runner,
      );

      if (!oauthCredentialInsertRes.identifiers.length) {
        throw new Error('fail to insert oauth credential');
      }

      await runner.commitTransaction();
    } catch (err) {
      await runner.rollbackTransaction();
      return {
        code: 'ORNN_ERROR',
        message: err,
      };
    } finally {
      await runner.release();
    }

    const insertedUser = await this.ornnUsersService.getOne(insertedUserId);

    return insertedUser;
  }

  async signIn(
    dto: SignInDto,
  ): Promise<(OrnnUsersEntity & { accessToken: string }) | OrnnErrorMeta> {
    const oauthMeta = await this.oauthCredentialsService.findOne(dto);

    if (!oauthMeta) {
      return null;
    }

    const user = await this.ornnUsersService.getOne(oauthMeta.ornnUserId);

    return {
      ...user,
      accessToken: this.jwtService.sign({
        username: user.username,
        sub: user.id,
      }),
    };
  }
}
