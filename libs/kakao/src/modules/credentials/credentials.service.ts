import { Connection } from 'typeorm';

import { InjectConnection } from '@nestjs/typeorm';
import { KakaoCredentialsEntity } from '@lib/db/entities/kakao/credential.entity';
import { ModelBaseService } from '@lib/db/base/base.service';
import { Injectable } from '@nestjs/common';
import { CONNECTION } from '@lib/db/constants/connection';

@Injectable()
export class KakaoCredentialService extends ModelBaseService<KakaoCredentialsEntity> {
  constructor(
    @InjectConnection(CONNECTION.DEFAULT_NAME)
    protected readonly connection: Connection,
  ) {
    super(connection, KakaoCredentialsEntity);
  }
}
