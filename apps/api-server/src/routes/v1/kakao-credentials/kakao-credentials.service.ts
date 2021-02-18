import { Connection } from 'typeorm';

import { InjectConnection } from '@nestjs/typeorm';
import { KakaoCredentialEntity } from '@db/entities/kakaoTalk/credential.entity';
import { ModelBaseService } from '@db/base/base.service';
import { Injectable } from '@nestjs/common';
import { CONNECTION } from '@db/constants/connection';

@Injectable()
export class KakaoCredentialService extends ModelBaseService<KakaoCredentialEntity> {
  constructor(
    @InjectConnection(CONNECTION.DEFAULT_NAME)
    protected readonly connection: Connection,
  ) {
    super(connection, KakaoCredentialEntity);
  }
}
