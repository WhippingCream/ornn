import { ModelBaseService } from '@lib/db/base/base.service';
import { CONNECTION } from '@lib/db/constants/connection';
import { OauthCredentialsEntity } from '@lib/db/entities/oauth/credentials.entity';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection, QueryRunner } from 'typeorm';
import { OauthCredential } from './types';

@Injectable()
export class OauthCredentialsService extends ModelBaseService<OauthCredentialsEntity> {
  constructor(
    @InjectConnection(CONNECTION.DEFAULT_NAME)
    protected readonly connection: Connection,
  ) {
    super(connection, OauthCredentialsEntity);
  }

  async findOne(
    credential: OauthCredential,
    runner?: QueryRunner,
  ): Promise<OauthCredentialsEntity> {
    const builder = this.createQueryBuilder(runner);
    const result = await builder
      .where('provider = :provider', credential)
      .andWhere('memberId = :memberId')
      .getOne();
    return result;
  }
}
